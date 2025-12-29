import React from 'react';
import { Card } from "@/components/ui/card";
import { MapPin, Thermometer, Droplets, Wind, Clock, Eye, Gauge, Cloud, Sunrise, Sunset, Calendar } from 'lucide-react';

interface CurrentWeatherProps {
  currentWeather: {
    cityName: string;
    country: string;
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
  };
  locationName: string;
}

const CurrentWeatherCard: React.FC<CurrentWeatherProps> = ({ currentWeather, locationName }) => {
  const getWeatherIconUrl = (icon: string) => `https://openweathermap.org/img/wn/${icon}@4x.png`;
  
  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Get current date
  const currentDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate whether it's day or night
  const now = new Date().getTime() / 1000; // Current time in seconds
  const isDaytime = now > currentWeather.sunrise && now < currentWeather.sunset;
  
  // Calculate sunset/sunrise remaining time
  const getTimeUntil = (timestamp: number) => {
    const diff = timestamp - now;
    if (diff <= 0) return "Passed today";
    
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    
    return `In ${hours ? `${hours}h ` : ''}${minutes}m`;
  };
  
  const sunriseTime = formatTime(currentWeather.sunrise);
  const sunsetTime = formatTime(currentWeather.sunset);
  
  const sunriseRemaining = getTimeUntil(currentWeather.sunrise);
  const sunsetRemaining = getTimeUntil(currentWeather.sunset);

  return (
    <Card className="overflow-hidden border-0 shadow-md rounded-3xl bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Main Weather Info */}
        <div className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center mb-1">
              <MapPin className="h-5 w-5 text-gray-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-800">{locationName}</h2>
            </div>
            <div className="flex items-center mb-5 text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{currentDate}</span>
            </div>
            
            <div className="flex items-center mb-6">
              <img 
                src={getWeatherIconUrl(currentWeather.icon)} 
                alt={currentWeather.description}
                className="w-28 h-28 mr-2"
              />
              <div>
                <div className="text-6xl font-bold text-gray-800">
                  {Math.round(currentWeather.temp)}°C
                </div>
                <div className="flex mt-1">
                  <span className="text-lg text-gray-600 capitalize">
                    {currentWeather.description}
                  </span>
                </div>
                <div className="flex text-sm text-gray-500 mt-1">
                  <span>{Math.round(currentWeather.feels_like)}°C feels like</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-8 h-8 rounded-full bg-[#e6f5e6] flex items-center justify-center mr-2">
                <Thermometer className="h-4 w-4 text-[#3E8E41]" />
              </div>
              <span>{Math.round(currentWeather.temp)}°C / {Math.round(currentWeather.feels_like)}°C</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-8 h-8 rounded-full bg-[#e6f5e6] flex items-center justify-center mr-2">
                <Droplets className="h-4 w-4 text-[#3E8E41]" />
              </div>
              <span>Humidity {currentWeather.humidity}%</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-8 h-8 rounded-full bg-[#e6f5e6] flex items-center justify-center mr-2">
                <Wind className="h-4 w-4 text-[#3E8E41]" />
              </div>
              <span>Wind {currentWeather.wind_speed.toFixed(1)} m/s</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-8 h-8 rounded-full bg-[#e6f5e6] flex items-center justify-center mr-2">
                <Gauge className="h-4 w-4 text-[#3E8E41]" />
              </div>
              <span>Pressure {currentWeather.pressure} hPa</span>
            </div>
          </div>
        </div>
        
        {/* Weather Details */}
        <div className="p-6 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Weather Details</h3>
          
          <div className="space-y-4">
            {/* Sun rise/set card */}
            <div className="flex bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                <div className="w-1/2 flex flex-col border-r border-gray-100 pr-4">
                  <div className="flex items-center mb-1">
                    <Sunrise className="h-4 w-4 text-[#F4D35E] mr-1" />
                    <span className="text-xs text-gray-500">Sunrise</span>
                  </div>
                  <span className="text-base font-medium text-gray-800">{sunriseTime}</span>
                  <span className="text-xs text-gray-500">{sunriseRemaining}</span>
                </div>
                <div className="w-1/2 pl-4 flex flex-col">
                  <div className="flex items-center mb-1">
                    <Sunset className="h-4 w-4 text-[#F4D35E] mr-1" />
                    <span className="text-xs text-gray-500">Sunset</span>
                  </div>
                  <span className="text-base font-medium text-gray-800">{sunsetTime}</span>
                  <span className="text-xs text-gray-500">{sunsetRemaining}</span>
                </div>
            </div>
            
            {/* Other weather details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start">
                <div className="p-2 rounded-full bg-[#e6f5e6] mr-3">
                  <Thermometer className="h-5 w-5 text-[#3E8E41]" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Temperature</div>
                  <div className="text-lg font-semibold text-gray-800">{Math.round(currentWeather.temp)}°C</div>
                  <div className="text-xs text-gray-500">Feels like {Math.round(currentWeather.feels_like)}°C</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="p-2 rounded-full bg-[#e6f5e6] mr-3">
                  <Droplets className="h-5 w-5 text-[#3E8E41]" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Humidity</div>
                  <div className="text-lg font-semibold text-gray-800">{currentWeather.humidity}%</div>
                  <div className="text-xs text-gray-500">{currentWeather.humidity < 30 ? 'Low' : currentWeather.humidity > 70 ? 'High' : 'Normal'}</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="p-2 rounded-full bg-[#e6f5e6] mr-3">
                  <Wind className="h-5 w-5 text-[#3E8E41]" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Wind Speed</div>
                  <div className="text-lg font-semibold text-gray-800">{currentWeather.wind_speed.toFixed(1)} m/s</div>
                  <div className="text-xs text-gray-500">{currentWeather.wind_speed < 1 ? 'Light' : currentWeather.wind_speed > 5 ? 'Strong' : 'Moderate'}</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="p-2 rounded-full bg-[#e6f5e6] mr-3">
                  <Gauge className="h-5 w-5 text-[#3E8E41]" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Pressure</div>
                  <div className="text-lg font-semibold text-gray-800">{currentWeather.pressure} hPa</div>
                  <div className="text-xs text-gray-500">{currentWeather.pressure < 1000 ? 'Low' : currentWeather.pressure > 1020 ? 'High' : 'Normal'}</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="p-2 rounded-full bg-[#e6f5e6] mr-3">
                  <Eye className="h-5 w-5 text-[#3E8E41]" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Visibility</div>
                  <div className="text-lg font-semibold text-gray-800">{(currentWeather.visibility / 1000).toFixed(1)} km</div>
                  <div className="text-xs text-gray-500">{currentWeather.visibility < 5000 ? 'Poor' : 'Good'}</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="p-2 rounded-full bg-[#e6f5e6] mr-3">
                  <Cloud className="h-5 w-5 text-[#3E8E41]" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Conditions</div>
                  <div className="text-lg font-semibold capitalize text-gray-800">{currentWeather.description}</div>
                  <div className="text-xs text-gray-500">{isDaytime ? 'Daytime' : 'Nighttime'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CurrentWeatherCard;
