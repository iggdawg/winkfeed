import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useFeedStore } from '../store/useFeedStore';
import { FeedTileItem } from './FeedTileItem';
import { fetchRedditFeed } from '../services/reddit';
import { fetchBlueskyFeed } from '../services/bluesky';
import { fetchNewsFeed } from '../services/news';
import { fetchMastodonFeed } from '../services/mastodon';

export default function MasonryFeed() {
  const { tiles, isLoading, setTiles, setLoading, setError, preferences } = useFeedStore();

  const loadFeeds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchPromises = [];
      
      if (preferences.sources.reddit) {
        fetchPromises.push(fetchRedditFeed(preferences.redditSubreddits));
      }
      if (preferences.sources.bluesky) {
        fetchPromises.push(fetchBlueskyFeed());
      }
      if (preferences.sources.news) {
        fetchPromises.push(fetchNewsFeed(preferences.newsTopics, preferences.newsBlacklistedSources));
      }
      if (preferences.sources.mastodon) {
        fetchPromises.push(fetchMastodonFeed());
      }

      const results = await Promise.allSettled(fetchPromises);
      
      const feedArrays: any[][] = [];
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.length > 0) {
          // Sort each source chronologically first
          const sorted = [...result.value].sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          feedArrays.push(sorted);
        } else if (result.status === 'rejected') {
          console.error('Failed to fetch a feed:', result.reason);
        }
      });

      let combinedFeeds: any[] = [];
      // Mingle the feeds using round-robin so sources are perfectly mixed on screen
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
      setError('Failed to load feeds');
    } finally {
      setLoading(false);
    }
  }, [preferences, setTiles, setLoading, setError]);

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
        masonry
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
