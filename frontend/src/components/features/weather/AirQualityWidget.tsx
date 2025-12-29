import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Wind, AlertTriangle, Check, X } from 'lucide-react';
import axios from 'axios';

interface AirQualityWidgetProps {
  lat: number;
  lon: number;
}

interface AirQualityData {
  aqi: number;
  components: {
    co: number;
    no: number;
    no2: number;
    o3: number;
    so2: number;
    pm2_5: number;
    pm10: number;
    nh3: number;
  };
  category: string;
  color: string;
  description: string;
}

const AirQualityWidget: React.FC<AirQualityWidgetProps> = ({ lat, lon }) => {
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAirQuality = async () => {
      if (!lat || !lon) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
        const response = await axios.get(
          "https://api.openweathermap.org/data/2.5/air_pollution",
          {
            params: {
              lat,
              lon,
              appid: API_KEY,
            },
          }
        );
        
        if (response.data && response.data.list && response.data.list.length > 0) {
          const data = response.data.list[0];
          const aqi = data.main.aqi;
          
          // AQI categories based on OpenWeatherMap's 1-5 scale
          const categories = [
            { value: 1, label: "Good", color: "text-green-600", bgColor: "bg-green-100", borderColor: "border-green-200", description: "Air quality is considered satisfactory, and air pollution poses little or no risk." },
            { value: 2, label: "Fair", color: "text-teal-600", bgColor: "bg-teal-100", borderColor: "border-teal-200", description: "Air quality is acceptable; however, some pollutants may be a concern for a small number of people." },
            { value: 3, label: "Moderate", color: "text-amber-600", bgColor: "bg-amber-100", borderColor: "border-amber-200", description: "Members of sensitive groups may experience health effects." },
            { value: 4, label: "Poor", color: "text-orange-600", bgColor: "bg-orange-100", borderColor: "border-orange-200", description: "Everyone may begin to experience health effects; members of sensitive groups may experience more serious effects." },
            { value: 5, label: "Very Poor", color: "text-rose-600", bgColor: "bg-rose-100", borderColor: "border-rose-200", description: "Health warnings of emergency conditions. The entire population is more likely to be affected." },
          ];
          
          const category = categories.find(cat => cat.value === aqi) || categories[2];
          
          setAirQuality({
            aqi,
            components: data.components,
            category: category.label,
            color: category.color,
            description: category.description
          });
        }
      } catch (err) {
        console.error("Error fetching air quality data:", err);
        setError("Failed to fetch air quality data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAirQuality();
  }, [lat, lon]);

  // Get the status icon based on AQI
  const getStatusIcon = () => {
    if (!airQuality) return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    
    switch (airQuality.aqi) {
      case 1:
      case 2:
        return <Check className="h-5 w-5 text-[#166534]" />;
      case 3:
        return <AlertTriangle className="h-5 w-5 text-[#92400E]" />;
      case 4:
      case 5:
        return <X className="h-5 w-5 text-[#991B1B]" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get background color based on AQI
  const getStatusColor = () => {
    if (!airQuality) return "bg-gray-100";
    
    switch (airQuality.aqi) {
      case 1: return "bg-[#DCFCE7] text-[#166534] border-[#DCFCE7]";
      case 2: return "bg-[#DCFCE7] text-[#166534] border-[#DCFCE7]";
      case 3: return "bg-[#FFF8E6] text-[#92400E] border-[#F4D35E]";
      case 4: return "bg-[#FFD6DB] text-[#991B1B] border-[#FFD6DB]";
      case 5: return "bg-[#FFD6DB] text-[#991B1B] border-[#FFD6DB]";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <Card className="overflow-hidden border-0 shadow-md rounded-3xl bg-white">
        <div className="p-5">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Air Quality</h2>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#3E8E41]"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (error || !airQuality) {
    return (
      <Card className="overflow-hidden border-0 shadow-md rounded-3xl bg-white">
        <div className="p-5">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Air Quality</h2>
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center">
            <AlertTriangle className="h-5 w-5 text-[#F4D35E] mr-2" />
            <p className="text-sm text-gray-600">
              {error || "Air quality data unavailable"}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-0 shadow-md rounded-3xl bg-white">
      <div className="p-5">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-gray-800">Air Quality</h2>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getStatusColor()}`}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center">
              {getStatusIcon()}
            </div>
            <span className="font-medium">{airQuality.category}</span>
          </div>
        </div>
        
        <p className="text-gray-600 mb-5">{airQuality.description}</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="text-xs text-gray-500 mb-1">PM2.5</div>
            <div className="text-base font-semibold text-gray-800">{airQuality.components.pm2_5.toFixed(1)}</div>
            <div className="text-xs text-gray-500">μg/m³</div>
          </div>
          
          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="text-xs text-gray-500 mb-1">PM10</div>
            <div className="text-base font-semibold text-gray-800">{airQuality.components.pm10.toFixed(1)}</div>
            <div className="text-xs text-gray-500">μg/m³</div>
          </div>
          
          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="text-xs text-gray-500 mb-1">O₃ (Ozone)</div>
            <div className="text-base font-semibold text-gray-800">{airQuality.components.o3.toFixed(1)}</div>
            <div className="text-xs text-gray-500">μg/m³</div>
          </div>
          
          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="text-xs text-gray-500 mb-1">NO₂</div>
            <div className="text-base font-semibold text-gray-800">{airQuality.components.no2.toFixed(1)}</div>
            <div className="text-xs text-gray-500">μg/m³</div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-[#DCFCE7] mr-1"></div>
            <span className="text-xs text-gray-500 mr-2">Good</span>
            
            <div className="w-4 h-4 rounded-full bg-[#FFF8E6] mr-1"></div>
            <span className="text-xs text-gray-500 mr-2">Moderate</span>
            
            <div className="w-4 h-4 rounded-full bg-[#FFD6DB] mr-1"></div>
            <span className="text-xs text-gray-500">Poor</span>
          </div>
          
          <div className="text-xs text-gray-400 italic">
            Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AirQualityWidget;
