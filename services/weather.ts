import * as Location from 'expo-location';

export interface WeatherData {
  temperature: number;
  weatherCode: number;
  city: string;
  isDay: boolean;
}

export async function fetchWeather(): Promise<WeatherData | null> {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return null;
    }

    let location = await Location.getCurrentPositionAsync({});
    const lat = location.coords.latitude;
    const lon = location.coords.longitude;

    // Get city name using reverse geocoding
    let city = 'Unknown';
    const geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
    if (geocode && geocode.length > 0) {
      city = geocode[0].city || geocode[0].subregion || geocode[0].region || 'Unknown';
    }

    // Call Open-Meteo for free weather data (no API key required)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,is_day,weather_code&temperature_unit=fahrenheit`;
    const response = await fetch(url);
    const data = await response.json();

    if (data && data.current) {
      return {
        temperature: Math.round(data.current.temperature_2m),
        weatherCode: data.current.weather_code,
        city: city,
        isDay: data.current.is_day === 1,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}
