import React from 'react';
import { Card } from "@/components/ui/card";
import { Cloud, Droplets, Wind, Gauge } from 'lucide-react';

interface WeatherTableProps {
  forecastData: {
    list: any[];
  };
}

const WeatherTable: React.FC<WeatherTableProps> = ({ forecastData }) => {
  if (!forecastData || !forecastData.list || forecastData.list.length === 0) {
    return null;
  }

  const getWeatherIconUrl = (icon: string) => `https://openweathermap.org/img/wn/${icon}.png`;

  // Group forecast data by day
  const groupedByDay = forecastData.list.reduce((acc: any, item: any) => {
    // Format the date as YYYY-MM-DD to use as a key
    const date = new Date(item.dt * 1000);
    const dateKey = date.toISOString().split('T')[0];
    
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(item);
    return acc;
  }, {});

  // Get the next 5 days
  const days = Object.keys(groupedByDay).slice(0, 5);

  // Format date for display
  const formatDateHeader = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    // Create a date object with the correct parts
    const date = new Date(year, month - 1, day); // month is 0-indexed in JS Date
    
    return date.toLocaleDateString(undefined, { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get weather status class based on condition
  const getWeatherStatusClass = (description: string, icon: string) => {
    description = description.toLowerCase();
    
    if (description.includes('clear') || icon.includes('01')) {
      return {
        bgColor: 'bg-amber-50',
        iconColor: 'text-amber-500'
      };
    } else if (description.includes('cloud') || icon.includes('02') || icon.includes('03') || icon.includes('04')) {
      return {
        bgColor: 'bg-gray-50',
        iconColor: 'text-gray-500'
      };
    } else if (description.includes('rain') || icon.includes('09') || icon.includes('10')) {
      return {
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-500'
      };
    } else if (description.includes('thunder') || icon.includes('11')) {
      return {
        bgColor: 'bg-indigo-50',
        iconColor: 'text-indigo-500'
      };
    } else if (description.includes('snow') || icon.includes('13')) {
      return {
        bgColor: 'bg-sky-50',
        iconColor: 'text-sky-500'
      };
    } else if (description.includes('mist') || description.includes('fog') || icon.includes('50')) {
      return {
        bgColor: 'bg-gray-50',
        iconColor: 'text-gray-500'
      };
    } else {
      return {
        bgColor: 'bg-gray-50',
        iconColor: 'text-gray-500'
      };
    }
  };

  return (
    <Card className="overflow-hidden border-0 shadow-md rounded-2xl bg-white">
      <div className="p-5">
        <h2 className="text-xl font-bold text-gray-800 mb-5">5-Day Forecast</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-500">Date & Time</th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-500">Weather</th>
                <th className="px-3 py-3 text-right text-sm font-medium text-gray-500">Temp</th>
                <th className="px-3 py-3 text-right text-sm font-medium text-gray-500">
                  <Droplets className="h-4 w-4 inline text-blue-500" />
                </th>
                <th className="px-3 py-3 text-right text-sm font-medium text-gray-500">
                  <Wind className="h-4 w-4 inline text-teal-500" />
                </th>
                <th className="px-3 py-3 text-right text-sm font-medium text-gray-500">
                  <Gauge className="h-4 w-4 inline text-violet-500" />
                </th>
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <React.Fragment key={day.toString()}>
                  {/* Day Header */}
                  <tr className="bg-gray-50 border-t border-b border-gray-100">
                    <td colSpan={6} className="px-3 py-3">
                      <span className="font-bold text-gray-800">{formatDateHeader(day)}</span>
                    </td>
                  </tr>
                  
                  {/* Forecast rows for this day */}
                  {groupedByDay[day].map((item: any) => {
                    const weatherStatus = getWeatherStatusClass(item.weather[0].description, item.weather[0].icon);
                    return (
                      <tr key={item.dt} className="hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                        <td className="px-3 py-4 text-sm font-medium text-gray-800">
                          {new Date(item.dt * 1000).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex items-center">
                            <div className={`p-1 rounded-md ${weatherStatus.bgColor} mr-3`}>
                              <img 
                                src={getWeatherIconUrl(item.weather[0].icon)} 
                                alt={item.weather[0].description}
                                className="w-8 h-8"
                              />
                            </div>
                            <span className="capitalize text-sm text-gray-800">{item.weather[0].description}</span>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-right text-sm font-semibold text-gray-800">
                          {Math.round(item.main.temp)}°C
                        </td>
                        <td className="px-3 py-4 text-right text-sm">
                          <span className="text-blue-600">{item.main.humidity}%</span>
                        </td>
                        <td className="px-3 py-4 text-right text-sm">
                          <span className="text-teal-600">{item.wind.speed.toFixed(1)} m/s</span>
                        </td>
                        <td className="px-3 py-4 text-right text-sm">
                          <span className="text-violet-600">{item.main.pressure} hPa</span>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 text-xs text-gray-500 italic text-right">
          Based on OpenWeatherMap forecasts
        </div>
      </div>
    </Card>
  );
};

export default WeatherTable;
