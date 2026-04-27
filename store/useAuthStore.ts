import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export interface AuthState {
  blueskyHandle: string | null;
  blueskyAppPassword: string | null;
  redditAccessToken: string | null;
  mastodonInstance: string | null;
  mastodonToken: string | null;
  
  // Actions
  setBlueskyCredentials: (handle: string, password: string) => Promise<void>;
  clearBlueskyCredentials: () => Promise<void>;
  setRedditToken: (token: string) => Promise<void>;
  clearRedditToken: () => Promise<void>;
  setMastodonCredentials: (instance: string, token: string) => Promise<void>;
  clearMastodonCredentials: () => Promise<void>;
  loadCredentials: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  blueskyHandle: null,
  blueskyAppPassword: null,
  redditAccessToken: null,
  mastodonInstance: null,
  mastodonToken: null,

  setBlueskyCredentials: async (handle, password) => {
    await SecureStore.setItemAsync('blueskyHandle', handle);
    await SecureStore.setItemAsync('blueskyPassword', password);
    set({ blueskyHandle: handle, blueskyAppPassword: password });
  },

  clearBlueskyCredentials: async () => {
    await SecureStore.deleteItemAsync('blueskyHandle');
    await SecureStore.deleteItemAsync('blueskyPassword');
    set({ blueskyHandle: null, blueskyAppPassword: null });
  },

  setRedditToken: async (token) => {
    await SecureStore.setItemAsync('redditToken', token);
    set({ redditAccessToken: token });
  },

  clearRedditToken: async () => {
    await SecureStore.deleteItemAsync('redditToken');
    set({ redditAccessToken: null });
  },

  setMastodonCredentials: async (instance, token) => {
    await SecureStore.setItemAsync('mastodonInstance', instance);
    await SecureStore.setItemAsync('mastodonToken', token);
    set({ mastodonInstance: instance, mastodonToken: token });
  },

  clearMastodonCredentials: async () => {
    await SecureStore.deleteItemAsync('mastodonInstance');
    await SecureStore.deleteItemAsync('mastodonToken');
    set({ mastodonInstance: null, mastodonToken: null });
  },

  loadCredentials: async () => {
    const handle = await SecureStore.getItemAsync('blueskyHandle');
    const password = await SecureStore.getItemAsync('blueskyPassword');
    const redditToken = await SecureStore.getItemAsync('redditToken');
    const mastodonInstance = await SecureStore.getItemAsync('mastodonInstance');
    const mastodonToken = await SecureStore.getItemAsync('mastodonToken');
    
    set({
      blueskyHandle: handle,
      blueskyAppPassword: password,
      redditAccessToken: redditToken,
      mastodonInstance,
      mastodonToken,
    });
  }
}));
