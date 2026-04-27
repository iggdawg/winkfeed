import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useFeedStore } from '../store/useFeedStore';
import { FeedTileItem } from './FeedTileItem';
import { fetchBlueskyFeed } from '../services/bluesky';
import { fetchMastodonFeed } from '../services/mastodon';
import { fetchRedditFeed } from '../services/reddit';
import { FeedTile } from '../models/Tile';

export default function MediaFeed() {
  const { preferences } = useFeedStore();
  const [tiles, setTiles] = useState<FeedTile[]>([]);
  const [isLoading, setLoading] = useState(false);

  const loadFeeds = useCallback(async () => {
    setLoading(true);
    try {
      const fetchPromises = [];
      
      if (preferences.sources.reddit) {
        fetchPromises.push(fetchRedditFeed(preferences.redditSubreddits));
      }
      if (preferences.sources.bluesky) {
        fetchPromises.push(fetchBlueskyFeed());
      }
      if (preferences.sources.mastodon) {
        fetchPromises.push(fetchMastodonFeed());
      }

      const results = await Promise.allSettled(fetchPromises);
      
      const feedArrays: FeedTile[][] = [];
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.length > 0) {
          // Filter to ONLY media posts
          const mediaOnly = result.value.filter(item => item.imageUrl || item.videoUrl);
          
          // Sort chronologically
          const sorted = mediaOnly.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          feedArrays.push(sorted);
        }
      });

      let combinedFeeds: FeedTile[] = [];
      // Mingle the feeds using round-robin
      let hasMore = true;
      let i = 0;
      while (hasMore) {
        hasMore = false;
        for (const arr of feedArrays) {
          if (i < arr.length) {
            combinedFeeds.push(arr[i]);
            hasMore = true;
          }
        }
        i++;
      }

      setTiles(combinedFeeds);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [preferences]);

  useEffect(() => {
    loadFeeds();
  }, [loadFeeds]);

  if (isLoading && tiles.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0085FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlashList
        data={tiles}
        numColumns={2}
        renderItem={({ item, index }) => <FeedTileItem item={item} index={index} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl 
            refreshing={isLoading && tiles.length > 0} 
            onRefresh={loadFeeds}
            tintColor="#FFFFFF"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  listContainer: {
    padding: 4,
  },
});
