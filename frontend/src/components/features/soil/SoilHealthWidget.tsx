import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Layers, ArrowRight, Thermometer, Droplets } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SoilHealthWidgetProps {
  className?: string;
}

interface SoilMetric {
  name: string;
  value: string | number;
  unit: string;
  status: "good" | "warning" | "alert";
}

const mockSoilData = {
  location: "North Field",
  lastTested: "2 days ago",
  healthIndex: 78,
  metrics: [
    { name: "pH", value: 6.8, unit: "", status: "good" },
    { name: "Organic Matter", value: 3.2, unit: "%", status: "good" },
    { name: "Nitrogen", value: 45, unit: "ppm", status: "warning" },
    { name: "Moisture", value: 22, unit: "%", status: "good" }
  ]
};

export function SoilHealthWidget({ className }: SoilHealthWidgetProps) {
  const navigate = useNavigate();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "good": return "text-green-600 bg-green-50";
      case "warning": return "text-yellow-600 bg-yellow-50";
      case "alert": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getHealthIndexColor = (score: number) => {
    if (score >= 80) return "border-green-500 text-green-600";
    if (score >= 60) return "border-yellow-500 text-yellow-600";
    return "border-red-500 text-red-600";
  };

  return (
    <Card className={`p-4 ${className} bg-white border border-gray-200 shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Layers className="h-5 w-5 text-primary mr-2" />
          <h3 className="font-semibold text-gray-800">Soil Health</h3>
        </div>
        <Badge variant="outline" className="text-gray-700 border-gray-300">{mockSoilData.location}</Badge>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">
          Last tested: {mockSoilData.lastTested}
        </div>
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white`}
               style={{ borderColor: mockSoilData.healthIndex >= 80 ? '#10B981' : mockSoilData.healthIndex >= 60 ? '#F59E0B' : '#EF4444' }}>
            <span className="text-sm font-medium text-gray-800">{mockSoilData.healthIndex}</span>
          </div>
          <span className="text-xs ml-1 text-gray-600">Health<br/>Index</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        {mockSoilData.metrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-100 rounded-lg p-2">
            <div className="flex items-center">
              {metric.name === "Moisture" ? (
                <Droplets className="h-3.5 w-3.5 text-blue-500 mr-1.5" />
              ) : metric.name === "pH" ? (
                <Thermometer className="h-3.5 w-3.5 text-orange-500 mr-1.5" />
              ) : (
                <div className="w-3.5 h-3.5 mr-1.5" />
              )}
              <span className="text-xs text-gray-700">{metric.name}</span>
            </div>
            <div className="flex items-center">
              <Badge className={`text-xs ${metric.status === "good" ? "bg-green-100 text-green-800" : metric.status === "warning" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`} variant="secondary">
                {metric.value}{metric.unit}
              </Badge>
            </div>
          </div>
        ))}
      </div>
      
      <Button 
        variant="outline" 
        className="w-full text-xs justify-between text-gray-700 border-gray-300 hover:bg-gray-100"
        onClick={() => navigate('/soil-health')}
      >
        View detailed analysis
        <ArrowRight className="h-3.5 w-3.5 ml-1" />
      </Button>
    </Card>
  );
}
