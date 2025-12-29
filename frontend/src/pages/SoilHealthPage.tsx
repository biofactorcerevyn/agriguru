import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Layers, 
  Droplets, 
  Leaf, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Thermometer,
  PieChart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface SoilHealthData {
  id: string;
  date: string;
  location: string;
  ph: number;
  organicMatter: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  calcium: number;
  magnesium: number;
  sulfur: number;
  zinc: number;
  iron: number;
  manganese: number;
  copper: number;
  boron: number;
  cec: number;
  texture: string;
  moisture: number;
  temperature: number;
  healthIndex: number;
  recommendations: string[];
  deficiencies: string[];
  excesses: string[];
}

interface SoilHealthHistory {
  dates: string[];
  ph: number[];
  organicMatter: number[];
  nitrogen: number[];
  phosphorus: number[];
  potassium: number[];
}

const mockSoilHealthData: SoilHealthData = {
  id: "sh-001",
  date: "2025-07-15",
  location: "North Field",
  ph: 6.8,
  organicMatter: 3.2,
  nitrogen: 45,
  phosphorus: 28,
  potassium: 180,
  calcium: 1200,
  magnesium: 180,
  sulfur: 15,
  zinc: 2.1,
  iron: 12,
  manganese: 8,
  copper: 1.2,
  boron: 0.8,
  cec: 14.5,
  texture: "Clay Loam",
  moisture: 22,
  temperature: 24,
  healthIndex: 78,
  recommendations: [
    "Add compost to increase organic matter",
    "Apply nitrogen fertilizer in split doses",
    "Consider liming to maintain pH",
    "Incorporate cover crops in rotation",
    "Improve drainage in low-lying areas"
  ],
  deficiencies: [
    "Slight nitrogen deficiency",
    "Boron levels below optimal"
  ],
  excesses: [
    "Phosphorus slightly above optimal range"
  ]
};

const mockSoilHealthHistory: SoilHealthHistory = {
  dates: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  ph: [6.5, 6.6, 6.7, 6.8, 6.8, 6.8],
  organicMatter: [2.8, 2.9, 3.0, 3.1, 3.2, 3.2],
  nitrogen: [38, 40, 42, 43, 44, 45],
  phosphorus: [22, 24, 25, 26, 27, 28],
  potassium: [165, 168, 172, 175, 178, 180]
};

