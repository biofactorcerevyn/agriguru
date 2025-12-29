console.log("Weather API Key:", import.meta.env.VITE_OPENWEATHER_API_KEY);

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Define types for our state
interface WeatherState {
  currentWeather: any | null;
  forecastData: any | null;
  rawForecastData: { list: any[] };
  airQuality: any | null;
  soilMoisture: number | null;
  lastRainfall: string | null;
  nextRainfall: string | null;
  locationName: string;
  selectedLocation: string;
  userLocation: { lat: number; lon: number } | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: WeatherState = {
  currentWeather: null,
  forecastData: null,
  rawForecastData: { list: [] },
  airQuality: null,
  soilMoisture: null,
  lastRainfall: null,
  nextRainfall: null,
  locationName: 'Your Location',
  selectedLocation: '',
  userLocation: null,
  loading: false,
  error: null,
};

// Async thunk for fetching weather data
export const fetchWeatherData = createAsyncThunk(
  'weather/fetchWeatherData',
  async ({ lat, lon }: { lat: number; lon: number }, { rejectWithValue }) => {
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
      const currentWeather = {
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
      };

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

      const forecastData = {
        hourly: hourlyData,
        daily: dailyData,
      };

      // Fetch air quality data
      const airQualityResponse = await axios.get(
        "https://api.openweathermap.org/data/2.5/air_pollution",
        {
          params: {
            lat,
            lon,
            appid: API_KEY,
          },
        }
      );
      
      let airQuality = null;
      if (airQualityResponse.data && airQualityResponse.data.list && airQualityResponse.data.list.length > 0) {
        const data = airQualityResponse.data.list[0];
        const aqi = data.main.aqi;
        
        // AQI categories based on OpenWeatherMap's 1-5 scale
        const categories = [
          { value: 1, label: "Good", color: "bg-success text-success-foreground", description: "Air quality is considered satisfactory, and air pollution poses little or no risk." },
          { value: 2, label: "Fair", color: "bg-accent text-accent-foreground", description: "Air quality is acceptable; however, some pollutants may be a concern for a small number of people." },
          { value: 3, label: "Moderate", color: "bg-warning text-warning-foreground", description: "Members of sensitive groups may experience health effects." },
          { value: 4, label: "Poor", color: "bg-destructive/70 text-destructive-foreground", description: "Everyone may begin to experience health effects; members of sensitive groups may experience more serious effects." },
          { value: 5, label: "Very Poor", color: "bg-destructive text-destructive-foreground", description: "Health warnings of emergency conditions. The entire population is more likely to be affected." },
        ];
        
        const category = categories.find(cat => cat.value === aqi) || categories[2];
        
        airQuality = {
          aqi,
          components: data.components,
          category: category.label,
          color: category.color,
          description: category.description
        };
      }

      // Estimate soil moisture based on weather conditions
      const baseMoisture = currentWeather.humidity * 0.6;
      const tempFactor = Math.max(0, 1 - (currentWeather.temp - 15) / 30);
      const soilMoisture = Math.min(100, Math.max(0, baseMoisture * tempFactor));

      // Simulate last rainfall (in a real app, you would use historical data)
      const now = new Date();
      const randomHoursAgo = Math.floor(Math.random() * 24) + 1;
      const lastRainTime = new Date(now.getTime() - randomHoursAgo * 60 * 60 * 1000);
      const lastRainfall = lastRainTime.toLocaleDateString(undefined, { 
        weekday: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      // Find the next rainfall in the forecast
      const nextRain = forecast.list.find((item: any) => 
        item.weather[0].main === "Rain" || 
        item.weather[0].main === "Drizzle" ||
        item.weather[0].main === "Thunderstorm"
      );
      
      let nextRainfall = "No rain forecast";
      if (nextRain) {
        const nextRainTime = new Date(nextRain.dt * 1000);
        nextRainfall = nextRainTime.toLocaleDateString(undefined, { 
          weekday: 'short', 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }

      return {
        currentWeather,
        forecastData,
        rawForecastData: forecast,
        airQuality,
        soilMoisture: Math.round(soilMoisture),
        lastRainfall,
        nextRainfall,
        locationName: `${currentWeather.cityName}${currentWeather.country ? `, ${currentWeather.country}` : ''}`,
      };
    } catch (error) {
      return rejectWithValue("Failed to fetch weather data. Please try again later.");
    }
  }
);

// Create the weather slice
const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    setSelectedLocation: (state, action: PayloadAction<string>) => {
      state.selectedLocation = action.payload;
    },
    setUserLocation: (state, action: PayloadAction<{ lat: number; lon: number }>) => {
      state.userLocation = action.payload;
    },
    resetWeatherState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeatherData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeatherData.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWeather = action.payload.currentWeather;
        state.forecastData = action.payload.forecastData;
        state.rawForecastData = action.payload.rawForecastData;
        state.airQuality = action.payload.airQuality;
        state.soilMoisture = action.payload.soilMoisture;
        state.lastRainfall = action.payload.lastRainfall;
        state.nextRainfall = action.payload.nextRainfall;
        state.locationName = action.payload.locationName;
      })
      .addCase(fetchWeatherData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedLocation, setUserLocation, resetWeatherState } = weatherSlice.actions;

export default weatherSlice.reducer;