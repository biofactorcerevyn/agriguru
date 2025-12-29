import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchWeatherData, setSelectedLocation } from '@/redux/slices/weatherSlice';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CloudRain, ThermometerSun, Wind, Droplets } from 'lucide-react';
import { cities } from '@/data/cities';

/**
 * Example component demonstrating Redux with shadcn UI
 * This component shows how to:
 * 1. Use Redux state with useAppSelector
 * 2. Dispatch Redux actions with useAppDispatch
 * 3. Handle async data fetching with Redux Toolkit
 * 4. Use shadcn UI components with Redux
 */
const ReduxExample = () => {
  const dispatch = useAppDispatch();
  const { 
    currentWeather, 
    loading, 
    error, 
    selectedLocation,
    locationName 
  } = useAppSelector(state => state.weather);

  // Fetch weather data for a default location on component mount
  useEffect(() => {
    if (!selectedLocation && cities.length > 0) {
      const defaultCity = cities[0];
      dispatch(setSelectedLocation(`${defaultCity.lat},${defaultCity.lon}`));
      dispatch(fetchWeatherData({ lat: defaultCity.lat, lon: defaultCity.lon }));
    }
  }, [dispatch, selectedLocation]);

  const handleLocationChange = (value: string) => {
    const [lat, lon] = value.split(',').map(Number);
    dispatch(setSelectedLocation(value));
    dispatch(fetchWeatherData({ lat, lon }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Redux with shadcn UI Example</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Weather Data with Redux</CardTitle>
          <CardDescription>
            This example demonstrates fetching and displaying weather data using Redux and shadcn UI components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select Location</label>
            <Select 
              value={selectedLocation} 
              onValueChange={handleLocationChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={`${city.lat},${city.lon}`} value={`${city.lat},${city.lon}`}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                <p className="text-muted-foreground">Loading weather data...</p>
              </div>
            </div>
          ) : currentWeather ? (
            <Tabs defaultValue="current" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="current">Current Weather</TabsTrigger>
                <TabsTrigger value="details">Weather Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="current">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CloudRain className="h-5 w-5 mr-2" />
                      {locationName}
                    </CardTitle>
                    <CardDescription>
                      Current weather conditions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img 
                          src={`https://openweathermap.org/img/wn/${currentWeather.icon}@2x.png`} 
                          alt={currentWeather.description}
                          className="w-16 h-16"
                        />
                        <div>
                          <p className="text-3xl font-bold">{Math.round(currentWeather.temp)}°C</p>
                          <p className="text-muted-foreground capitalize">{currentWeather.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Feels like</p>
                        <p className="font-medium">{Math.round(currentWeather.feels_like)}°C</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="details">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center">
                        <ThermometerSun className="h-4 w-4 mr-2" />
                        Temperature
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{Math.round(currentWeather.temp)}°C</p>
                      <p className="text-xs text-muted-foreground">Feels like {Math.round(currentWeather.feels_like)}°C</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center">
                        <Wind className="h-4 w-4 mr-2" />
                        Wind
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{currentWeather.wind_speed} m/s</p>
                      <p className="text-xs text-muted-foreground">Wind speed</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center">
                        <Droplets className="h-4 w-4 mr-2" />
                        Humidity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{currentWeather.humidity}%</p>
                      <p className="text-xs text-muted-foreground">Relative humidity</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              Select a location to view weather data
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-xs text-muted-foreground">
            Data from OpenWeatherMap API
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              if (selectedLocation) {
                const [lat, lon] = selectedLocation.split(',').map(Number);
                dispatch(fetchWeatherData({ lat, lon }));
              }
            }}
            disabled={loading || !selectedLocation}
          >
            Refresh Data
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ReduxExample;