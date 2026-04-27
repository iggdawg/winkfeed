import { create } from 'zustand';
import { FeedTile, UserPreferences } from '../models/Tile';

interface FeedState {
  tiles: FeedTile[];
  isLoading: boolean;
  error: string | null;
  preferences: UserPreferences;
  
  // Actions
  setTiles: (tiles: FeedTile[]) => void;
  addTiles: (tiles: FeedTile[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleSource: (source: keyof UserPreferences['sources']) => void;
  addSubreddit: (sub: string) => void;
  removeSubreddit: (sub: string) => void;
  addNewsTopic: (topic: string) => void;
  removeNewsTopic: (topic: string) => void;
  addNewsBlacklist: (source: string) => void;
  removeNewsBlacklist: (source: string) => void;
  setAutoplayVideos: (pref: 'always' | 'wifi' | 'never') => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  tiles: [],
  isLoading: false,
  error: null,
  preferences: {
    sources: {
      reddit: true,
      bluesky: true,
      news: true,
      mastodon: true,
    },
    redditSubreddits: ['popular', 'news', 'technology', 'pics'],
    newsTopics: [],
    newsBlacklistedSources: [],
    autoplayVideos: 'wifi',
  },

  setTiles: (tiles) => set({ tiles }),
  addTiles: (newTiles) => set((state) => ({ 
    tiles: [...state.tiles, ...newTiles].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  toggleSource: (source) => set((state) => ({
    preferences: {
      ...state.preferences,
      sources: {
        ...state.preferences.sources,
        [source]: !state.preferences.sources[source],
      }
    }
  })),
  
  addSubreddit: (sub) => set((state) => ({
    preferences: {
      ...state.preferences,
      redditSubreddits: [...new Set([...state.preferences.redditSubreddits, sub])]
    }
  })),
  
  removeSubreddit: (sub) => set((state) => ({
    preferences: {
      ...state.preferences,
      redditSubreddits: state.preferences.redditSubreddits.filter(s => s !== sub)
    }
  })),

  addNewsTopic: (topic) => set((state) => ({
    preferences: {
      ...state.preferences,
      newsTopics: [...new Set([...state.preferences.newsTopics, topic])]
    }
  })),

  removeNewsTopic: (topic) => set((state) => ({
    preferences: {
      ...state.preferences,
      newsTopics: state.preferences.newsTopics.filter(t => t !== topic)
    }
  })),

  addNewsBlacklist: (source) => set((state) => ({
    preferences: {
      ...state.preferences,
      newsBlacklistedSources: [...new Set([...state.preferences.newsBlacklistedSources, source])]
    }
  })),

  removeNewsBlacklist: (source) => set((state) => ({
    preferences: {
      ...state.preferences,
      newsBlacklistedSources: state.preferences.newsBlacklistedSources.filter(s => s !== source)
    }
  })),

  setAutoplayVideos: (pref) => set((state) => ({
    preferences: {
      ...state.preferences,
      autoplayVideos: pref
    }
  })),
}));
