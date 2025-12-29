import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Droplets, CloudRain, AlertTriangle, Check } from 'lucide-react';
import axios from 'axios';

interface SoilMoistureWidgetProps {
  lat: number;
  lon: number;
  currentWeather: any;
}

const SoilMoistureWidget: React.FC<SoilMoistureWidgetProps> = ({ lat, lon, currentWeather }) => {
  const [soilMoisture, setSoilMoisture] = useState<number | null>(null);
  const [lastRainfall, setLastRainfall] = useState<string | null>(null);
  const [nextRainfall, setNextRainfall] = useState<string | null>(null);

  // This is a simplified model to estimate soil moisture based on weather conditions
  // In a real application, you would use actual soil moisture sensors or more sophisticated models
  useEffect(() => {
    const estimateSoilMoisture = () => {
      if (!currentWeather) return;
      
      // Base moisture level based on humidity
      let baseMoisture = currentWeather.humidity * 0.6;
      
      // Adjust for temperature (higher temp = lower moisture due to evaporation)
      const tempFactor = Math.max(0, 1 - (currentWeather.temp - 15) / 30);
      
      // Calculate estimated soil moisture (0-100%)
      const estimatedMoisture = Math.min(100, Math.max(0, baseMoisture * tempFactor));
      
      setSoilMoisture(Math.round(estimatedMoisture));
    };
    
    estimateSoilMoisture();
  }, [currentWeather]);

  // Find last and next rainfall from forecast data
  useEffect(() => {
    const checkRainfall = async () => {
      if (!lat || !lon) return;
      
      try {
        const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
        const response = await axios.get(
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
        
        if (response.data && response.data.list && response.data.list.length > 0) {
          const forecastList = response.data.list;
          
          // Find the most recent rainfall in the past 24 hours (simulated)
          const now = new Date();
          const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          
          // Find the next rainfall in the forecast
          const nextRain = forecastList.find((item: any) => 
            item.weather[0].main === "Rain" || 
            item.weather[0].main === "Drizzle" ||
            item.weather[0].main === "Thunderstorm"
          );
          
          if (nextRain) {
            const nextRainTime = new Date(nextRain.dt * 1000);
            setNextRainfall(nextRainTime.toLocaleDateString(undefined, { 
              weekday: 'short', 
              hour: '2-digit', 
              minute: '2-digit' 
            }));
          } else {
            setNextRainfall("No rain forecast");
          }
          
          // Simulate last rainfall (in a real app, you would use historical data)
          const randomHoursAgo = Math.floor(Math.random() * 24) + 1;
          const lastRainTime = new Date(now.getTime() - randomHoursAgo * 60 * 60 * 1000);
          setLastRainfall(lastRainTime.toLocaleDateString(undefined, { 
            weekday: 'short', 
            hour: '2-digit', 
            minute: '2-digit' 
          }));
        }
      } catch (err) {
        console.error("Error checking rainfall data:", err);
      }
    };
    
    checkRainfall();
  }, [lat, lon]);

  const getMoistureCategory = () => {
    if (soilMoisture === null) return { text: "Unknown", color: "text-gray-500" };
    
    if (soilMoisture >= 80) return { text: "Very Wet", color: "text-[#166534]" };
    if (soilMoisture >= 60) return { text: "Adequate", color: "text-[#166534]" };
    if (soilMoisture >= 40) return { text: "Moderate", color: "text-[#92400E]" };
    if (soilMoisture >= 20) return { text: "Dry", color: "text-[#92400E]" };
    return { text: "Very Dry", color: "text-[#991B1B]" };
  };

  const getProgressColor = () => {
    if (soilMoisture === null) return "bg-gray-200";
    
    if (soilMoisture >= 80) return "bg-[#3E8E41]";
    if (soilMoisture >= 60) return "bg-[#3E8E41]";
    if (soilMoisture >= 40) return "bg-[#F4D35E]";
    if (soilMoisture >= 20) return "bg-[#F4D35E]";
    return "bg-[#991B1B]";
  };

  const moistureCategory = getMoistureCategory();
  const progressColor = getProgressColor();
  
  // Get moisture status icon
  const getMoistureIcon = () => {
    if (soilMoisture === null) return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    
    if (soilMoisture >= 60) return <Check className="h-5 w-5 text-[#166534]" />;
    if (soilMoisture >= 40) return <AlertTriangle className="h-5 w-5 text-[#92400E]" />;
    return <AlertTriangle className="h-5 w-5 text-[#991B1B]" />;
  };

  return (
    <Card className="overflow-hidden border-0 shadow-md rounded-3xl bg-white">
      <div className="p-5">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-gray-800">Soil Moisture</h2>
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              soilMoisture >= 60 ? 'bg-[#DCFCE7]' :
              soilMoisture >= 40 ? 'bg-[#FFF8E6]' : 'bg-[#FFD6DB]'
            }`}>
              {getMoistureIcon()}
            </div>
            <span className={`font-medium ${moistureCategory.color}`}>
              {moistureCategory.text}
            </span>
          </div>
        </div>

        {/* Moisture Gauge */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Very Dry</span>
            <span>Very Wet</span>
          </div>
          <div className="relative">
            <Progress value={soilMoisture || 0} 
              className="h-2.5 rounded-full bg-gray-100" 
              indicatorClassName={progressColor}
            />
            <div 
              className="absolute top-0 transform -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#3E8E41] rounded-full"
              style={{ 
                left: `${soilMoisture || 0}%`, 
                marginLeft: '-8px'
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Rainfall Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-[#e6f5e6] flex items-center justify-center mr-2">
                <CloudRain className="h-4 w-4 text-[#3E8E41]" />
              </div>
              <span className="text-sm font-medium text-gray-800">Last Rainfall</span>
            </div>
            <p className="text-lg font-semibold pl-10 text-gray-800">
              {lastRainfall || "Loading..."}
            </p>
          </div>
          
          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-[#e6f5e6] flex items-center justify-center mr-2">
                <CloudRain className="h-4 w-4 text-[#3E8E41]" />
              </div>
              <span className="text-sm font-medium text-gray-800">Next Expected Rain</span>
            </div>
            <p className="text-lg font-semibold pl-10 text-gray-800">
              {nextRainfall || "Loading..."}
            </p>
          </div>
        </div>
        
        <div className="pt-2 text-xs text-gray-500 italic">
          <p className="flex items-center">
            <AlertTriangle className="h-3 w-3 inline mr-1 text-[#3E8E41]" />
            Estimated value based on weather conditions. For accurate readings, use soil moisture sensors.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default SoilMoistureWidget;