export default function SoilHealthPage() {
  const [soilData, setSoilData] = useState<SoilHealthData | null>(null);
  const [soilHistory, setSoilHistory] = useState<SoilHealthHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDisabled] = useState(true); // Page is disabled
  const [formData, setFormData] = useState({
    location: "",
    date: new Date().toISOString().split('T')[0],
    soilType: "",
    cropType: "",
    lastTested: ""
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const fetchSoilHealth = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSoilData(mockSoilHealthData);
      setSoilHistory(mockSoilHealthHistory);
      
      toast({
        title: "Success",
        description: "Soil health data retrieved successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to retrieve soil health data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatusColor = (value: number, type: string) => {
    const ranges = {
      ph: { low: 5.5, high: 7.5 },
      organicMatter: { low: 2.0, high: 5.0 },
      nitrogen: { low: 30, high: 60 },
      phosphorus: { low: 20, high: 40 },
      potassium: { low: 150, high: 250 },
      healthIndex: { low: 60, high: 80 }
    };
    
    const range = ranges[type as keyof typeof ranges];
    
    if (type === 'ph') {
      if (value < range.low - 0.5 || value > range.high + 0.5) return "bg-red-900 text-white";
      if (value < range.low || value > range.high) return "bg-yellow-900 text-white";
      return "bg-green-900 text-white";
    } else {
      if (value < range.low) return "bg-red-900 text-white";
      if (value > range.high) return "bg-yellow-900 text-white";
      return "bg-green-900 text-white";
    }
  };

  const getHealthIndexColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 min-h-screen opacity-70">
      {/* Disabled overlay */}
      {isDisabled && (
        <div className="absolute inset-0 bg-gray-800/50 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Feature Coming Soon</h2>
            <p className="text-gray-600 mb-4">
              The Soil Health Monitor feature is currently under development and will be available in a future update.
            </p>
            <p className="text-sm text-gray-500">
              We appreciate your patience as we work to bring you comprehensive soil analysis tools.
            </p>
          </div>
        </div>
      )}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Layers className="h-8 w-8 text-primary mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-primary">Soil Health Monitor</h1>
            <p className="text-gray-600">Track and analyze your soil health for optimal crop growth</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-1">
          <Card className="p-6 bg-white border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-primary">
              <Layers className="h-5 w-5 mr-2 text-primary" />
              Soil Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="location" className="text-gray-700">Field Location</Label>
                <Select onValueChange={(value) => handleInputChange("location", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select field location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="north-field">North Field</SelectItem>
                    <SelectItem value="south-field">South Field</SelectItem>
                    <SelectItem value="east-field">East Field</SelectItem>
                    <SelectItem value="west-field">West Field</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date" className="text-gray-700">Test Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="soilType" className="text-gray-700">Soil Type</Label>
                <Select onValueChange={(value) => handleInputChange("soilType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select soil type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clay">Clay</SelectItem>
                    <SelectItem value="loamy">Loamy</SelectItem>
                    <SelectItem value="sandy">Sandy</SelectItem>
                    <SelectItem value="clay-loam">Clay-loam</SelectItem>
                    <SelectItem value="sandy-loam">Sandy-loam</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cropType" className="text-gray-700">Current/Planned Crop</Label>
                <Select onValueChange={(value) => handleInputChange("cropType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select crop" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rice">Rice</SelectItem>
                    <SelectItem value="wheat">Wheat</SelectItem>
                    <SelectItem value="maize">Maize</SelectItem>
                    <SelectItem value="sugarcane">Sugarcane</SelectItem>
                    <SelectItem value="cotton">Cotton</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="lastTested" className="text-gray-700">Last Tested</Label>
                <Select onValueChange={(value) => handleInputChange("lastTested", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-month">1 month ago</SelectItem>
                    <SelectItem value="3-months">3 months ago</SelectItem>
                    <SelectItem value="6-months">6 months ago</SelectItem>
                    <SelectItem value="1-year">1 year ago</SelectItem>
                    <SelectItem value="never">Never tested</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={fetchSoilHealth} 
                className="w-full" 
                disabled={true}
              >
                {loading ? "Analyzing..." : "Analyze Soil Health"}
              </Button>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium mb-2 flex items-center text-primary">
                  <Info className="h-4 w-4 mr-2 text-blue-500" />
                  Why Test Soil?
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Optimize fertilizer application</li>
                  <li>• Identify nutrient deficiencies</li>
                  <li>• Improve crop yields</li>
                  <li>• Save money on inputs</li>
                  <li>• Monitor soil health trends</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {!soilData ? (
            <Card className="p-8 text-center bg-white border-gray-200 shadow-sm">
              <Layers className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-primary">Soil Health Analysis</h3>
              <p className="text-gray-600 mb-4">
                Get comprehensive soil health insights based on:
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Thermometer className="h-4 w-4 mr-2 text-red-500" />
                  Nutrient Levels
                </div>
                <div className="flex items-center">
                  <Droplets className="h-4 w-4 mr-2 text-blue-500" />
                  Moisture Content
                </div>
                <div className="flex items-center">
                  <Leaf className="h-4 w-4 mr-2 text-green-500" />
                  Organic Matter
                </div>
                <div className="flex items-center">
                  <PieChart className="h-4 w-4 mr-2 text-purple-500" />
                  Soil Composition
                </div>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Soil Health Overview */}
              <Card className="p-6 bg-white border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-primary mb-1">Soil Health Overview</h2>
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline" className="text-gray-700 border-gray-300">{soilData.location}</Badge>
                      <span className="text-sm text-gray-600">
                        Tested: {new Date(soilData.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center p-1 rounded-full bg-gray-100">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center border-4 bg-white" 
                        style={{ borderColor: getHealthIndexColor(soilData.healthIndex) }}>
                        <span className="text-xl font-bold text-gray-800">{soilData.healthIndex}</span>
                      </div>
                    </div>
                    <div className="text-sm mt-1 text-gray-600">Health Index</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-800">{soilData.ph}</div>
                    <div className="text-sm text-gray-600">pH Level</div>
                    <Badge className="bg-green-100 text-green-800" variant="secondary">
                      {soilData.ph < 7 ? "Acidic" : soilData.ph > 7 ? "Alkaline" : "Neutral"}
                    </Badge>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-800">{soilData.organicMatter}%</div>
                    <div className="text-sm text-gray-600">Organic Matter</div>
                    <Badge className="bg-amber-100 text-amber-800" variant="secondary">
                      {soilData.organicMatter < 2 ? "Low" : soilData.organicMatter > 5 ? "High" : "Good"}
                    </Badge>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-800">{soilData.texture}</div>
                    <div className="text-sm text-gray-600">Soil Texture</div>
                    <Badge className="bg-blue-100 text-blue-800" variant="secondary">Medium</Badge>
                  </div>
                  <div className="text-center p-3 bg-cyan-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-800">{soilData.moisture}%</div>
                    <div className="text-sm text-gray-600">Moisture</div>
                    <Badge className="bg-cyan-100 text-cyan-800" variant="secondary">Adequate</Badge>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-800">{soilData.temperature}°C</div>
                    <div className="text-sm text-gray-600">Temperature</div>
                    <Badge className="bg-red-100 text-red-800" variant="secondary">Optimal</Badge>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-800">{soilData.cec}</div>
                    <div className="text-sm text-gray-600">CEC</div>
                    <Badge className="bg-purple-100 text-purple-800" variant="secondary">Good</Badge>
                  </div>
                </div>
              </Card>

              {/* Nutrient Analysis */}
              <Card className="p-6 bg-white border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-primary">Nutrient Analysis</h2>
                
                <Tabs defaultValue="macronutrients" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                    <TabsTrigger value="macronutrients" className="text-gray-700 data-[state=active]:bg-white">Macronutrients</TabsTrigger>
                    <TabsTrigger value="micronutrients" className="text-gray-700 data-[state=active]:bg-white">Micronutrients</TabsTrigger>
                    <TabsTrigger value="history" className="text-gray-700 data-[state=active]:bg-white">History</TabsTrigger>
                  </TabsList>

                  <TabsContent value="macronutrients" className="mt-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Nitrogen (N)</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full">
                            <div 
                              className={`h-2 rounded-full ${soilData.nitrogen < 30 ? "bg-red-500" : soilData.nitrogen > 60 ? "bg-yellow-500" : "bg-green-500"}`}
                              style={{ width: `${Math.min(100, (soilData.nitrogen / 100) * 100)}%` }}
                            />
                          </div>
                          <Badge className={getHealthStatusColor(soilData.nitrogen, 'nitrogen')} variant="secondary">
                            {soilData.nitrogen} ppm
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Phosphorus (P)</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full">
                            <div 
                              className={`h-2 rounded-full ${soilData.phosphorus < 20 ? "bg-red-500" : soilData.phosphorus > 40 ? "bg-yellow-500" : "bg-green-500"}`}
                              style={{ width: `${Math.min(100, (soilData.phosphorus / 50) * 100)}%` }}
                            />
                          </div>
                          <Badge className={getHealthStatusColor(soilData.phosphorus, 'phosphorus')} variant="secondary">
                            {soilData.phosphorus} ppm
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Potassium (K)</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full">
                            <div 
                              className={`h-2 rounded-full ${soilData.potassium < 150 ? "bg-red-500" : soilData.potassium > 250 ? "bg-yellow-500" : "bg-green-500"}`}
                              style={{ width: `${Math.min(100, (soilData.potassium / 300) * 100)}%` }}
                            />
                          </div>
                          <Badge className={getHealthStatusColor(soilData.potassium, 'potassium')} variant="secondary">
                            {soilData.potassium} ppm
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Calcium (Ca)</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 rounded-full bg-green-500"
                              style={{ width: `${Math.min(100, (soilData.calcium / 2000) * 100)}%` }}
                            />
                          </div>
                          <Badge variant="secondary">
                            {soilData.calcium} ppm
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Magnesium (Mg)</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 rounded-full bg-green-500"
                              style={{ width: `${Math.min(100, (soilData.magnesium / 300) * 100)}%` }}
                            />
                          </div>
                          <Badge variant="secondary">
                            {soilData.magnesium} ppm
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Sulfur (S)</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 rounded-full bg-green-500"
                              style={{ width: `${Math.min(100, (soilData.sulfur / 30) * 100)}%` }}
                            />
                          </div>
                          <Badge variant="secondary">
                            {soilData.sulfur} ppm
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="micronutrients" className="mt-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Zinc (Zn)</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 rounded-full bg-green-500"
                              style={{ width: `${Math.min(100, (soilData.zinc / 4) * 100)}%` }}
                            />
                          </div>
                          <Badge variant="secondary">
                            {soilData.zinc} ppm
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Iron (Fe)</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 rounded-full bg-green-500"
                              style={{ width: `${Math.min(100, (soilData.iron / 20) * 100)}%` }}
                            />
                          </div>
                          <Badge variant="secondary">
                            {soilData.iron} ppm
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Manganese (Mn)</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 rounded-full bg-green-500"
                              style={{ width: `${Math.min(100, (soilData.manganese / 15) * 100)}%` }}
                            />
                          </div>
                          <Badge variant="secondary">
                            {soilData.manganese} ppm
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Copper (Cu)</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 rounded-full bg-green-500"
                              style={{ width: `${Math.min(100, (soilData.copper / 2) * 100)}%` }}
                            />
                          </div>
                          <Badge variant="secondary">
                            {soilData.copper} ppm
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Boron (B)</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 rounded-full bg-yellow-500"
                              style={{ width: `${Math.min(100, (soilData.boron / 2) * 100)}%` }}
                            />
                          </div>
                          <Badge className="bg-gray-600 text-white" variant="secondary">
                            {soilData.boron} ppm
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="mt-4">
                    {soilHistory && (
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-sm font-medium mb-2 text-gray-700">pH Level Trend</h4>
                          <div className="h-32 flex items-end space-x-2">
                            {soilHistory.ph.map((value, index) => (
                              <div key={index} className="flex flex-col items-center flex-1">
                                <div className="w-full bg-primary/60 rounded-t" 
                                  style={{ height: `${(value - 5) * 30}px` }}>
                                </div>
                                <div className="text-xs mt-1 text-gray-700">{soilHistory.dates[index]}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2 text-gray-700">Organic Matter Trend (%)</h4>
                          <div className="h-32 flex items-end space-x-2">
                            {soilHistory.organicMatter.map((value, index) => (
                              <div key={index} className="flex flex-col items-center flex-1">
                                <div className="w-full bg-green-500 rounded-t" 
                                  style={{ height: `${value * 10}px` }}>
                                </div>
                                <div className="text-xs mt-1 text-gray-700">{soilHistory.dates[index]}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2 text-gray-700">NPK Trends</h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="text-xs mb-1 text-gray-700">Nitrogen</div>
                              <Progress value={(soilData.nitrogen / 60) * 100} className="h-2" />
                              <div className="text-xs mt-1 text-gray-600">
                                {soilHistory.nitrogen[0]} → {soilHistory.nitrogen[5]} ppm
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs mb-1 text-gray-700">Phosphorus</div>
                              <Progress value={(soilData.phosphorus / 40) * 100} className="h-2" />
                              <div className="text-xs mt-1 text-gray-600">
                                {soilHistory.phosphorus[0]} → {soilHistory.phosphorus[5]} ppm
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs mb-1 text-gray-700">Potassium</div>
                              <Progress value={(soilData.potassium / 250) * 100} className="h-2" />
                              <div className="text-xs mt-1 text-gray-600">
                                {soilHistory.potassium[0]} → {soilHistory.potassium[5]} ppm
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </Card>

              {/* Recommendations and Issues */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-white border-gray-200 shadow-sm">
                  <h3 className="font-semibold mb-4 flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {soilData.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-6 bg-white border-gray-200 shadow-sm">
                  <h3 className="font-semibold mb-4 flex items-center text-amber-600">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Issues to Address
                  </h3>
                  <div className="space-y-4">
                    {soilData.deficiencies.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-red-600">Deficiencies</h4>
                        <ul className="space-y-1">
                          {soilData.deficiencies.map((item, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-red-600 mr-2">•</span>
                              <span className="text-sm text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {soilData.excesses.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-amber-600">Excesses</h4>
                        <ul className="space-y-1">
                          {soilData.excesses.map((item, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-amber-600 mr-2">•</span>
                              <span className="text-sm text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
