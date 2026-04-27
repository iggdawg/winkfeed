import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchWeather, WeatherData } from '../services/weather';
import { useFeedStore } from '../store/useFeedStore';

export function BlinkHeader() {
  const { preferences } = useFeedStore();
  const insets = useSafeAreaInsets();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Fetch weather on mount
    const getWeatherData = async () => {
      const data = await fetchWeather();
      if (data) setWeather(data);
    };
    getWeatherData();
  }, []);

  const getWeatherUI = (code: number, isDay: boolean) => {
    // WMO Weather interpretation codes
    if (code === 0) { // Clear sky
      return {
        icon: isDay ? 'sun-o' : 'moon-o',
        colors: isDay ? ['#56CCF2', '#2F80ED'] : ['#141E30', '#243B55']
      };
    } else if (code >= 1 && code <= 3) { // Cloudy
      return {
        icon: 'cloud',
        colors: isDay ? ['#8e9eab', '#5c6e7a'] : ['#2C3E50', '#000000']
      };
    } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) { // Rain
      return {
        icon: 'tint',
        colors: ['#373B44', '#1E4A7D']
      };
    } else if (code >= 71 && code <= 77) { // Snow
      return {
        icon: 'snowflake-o',
        colors: ['#E0EAFC', '#CFDEF3']
      };
    } else if (code >= 95) { // Thunderstorm
      return {
        icon: 'bolt',
        colors: ['#232526', '#414345']
      };
    }
    // Fallback
    return {
      icon: 'thermometer',
      colors: ['#4CA1AF', '#2C3E50']
    };
  };

  const ui = weather ? getWeatherUI(weather.weatherCode, weather.isDay) : { icon: 'clock-o', colors: ['#1E1E1E', '#000000'] };

  return (
    <LinearGradient
      colors={ui.colors as [string, string]}
      style={[styles.container, { paddingTop: Math.max(insets.top, 20) + 10 }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.topRow}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{format(currentTime, 'h:mm')}</Text>
          <Text style={styles.ampmText}>{format(currentTime, 'a')}</Text>
        </View>
        <View style={styles.weatherContainer}>
          {weather && (
            <>
              <FontAwesome name={ui.icon as any} size={28} color="#FFFFFF" style={styles.weatherIcon} />
              <Text style={styles.tempText}>{weather.temperature}°</Text>
            </>
          )}
        </View>
      </View>
      <View style={styles.bottomRow}>
        <Text style={styles.dateText}>{format(currentTime, 'EEEE, MMMM d')}</Text>
        <Text style={styles.cityText}>{weather ? weather.city : 'Loading location...'}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  timeText: {
    fontSize: 56,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: -2,
  },
  ampmText: {
    fontSize: 20,
    fontWeight: '400',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherIcon: {
    marginRight: 10,
    marginTop: 4,
  },
  tempText: {
    fontSize: 42,
    fontWeight: '300',
    color: '#FFFFFF',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'uppercase',
  },
  cityText: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.8)',
  }
});
