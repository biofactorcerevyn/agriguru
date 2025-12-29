import { useState, useEffect } from 'react';
import axios from 'axios';

interface CurrentWeather {
  cityName: string;
  country: string;
  lat: number;
  lon: number;
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  description: string;
  icon: string;
  pressure: number;
  visibility: number;
  sunrise: number;
  sunset: number;
}

interface ForecastData {
  hourly: {
    time: string;
    temp: number;
    icon: string;
  }[];
  daily: {
    date: string;
    day: string;
    temp_max: number;
    temp_min: number;
    icon: string;
    description: string;
  }[];
}

interface WeatherData {
  currentWeather: CurrentWeather | null;
  forecastData: ForecastData | null;
  loading: boolean;
  error: string | null;
  userLocation: { lat: number; lon: number } | null;
}

export const useWeatherData = (selectedLocation: string): WeatherData => {
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  // Get user's location on initial load
  useEffect(() => {
    if (navigator.geolocation && !selectedLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lon: longitude });
          fetchWeatherData(latitude, longitude);
        },
        (err) => {
          console.error("Error getting location:", err);
          setError("Unable to access your location. Please select a city manually.");
          setLoading(false);
        }
      );
    }
  }, []);

  // Fetch weather data when selectedLocation changes
  useEffect(() => {
    if (selectedLocation) {
      const [lat, lon] = selectedLocation.split(',').map(Number);
      fetchWeatherData(lat, lon);
    }
  }, [selectedLocation]);

  const fetchWeatherData = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
      
      // Fetch current weather
      const currentResponse = await axios.get(
        "https://api.openweathermap.org/data/2.5/weather",
        {
          params: {
            lat,
            lon,
            appid: API_KEY,
            units: "metric",
          },
        }
      );

      // Fetch forecast data
      const forecastResponse = await axios.get(
        "https://api.openweathermap.org/data/2.5/forecast",
        {
          params: {
            lat,
            lon,
            appid: API_KEY,
            units: "metric",
          },
        }
      );

      // Process current weather data
      const current = currentResponse.data;
      setCurrentWeather({
        cityName: current.name,
        country: current.sys.country,
        lat: current.coord.lat,
        lon: current.coord.lon,
        temp: current.main.temp,
        feels_like: current.main.feels_like,
        humidity: current.main.humidity,
        wind_speed: current.wind.speed,
        description: current.weather[0].description,
        icon: current.weather[0].icon,
        pressure: current.main.pressure,
        visibility: current.visibility,
        sunrise: current.sys.sunrise,
        sunset: current.sys.sunset,
      });

      // Process forecast data
      const forecast = forecastResponse.data;
      
      // Process hourly forecast (next 24 hours)
      const hourlyData = forecast.list.slice(0, 8).map((item: any) => ({
        time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temp: Math.round(item.main.temp),
        icon: item.weather[0].icon,
      }));

      // Process daily forecast
      const dailyMap = new Map();
      forecast.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000).toISOString().split('T')[0];
        if (!dailyMap.has(date)) {
          dailyMap.set(date, {
            temp_max: item.main.temp_max,
            temp_min: item.main.temp_max,
            icon: item.weather[0].icon,
            description: item.weather[0].description,
          });
        } else {
          const existing = dailyMap.get(date);
          if (item.main.temp_max > existing.temp_max) {
            existing.temp_max = item.main.temp_max;
            existing.icon = item.weather[0].icon;
            existing.description = item.weather[0].description;
          }
          if (item.main.temp_min < existing.temp_min) {
            existing.temp_min = item.main.temp_min;
          }
          dailyMap.set(date, existing);
        }
      });

      const dailyData = Array.from(dailyMap.entries()).map(([date, data]) => {
        const day = new Date(date).toLocaleDateString(undefined, { weekday: 'short' });
        return {
          date,
          day,
          temp_max: Math.round(data.temp_max),
          temp_min: Math.round(data.temp_min),
          icon: data.icon,
          description: data.description,
        };
      }).slice(0, 5);

      setForecastData({
        hourly: hourlyData,
        daily: dailyData,
      });

    } catch (err) {
      console.error("Error fetching weather data:", err);
      setError("Failed to fetch weather data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return { currentWeather, forecastData, loading, error, userLocation };
};