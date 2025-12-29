import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cloud, CloudRain, Sun, Wind, Thermometer, Droplets, AlertTriangle } from "lucide-react";

interface WeatherData {
  location: string;
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    condition: string;
    icon: string;
  };
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
    rainfall: number;
    humidity: number;
  }>;
  agriculturalInsights: {
    irrigation: string;
    planting: string;
    harvesting: string;
    pestRisk: string;
    generalAdvice: string;
  };
}

interface WeatherWidgetProps {
  district: string;
  state: string;
}

export default function WeatherWidget({ district, state }: WeatherWidgetProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'current' | 'forecast' | 'advisory'>('current');

  useEffect(() => {
    fetchWeatherData();
  }, [district, state]);

  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      // Simulate API call - in real implementation, this would call OpenWeatherMap API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock weather data
      const mockData: WeatherData = {
        location: `${district}, ${state}`,
        current: {
          temperature: 24,
          humidity: 68,
          windSpeed: 12,
          condition: "Partly Cloudy",
          icon: "partly-cloudy"
        },
        forecast: [
          { date: "Today", high: 26, low: 18, condition: "Partly Cloudy", rainfall: 0, humidity: 68 },
          { date: "Tomorrow", high: 28, low: 20, condition: "Sunny", rainfall: 0, humidity: 65 },
          { date: "Day 3", high: 25, low: 17, condition: "Light Rain", rainfall: 5, humidity: 75 },
          { date: "Day 4", high: 23, low: 16, condition: "Cloudy", rainfall: 2, humidity: 72 },
          { date: "Day 5", high: 27, low: 19, condition: "Sunny", rainfall: 0, humidity: 60 },
          { date: "Day 6", high: 29, low: 21, condition: "Hot", rainfall: 0, humidity: 55 },
          { date: "Day 7", high: 26, low: 18, condition: "Partly Cloudy", rainfall: 0, humidity: 62 }
        ],
        agriculturalInsights: {
          irrigation: "Reduce irrigation for next 2 days due to expected rainfall on Day 3",
          planting: "Good time for sowing rabi crops. Soil moisture will be optimal after expected rain",
          harvesting: "Complete harvesting of kharif crops before Day 3 rain",
          pestRisk: "Monitor for fungal diseases 2-3 days after rainfall",
          generalAdvice: "Prepare drainage systems for expected rainfall. Consider applying fertilizers before rain for better nutrient absorption."
        }
      };

      setWeatherData(mockData);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'hot':
        return <Sun className="h-6 w-6 text-orange-500" />;
      case 'partly cloudy':
        return <Cloud className="h-6 w-6 text-gray-500" />;
      case 'cloudy':
        return <Cloud className="h-6 w-6 text-gray-600" />;
      case 'light rain':
      case 'rain':
        return <CloudRain className="h-6 w-6 text-blue-500" />;
      default:
        return <Sun className="h-6 w-6 text-orange-500" />;
    }
  };

  const getRainfallColor = (rainfall: number) => {
    if (rainfall === 0) return "bg-gray-200";
    if (rainfall < 5) return "bg-blue-200";
    if (rainfall < 10) return "bg-blue-400";
    return "bg-blue-600";
  };

  if (loading) {
    return (
      <Card className="card-agricultural p-6 backdrop-blur-sm bg-white/95">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  if (!weatherData) {
    return (
      <Card className="card-agricultural p-6 backdrop-blur-sm bg-white/95">
        <p className="text-muted-foreground">Unable to load weather data</p>
      </Card>
    );
  }

  return (
    <Card className="card-agricultural backdrop-blur-sm bg-white/95">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Weather for {weatherData.location}
          </h3>
          <div className="flex space-x-1">
            <Button
              variant={selectedView === 'current' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedView('current')}
            >
              Current
            </Button>
            <Button
              variant={selectedView === 'forecast' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedView('forecast')}
            >
              Forecast
            </Button>
            <Button
              variant={selectedView === 'advisory' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedView('advisory')}
            >
              Advisory
            </Button>
          </div>
        </div>

        {selectedView === 'current' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getWeatherIcon(weatherData.current.condition)}
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {weatherData.current.temperature}°C
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {weatherData.current.condition}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <Droplets className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Humidity</p>
                <p className="font-semibold">{weatherData.current.humidity}%</p>
              </div>
              <div className="text-center">
                <Wind className="h-5 w-5 text-gray-500 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Wind</p>
                <p className="font-semibold">{weatherData.current.windSpeed} km/h</p>
              </div>
              <div className="text-center">
                <Thermometer className="h-5 w-5 text-red-500 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Feels like</p>
                <p className="font-semibold">{weatherData.current.temperature + 2}°C</p>
              </div>
            </div>
          </div>
        )}

        {selectedView === 'forecast' && (
          <div className="space-y-3">
            {weatherData.forecast.map((day, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getWeatherIcon(day.condition)}
                  <div>
                    <p className="font-medium text-foreground">{day.date}</p>
                    <p className="text-xs text-muted-foreground">{day.condition}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {day.high}° / {day.low}°
                  </p>
                  <div className="flex items-center space-x-1">
                    <div className={`w-3 h-3 rounded ${getRainfallColor(day.rainfall)}`}></div>
                    <span className="text-xs text-muted-foreground">{day.rainfall}mm</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedView === 'advisory' && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-start space-x-2">
                  <Droplets className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Irrigation</p>
                    <p className="text-sm text-blue-700">{weatherData.agriculturalInsights.irrigation}</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                <div className="flex items-start space-x-2">
                  <Sun className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Planting</p>
                    <p className="text-sm text-green-700">{weatherData.agriculturalInsights.planting}</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-900">Pest Risk</p>
                    <p className="text-sm text-orange-700">{weatherData.agriculturalInsights.pestRisk}</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <div className="flex items-start space-x-2">
                  <Cloud className="h-4 w-4 text-purple-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-purple-900">General Advice</p>
                    <p className="text-sm text-purple-700">{weatherData.agriculturalInsights.generalAdvice}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}