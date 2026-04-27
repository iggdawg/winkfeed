export type FeedSource = 'reddit' | 'bluesky' | 'news' | 'mastodon';

export interface FeedTile {
  id: string;
  source: FeedSource;
  title: string;
  description?: string;
  imageUrl?: string;
  author: string;
  timestamp: string; // ISO string
  url: string;
  sourceIconUrl?: string;
  videoUrl?: string;
  authorAvatarUrl?: string;
  score?: number; // Upvotes, likes, etc.
}

export interface UserPreferences {
  sources: Record<FeedSource, boolean>;
  redditSubreddits: string[];
  newsTopics: string[];
  newsBlacklistedSources: string[];
  autoplayVideos: 'always' | 'wifi' | 'never';
}
