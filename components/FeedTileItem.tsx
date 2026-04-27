import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import * as Network from 'expo-network';
import { useFeedStore } from '../store/useFeedStore';
import { FeedTile } from '../models/Tile';
import { FontAwesome } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import * as Linking from 'expo-linking';
import { useVideoPlayer, VideoView } from 'expo-video';

interface FeedTileItemProps {
  item: FeedTile;
  index: number;
}

export function FeedTileItem({ item, index }: FeedTileItemProps) {
  const isFullWidth = index === 0;
  // If it has a video URL, it conceptually "has an image" for sizing purposes
  const hasImage = !!item.imageUrl || !!item.videoUrl;
  
  const height = hasImage ? (isFullWidth ? 250 : 180 + Math.random() * 100) : undefined;
  
  const { preferences } = useFeedStore();
  const [shouldPlayVideo, setShouldPlayVideo] = React.useState(false);

  React.useEffect(() => {
    if (!item.videoUrl) return;

    if (preferences.autoplayVideos === 'never') {
      setShouldPlayVideo(false);
      return;
    }

    if (preferences.autoplayVideos === 'always') {
      setShouldPlayVideo(true);
      return;
    }

    // if 'wifi'
    const checkNetwork = async () => {
      try {
        const state = await Network.getNetworkStateAsync();
        setShouldPlayVideo(state.type === Network.NetworkStateType.WIFI);
      } catch (e) {
        // Fallback safely to not playing
        setShouldPlayVideo(false);
      }
    };
    checkNetwork();
  }, [preferences.autoplayVideos, item.videoUrl]);

  const player = useVideoPlayer(item.videoUrl || null, p => {
    p.loop = true;
    p.muted = true;
  });

  React.useEffect(() => {
    if (shouldPlayVideo) {
      player.play();
    } else {
      player.pause();
    }
  }, [shouldPlayVideo, player]);

  const handlePress = () => {
    Linking.openURL(item.url);
  };

  const renderIcon = () => {
    if (item.sourceIconUrl) {
      return (
        <Image 
          source={{ uri: item.sourceIconUrl }} 
          style={{ width: 14, height: 14, borderRadius: 2 }} 
          contentFit="cover"
        />
      );
    }

    switch (item.source) {
      case 'reddit':
        return <FontAwesome name="reddit" size={14} color="#FF4500" />;
      case 'bluesky':
        return <FontAwesome name="cloud" size={14} color="#0085FF" />;
      case 'mastodon':
        return <FontAwesome name="comments" size={14} color="#5A32FA" />;
      case 'news':
        return <FontAwesome name="newspaper-o" size={14} color="#CCCCCC" />;
      default:
        return null;
    }
  };

  const getBackgroundColor = () => {
    switch (item.source) {
      case 'reddit': return '#FF4500';
      case 'bluesky': return '#0085FF';
      case 'mastodon': return '#5A32FA';
      default: return '#333333';
    }
  };

  return (
    <Pressable 
      onPress={handlePress} 
      style={[
        styles.container, 
        { height },
        !hasImage && { backgroundColor: getBackgroundColor() }
      ]}
    >
      {shouldPlayVideo && item.videoUrl ? (
        <VideoView
          player={player}
          style={styles.image}
          contentFit="cover"
          nativeControls={false}
        />
      ) : hasImage && item.imageUrl ? (
        <Image 
          source={item.imageUrl} 
          style={styles.image} 
          contentFit="cover"
        />
      ) : item.authorAvatarUrl ? (
        <Image 
          source={item.authorAvatarUrl} 
          style={[styles.image, { opacity: 0.8 }]} 
          contentFit="cover"
          blurRadius={50}
        />
      ) : null}

      <View style={[styles.overlay, !hasImage && styles.overlayRelative]}>
        <View style={styles.content}>
          <Text 
            style={[styles.title, !hasImage && styles.titleNoImage]} 
            // If it has an image, truncate text to save space. 
            // If it's a text post (no image), show more of the text.
            numberOfLines={hasImage ? (isFullWidth ? 3 : 2) : 6}
          >
            {item.title}
          </Text>
          {item.description && (
            <Text 
              style={[styles.description, !hasImage && styles.descriptionNoImage]} 
              numberOfLines={hasImage ? 2 : 6}
            >
              {item.description}
            </Text>
          )}
        </View>
        
        <View style={styles.footer}>
          <View style={styles.metaLeft}>
            {renderIcon()}
            <View>
              <Text style={[styles.metaText, !hasImage && styles.metaTextNoImage]}>
                {item.author}
              </Text>
              <Text style={[styles.metaTime, !hasImage && styles.metaTextNoImage]}>
                {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 4,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)', // Dark gradient effect
    justifyContent: 'flex-end',
    padding: 12,
  },
  overlayRelative: {
    position: 'relative',
    backgroundColor: 'transparent', // Let the container's solid color show through
    flex: 1, // Take up available space
    paddingTop: 16, // Give some breathing room at the top
  },
  content: {
    marginBottom: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    lineHeight: 22,
  },
  titleNoImage: {
    textShadowColor: 'transparent',
    textShadowRadius: 0,
    fontWeight: '600',
    fontSize: 15,
  },
  description: {
    color: '#DDDDDD',
    fontSize: 14,
    marginTop: 4,
  },
  descriptionNoImage: {
    color: 'rgba(255,255,255,0.9)',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto', // Pushes footer to the bottom if container grows
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '500',
  },
  metaTime: {
    color: '#AAAAAA',
    fontSize: 10,
    marginTop: 1,
  },
  metaTextNoImage: {
    color: 'rgba(255,255,255,0.8)',
  },
});
