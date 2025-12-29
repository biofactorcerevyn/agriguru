import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WeatherChartsProps {
  forecastData: {
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
  } | null;
}

const WeatherCharts: React.FC<WeatherChartsProps> = ({ forecastData }) => {
  const [activeTab, setActiveTab] = useState("hourly");

  if (!forecastData) return null;

  const getWeatherIconUrl = (icon: string) => `https://openweathermap.org/img/wn/${icon}.png`;

  return (
    <Card className="bg-white border border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Weather Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hourly" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="hourly">Hourly</TabsTrigger>
            <TabsTrigger value="daily">5-Day</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hourly" className="mt-0">
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {forecastData.hourly.map((hour, index) => (
                <div key={index} className="flex flex-col items-center p-2 rounded-md">
                  <span className="text-xs text-muted-foreground mb-1">{hour.time}</span>
                  <img 
                    src={getWeatherIconUrl(hour.icon)} 
                    alt="Weather icon" 
                    className="w-8 h-8 my-1"
                  />
                  <span className="text-sm font-medium">{hour.temp}°</span>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="daily" className="mt-0">
            <div className="grid grid-cols-5 gap-2">
              {forecastData.daily.map((day, index) => (
                <div key={index} className="flex flex-col items-center p-2 rounded-md">
                  <span className="text-xs text-muted-foreground mb-1">{day.day}</span>
                  <img 
                    src={getWeatherIconUrl(day.icon)} 
                    alt="Weather icon" 
                    className="w-8 h-8 my-1"
                  />
                  <div className="flex items-center space-x-1 text-xs">
                    <span className="font-medium">{day.temp_max}°</span>
                    <span className="text-muted-foreground">{day.temp_min}°</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WeatherCharts;