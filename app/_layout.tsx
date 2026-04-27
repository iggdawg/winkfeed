import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/useAuthStore';
import { loginBluesky } from '@/services/bluesky';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Re-hydrate credentials and login quietly on startup
    const initAuth = async () => {
      try {
        const state = useAuthStore.getState();
        await state.loadCredentials();
        
        const { blueskyHandle, blueskyAppPassword } = useAuthStore.getState();
        if (blueskyHandle && blueskyAppPassword) {
          await loginBluesky(blueskyHandle, blueskyAppPassword);
        }
      } catch (e) {
        console.error('Failed to init auth on startup', e);
      } finally {
        setIsReady(true);
      }
    };
    initAuth();
  }, []);

  if (!isReady) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colorScheme === 'dark' ? '#000' : '#FFF' }]}>
        <ActivityIndicator size="large" color="#0085FF" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
