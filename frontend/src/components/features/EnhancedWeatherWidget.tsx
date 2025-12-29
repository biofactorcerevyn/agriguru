import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  highTemp: number;
  lowTemp: number;
  humidity: number;
  windSpeed: number;
  rainfall: number;
  deltaT: number;
}

interface EnhancedWeatherWidgetProps {
  district: string;
  state: string;
}

export const EnhancedWeatherWidget: React.FC<EnhancedWeatherWidgetProps> = ({ district, state }) => {
  const navigate = useNavigate();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  const mockWeatherData: WeatherData = {
    location: `${district}, ${state}`,
    temperature: 28,
    condition: 'Partly Cloudy',
    highTemp: 32,
    lowTemp: 24,
    humidity: 65,
    windSpeed: 15,
    rainfall: 0.2,
    deltaT: 6.5,
  };

  useEffect(() => {
    // Simulate API call
    const fetchWeather = async () => {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWeatherData(mockWeatherData);
      setLoading(false);
    };

    fetchWeather();
  }, [district, state]);

  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('rain')) return <CloudRain className="h-8 w-8 text-blue-500" />;
    if (lowerCondition.includes('cloud')) return <Cloud className="h-8 w-8 text-gray-500" />;
    if (lowerCondition.includes('sun')) return <Sun className="h-8 w-8 text-yellow-500" />;
    return <Cloud className="h-8 w-8 text-gray-500" />;
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weatherData) return null;

  const handleViewDetailedForecast = () => {
    navigate('/weather');
  };

  return (
    <Card className="w-full cursor-pointer" onClick={handleViewDetailedForecast}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {getWeatherIcon(weatherData.condition)}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{weatherData.location}</p>
              </div>
              <p className="text-2xl font-bold">{weatherData.temperature}°C</p>
              <p className="text-sm text-muted-foreground">{weatherData.condition}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm">High: <span className="font-semibold">{weatherData.highTemp}°C</span></p>
            <p className="text-sm">Low: <span className="font-semibold">{weatherData.lowTemp}°C</span></p>
            <div className="flex items-center gap-2 mt-2">
              <Wind className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs">{weatherData.windSpeed} km/h</span>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">Click for detailed forecast and spray timing analysis</p>
        </div>
      </CardContent>
    </Card>
  );
};
