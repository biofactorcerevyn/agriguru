import { useState, useEffect } from "react";
import { MapPin, ChevronLeft } from "lucide-react";
import { cities } from '../../../data/cities';
import { useLocation, useNavigate } from "react-router-dom";
import WeatherCharts from './Chart/WeatherChart';
import WeatherTable from './WeatherTable';
import CurrentWeatherCard from './CurrentWeatherCard';
import SprayingTimeWidget from './SprayingTimeWidget';
import SprayingTimeDetails from './SprayingTimeDetails';
import AirQualityWidget from './AirQualityWidget';
import SoilMoistureWidget from './SoilMoistureWidget';
import { CitySelector } from './CitySelector';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchWeatherData, setSelectedLocation, setUserLocation } from "@/redux/slices/weatherSlice";
import { Button } from "@/components/ui/button";

const WeatherDashboard = () => {
  const dispatch = useAppDispatch();
  const { 
    currentWeather, 
    forecastData, 
    rawForecastData, 
    loading, 
    error, 
    userLocation, 
    selectedLocation,
    locationName 
  } = useAppSelector(state => state.weather);
  
  // React Router hooks
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if URL has showSprayingDetails parameter
  const searchParams = new URLSearchParams(location.search);
  const shouldShowSprayingDetails = searchParams.get('showSprayingDetails') === 'true';
  
  const [showSprayingDetails, setShowSprayingDetails] = useState(shouldShowSprayingDetails);
  
  // Update showSprayingDetails state when URL changes
  useEffect(() => {
    setShowSprayingDetails(searchParams.get('showSprayingDetails') === 'true');
  }, [location.search]);
  const [activeTab, setActiveTab] = useState("forecast");

  // Get user's location on initial load
  useEffect(() => {
    if (navigator.geolocation && !selectedLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          dispatch(setUserLocation({ lat: latitude, lon: longitude }));
          dispatch(fetchWeatherData({ lat: latitude, lon: longitude }));
        },
        (err) => {
          console.error("Error getting location:", err);
        }
      );
    }
  }, [dispatch]);

  // Fetch weather data when selectedLocation changes
  useEffect(() => {
    if (selectedLocation) {
      const [lat, lon] = selectedLocation.split(',').map(Number);
      dispatch(fetchWeatherData({ lat, lon }));
    }
  }, [selectedLocation, dispatch]);

  const handleLocationChange = (location: string) => {
    if (location === "current" && userLocation) {
      dispatch(setSelectedLocation(`${userLocation.lat},${userLocation.lon}`));
    } else {
      dispatch(setSelectedLocation(location));
    }
  };

  const handleViewSprayingDetails = () => {
    setShowSprayingDetails(true);
  };

  const handleBackToMain = () => {
    setShowSprayingDetails(false);
    // Update URL to remove the query parameter
    navigate('/weather');
  };

  // Calculate height for scrollable content
  const contentHeight = "calc(100vh - 8rem)";

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Weather Dashboard</h1>
            <CitySelector 
              selectedLocation={selectedLocation}
              onLocationChange={handleLocationChange}
              cities={cities}
              userLocation={userLocation}
              currentLocationName={locationName}
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription className="text-base">{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64 sm:h-80">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#3E8E41]"></div>
          </div>
        ) : currentWeather ? (
          <>
            {showSprayingDetails ? (
              <div className="space-y-6">
                <Button
                  variant="outline"
                  onClick={handleBackToMain}
                  className="mb-4 border-[#3E8E41] text-[#3E8E41] hover:bg-[#e6f5e6] hover:text-[#3E8E41]"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                
                <SprayingTimeDetails 
                  forecastData={rawForecastData} 
                  currentWeather={currentWeather} 
                />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Current Weather Card */}
                <CurrentWeatherCard currentWeather={currentWeather} locationName={locationName} />
                
                {/* Agricultural Widgets */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SprayingTimeWidget 
                    currentWeather={currentWeather} 
                    onViewDetails={handleViewSprayingDetails} 
                  />
                  
                  <SoilMoistureWidget 
                    lat={currentWeather.lat} 
                    lon={currentWeather.lon} 
                    currentWeather={currentWeather} 
                  />
                </div>
                
                {/* Tabs for Weather Data Views */}
                <div className="bg-white p-5 rounded-3xl shadow-md border-0">
                  <Tabs defaultValue="forecast" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-2 mb-6 w-full max-w-md mx-auto bg-gray-100 p-1 rounded-full">
                      <TabsTrigger 
                        value="forecast" 
                        className="data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=active]:shadow-sm rounded-full px-6 py-2 text-sm"
                      >
                        Weather Forecast
                      </TabsTrigger>
                      <TabsTrigger 
                        value="airquality"
                        className="data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=active]:shadow-sm rounded-full px-6 py-2 text-sm"
                      >
                        Air Quality
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="forecast" className="space-y-6">
                      <WeatherCharts forecastData={forecastData} />
                      
                      {rawForecastData.list && rawForecastData.list.length > 0 && (
                        <WeatherTable forecastData={rawForecastData} />
                      )}
                    </TabsContent>
                    
                    <TabsContent value="airquality">
                      <AirQualityWidget lat={currentWeather.lat} lon={currentWeather.lon} />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default WeatherDashboard;
