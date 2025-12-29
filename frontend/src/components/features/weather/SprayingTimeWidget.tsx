import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ChevronRight, AlertTriangle, Check, X, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SprayingTimeWidgetProps {
  currentWeather: any;
  onViewDetails?: () => void; // Make optional since we'll use router navigation
}

const SprayingTimeWidget: React.FC<SprayingTimeWidgetProps> = ({ currentWeather, onViewDetails }) => {
  const navigate = useNavigate();
  
  if (!currentWeather) return null;

  // Calculate spraying suitability based on current weather
  const calculateSuitability = () => {
    const temp = currentWeather.temp;
    const windSpeed = currentWeather.wind_speed;
    const humidity = currentWeather.humidity;
    
    // Ideal conditions for spraying:
    // - Temperature: 10-25°C
    // - Wind speed: < 10 km/h (2.78 m/s)
    // - Humidity: 40-60%
    
    const tempIdeal = temp >= 10 && temp <= 25;
    const windIdeal = windSpeed < 2.78;
    const humidityIdeal = humidity >= 40 && humidity <= 60;
    
    const score = (tempIdeal ? 1 : 0) + (windIdeal ? 1 : 0) + (humidityIdeal ? 1 : 0);
    
    return {
      score,
      suitabilityText: 
        score === 3 ? "Optimal" :
        score === 2 ? "Moderate" :
        score === 1 ? "Unfavourable" : 
        "Unfavourable",
      suitabilityColor: 
        score === 3 ? "bg-[#DCFCE7] text-[#166534] border-[#DCFCE7]" :
        score === 2 ? "bg-[#FFF8E6] text-[#92400E] border-[#F4D35E]" :
        score === 1 ? "bg-[#FFD6DB] text-[#991B1B] border-[#FFD6DB]" : 
        "bg-[#FFD6DB] text-[#991B1B] border-[#FFD6DB]",
      suitabilityIcon:
        score === 3 ? <Check className="h-5 w-5 text-[#166534]" /> :
        score === 2 ? <AlertTriangle className="h-5 w-5 text-[#92400E]" /> :
        <X className="h-5 w-5 text-[#991B1B]" />,
      recommendation: 
        score === 3 ? "Current conditions are ideal for spraying your crops." :
        score === 2 ? "Current conditions are acceptable for spraying with some caution." :
        score === 1 ? "Spraying is not recommended in current conditions." : 
        "Avoid spraying under current conditions."
    };
  };

  const suitability = calculateSuitability();

  return (
    <Card className="overflow-hidden border-0 shadow-md rounded-3xl bg-white">
      <div className="p-5">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-gray-800">Spraying time</h2>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${suitability.suitabilityColor}`}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center">
              {suitability.suitabilityIcon}
            </div>
            <span className="font-medium">{suitability.suitabilityText}</span>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">{suitability.recommendation}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <Info className="h-4 w-4 mr-2" />
            <span>Tap to see hourly forecast</span>
          </div>
          
          <Button 
            variant="default"
            onClick={() => navigate('/weather?showSprayingDetails=true')}
            className="bg-[#3E8E41] hover:bg-[#347a37] text-white rounded-full px-5"
          >
            View Details
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SprayingTimeWidget;
