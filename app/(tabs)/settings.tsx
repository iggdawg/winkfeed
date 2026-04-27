import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Switch } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useFeedStore } from '../../store/useFeedStore';
import { FeedSource } from '../../models/Tile';
import { loginBluesky } from '../../services/bluesky';

export default function SettingsScreen() {
  const { 
    blueskyHandle, blueskyAppPassword, setBlueskyCredentials, clearBlueskyCredentials, 
    mastodonInstance, mastodonToken, setMastodonCredentials, clearMastodonCredentials,
    loadCredentials 
  } = useAuthStore();
  const { 
    preferences, 
    addSubreddit, 
    removeSubreddit,
    addNewsTopic,
    removeNewsTopic,
    addNewsBlacklist,
    removeNewsBlacklist,
    toggleSource,
    setAutoplayVideos
  } = useFeedStore();
  
  const [handleInput, setHandleInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [bskyStatus, setBskyStatus] = useState('');
  const [subredditInput, setSubredditInput] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [blacklistInput, setBlacklistInput] = useState('');

  const [mastodonInstanceInput, setMastodonInstanceInput] = useState('');
  const [mastodonTokenInput, setMastodonTokenInput] = useState('');
  const [mastodonStatus, setMastodonStatus] = useState('');

  useEffect(() => {
    loadCredentials();
  }, []);

  const handleBlueskyLogin = async () => {
    if (!handleInput || !passwordInput) return;
    
    setBskyStatus('Logging in...');
    const success = await loginBluesky(handleInput, passwordInput);
    if (success) {
      await setBlueskyCredentials(handleInput, passwordInput);
      setBskyStatus('Logged in successfully!');
      setHandleInput('');
      setPasswordInput('');
    } else {
      setBskyStatus('Login failed. Check credentials.');
    }
  };

  const handleBlueskyLogout = async () => {
    await clearBlueskyCredentials();
    setBskyStatus('Logged out.');
  };

  const handleMastodonLogin = async () => {
    if (!mastodonInstanceInput || !mastodonTokenInput) return;
    await setMastodonCredentials(mastodonInstanceInput, mastodonTokenInput);
    setMastodonStatus('Mastodon credentials saved!');
    setMastodonInstanceInput('');
    setMastodonTokenInput('');
  };

  const handleMastodonLogout = async () => {
    await clearMastodonCredentials();
    setMastodonStatus('Logged out.');
  };

  const handleAddSubreddit = () => {
    if (subredditInput.trim()) {
      const cleanSub = subredditInput.trim().replace(/^r\//, '');
      addSubreddit(cleanSub);
      setSubredditInput('');
    }
  };

  const handleAddTopic = () => {
    if (topicInput.trim()) {
      addNewsTopic(topicInput.trim());
      setTopicInput('');
    }
  };

  const handleAddBlacklist = () => {
    if (blacklistInput.trim()) {
      addNewsBlacklist(blacklistInput.trim());
      setBlacklistInput('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>WinkFeed Settings</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Enabled Sources</Text>
          {(['reddit', 'bluesky', 'news', 'mastodon'] as FeedSource[]).map((source) => (
            <View key={source} style={styles.switchRow}>
              <Text style={styles.switchLabel}>
                {source.charAt(0).toUpperCase() + source.slice(1)}
              </Text>
              <Switch
                value={preferences.sources[source]}
                onValueChange={() => toggleSource(source)}
                trackColor={{ false: '#333', true: '#0085FF' }}
                thumbColor="#FFFFFF"
              />
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Playback Settings</Text>
          <Text style={styles.label}>Autoplay Videos</Text>
          <View style={styles.segmentedControl}>
            {(['always', 'wifi', 'never'] as const).map((option) => {
              const isActive = preferences.autoplayVideos === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.segmentButton, isActive && styles.segmentButtonActive]}
                  onPress={() => setAutoplayVideos(option)}
                >
                  <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                    {option === 'always' ? 'Always' : option === 'wifi' ? 'Wi-Fi Only' : 'Never'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bluesky Integration</Text>
          {blueskyHandle ? (
            <View>
              <Text style={styles.text}>Logged in as: {blueskyHandle}</Text>
              <TouchableOpacity style={styles.buttonDanger} onPress={handleBlueskyLogout}>
                <Text style={styles.buttonText}>Logout Bluesky</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={styles.label}>Handle (e.g. user.bsky.social)</Text>
              <TextInput
                style={styles.input}
                value={handleInput}
                onChangeText={setHandleInput}
                autoCapitalize="none"
              />
              <Text style={styles.label}>App Password</Text>
              <TextInput
                style={styles.input}
                value={passwordInput}
                onChangeText={setPasswordInput}
                secureTextEntry
              />
              <TouchableOpacity style={styles.button} onPress={handleBlueskyLogin}>
                <Text style={styles.buttonText}>Save & Login</Text>
              </TouchableOpacity>
            </View>
          )}
          {bskyStatus ? <Text style={styles.statusText}>{bskyStatus}</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reddit Integration</Text>
          <Text style={styles.text}>
            Add subreddits you want to see in your feed.
          </Text>
          
          <View style={styles.subredditRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0, marginRight: 8 }]}
              value={subredditInput}
              onChangeText={setSubredditInput}
              placeholder="e.g. aww"
              placeholderTextColor="#666"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddSubreddit}>
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tagContainer}>
            {preferences.redditSubreddits.map((sub) => (
              <TouchableOpacity 
                key={sub} 
                style={styles.tag} 
                onPress={() => removeSubreddit(sub)}
              >
                <Text style={styles.tagText}>r/{sub} ✕</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>News Integration</Text>
          <Text style={styles.text}>
            Filter the top headlines. Add topics you care about, or blacklist specific news sources.
          </Text>
          
          <Text style={styles.label}>Topics (e.g. Android, AI)</Text>
          <View style={styles.subredditRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0, marginRight: 8 }]}
              value={topicInput}
              onChangeText={setTopicInput}
              placeholder="e.g. AI"
              placeholderTextColor="#666"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddTopic}>
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.tagContainer, { marginBottom: 16 }]}>
            {preferences.newsTopics.map((topic) => (
              <TouchableOpacity key={topic} style={styles.tag} onPress={() => removeNewsTopic(topic)}>
                <Text style={styles.tagText}>{topic} ✕</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Blacklisted Sources (e.g. The Verge)</Text>
          <View style={styles.subredditRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0, marginRight: 8 }]}
              value={blacklistInput}
              onChangeText={setBlacklistInput}
              placeholder="e.g. CNN"
              placeholderTextColor="#666"
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddBlacklist}>
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tagContainer}>
            {preferences.newsBlacklistedSources.map((source) => (
              <TouchableOpacity key={source} style={styles.tag} onPress={() => removeNewsBlacklist(source)}>
                <Text style={styles.tagText}>{source} ✕</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mastodon Integration</Text>
          <Text style={styles.text}>
            Enter your instance URL (e.g. mastodon.social) and a Personal Access Token generated in your Mastodon Development settings.
          </Text>
          {mastodonToken ? (
            <View>
              <Text style={styles.text}>Logged into instance: {mastodonInstance}</Text>
              <TouchableOpacity style={styles.buttonDanger} onPress={handleMastodonLogout}>
                <Text style={styles.buttonText}>Logout Mastodon</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={styles.label}>Instance URL</Text>
              <TextInput
                style={styles.input}
                value={mastodonInstanceInput}
                onChangeText={setMastodonInstanceInput}
                autoCapitalize="none"
                placeholder="mastodon.social"
                placeholderTextColor="#666"
              />
              <Text style={styles.label}>Access Token</Text>
              <TextInput
                style={styles.input}
                value={mastodonTokenInput}
                onChangeText={setMastodonTokenInput}
                secureTextEntry
              />
              <TouchableOpacity style={[styles.button, { backgroundColor: '#5A32FA' }]} onPress={handleMastodonLogin}>
                <Text style={styles.buttonText}>Save Credentials</Text>
              </TouchableOpacity>
            </View>
          )}
          {mastodonStatus ? <Text style={styles.statusText}>{mastodonStatus}</Text> : null}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scroll: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    marginTop: 20,
  },
  card: {
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  text: {
    color: '#CCCCCC',
    marginBottom: 12,
    lineHeight: 20,
  },
  label: {
    color: '#AAAAAA',
    marginBottom: 6,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#333333',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#0085FF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDanger: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#FF4500',
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  statusText: {
    color: '#4CD964',
    marginTop: 10,
    textAlign: 'center',
  },
  subredditRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#333333',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  switchLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 4,
    marginTop: 8,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  segmentButtonActive: {
    backgroundColor: '#0085FF',
  },
  segmentText: {
    color: '#AAAAAA',
    fontSize: 14,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  }
});
