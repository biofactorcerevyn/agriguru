import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Beaker, Leaf, DollarSign, Calendar, AlertCircle, CheckCircle, Info, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

// API Configuration - same as other pages
const API_BASE_URL = "http://localhost:8000";

interface FertilizerRecommendation {
  crop: string;
  farmSize: number;
  soilTest: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    ph: number;
    organicMatter: number;
  };
  recommendations: {
    primary: {
      name: string;
      npk: string;
      quantity: number;
      cost: number;
      applicationTiming: string[];
    }[];
    secondary: {
      name: string;
      quantity: number;
      cost: number;
      purpose: string;
    }[];
    organic: {
      name: string;
      quantity: number;
      cost: number;
      benefits: string[];
    }[];
  };
  totalCost: number;
  applicationSchedule: {
    stage: string;
    fertilizer: string;
    quantity: number;
    method: string;
    timing: string;
  }[];
  tips: string[];
  warnings: string[];
}

export default function FertilizerCalculatorPage() {
  const [formData, setFormData] = useState({
    crop: "",
    variety: "",
    farmSize: "",
    soilType: "",
    targetYield: "",
    previousYield: "",
    soilPh: "",
    organicMatter: "",
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    budget: "",
    season: ""
  });
  const [recommendation, setRecommendation] = useState<FertilizerRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateFertilizer = async () => {
    // Validate required fields
    if (!formData.crop || !formData.farmSize || !formData.soilType) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Create payload for API request
      const payload = {
        crop: formData.crop,
        farmSize: formData.farmSize,
        soilType: formData.soilType,
        targetYield: formData.targetYield,
        soilPh: formData.soilPh,
        organicMatter: formData.organicMatter,
        nitrogen: formData.nitrogen,
        phosphorus: formData.phosphorus,
        potassium: formData.potassium
      };
      
      // Make the API call to our unified server
      const response = await axios.post(`${API_BASE_URL}/fertilizer/calculate`, payload);
      
      if (response.data.status === "success") {
        setRecommendation(response.data.recommendation);
      } else {
        throw new Error(response.data.message || "Failed to calculate fertilizer recommendations");
      }
      setRecommendation(response.data.recommendation);
      toast({
        title: "Success",
        description: "Fertilizer recommendations calculated successfully!",
      });
    } catch (err: any) {
      console.error("Fertilizer calculation error:", err);
      const errorMessage = err.response?.data?.message || "Failed to calculate recommendations. Please try again.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getNutrientStatus = (value: number, nutrient: string) => {
    const ranges = {
      nitrogen: { low: 150, medium: 200, high: 250 },
      phosphorus: { low: 20, medium: 40, high: 60 },
      potassium: { low: 120, medium: 180, high: 240 }
    };
    
    const range = ranges[nutrient as keyof typeof ranges];
    if (value < range.low) return { status: "Low", color: "text-red-600 bg-red-50" };
    if (value < range.medium) return { status: "Medium", color: "text-yellow-600 bg-yellow-50" };
    return { status: "High", color: "text-green-600 bg-green-50" };
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl bg-white min-h-screen">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Calculator className="h-8 w-8 text-primary mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-primary">Fertilizer Calculator</h1>
            <p className="text-gray-600">Calculate optimal fertilizer requirements based on soil test and crop needs</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-1">
          <Card className="p-6 bg-white border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-primary">
              <Beaker className="h-5 w-5 mr-2 text-primary" />
              Crop & Soil Details
            </h2>
            
            {/* Display error message if present */}
            {error && (
              <div className="mb-4 p-3 bg-destructive/20 border border-destructive/50 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-destructiveForeground mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-destructiveForeground">{error}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="crop">Crop Type</Label>
                <Select onValueChange={(value) => handleInputChange("crop", value)}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select crop" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="rice">Rice</SelectItem>
                    <SelectItem value="wheat">Wheat</SelectItem>
                    <SelectItem value="maize">Maize</SelectItem>
                    <SelectItem value="sugarcane">Sugarcane</SelectItem>
                    <SelectItem value="cotton">Cotton</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="farmSize">Farm Size (hectares)</Label>
                <Input
                  id="farmSize"
                  type="number"
                  step="0.1"
                  placeholder="Enter farm size"
                  value={formData.farmSize}
                  onChange={(e) => handleInputChange("farmSize", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="targetYield">Target Yield (tons/ha)</Label>
                <Input
                  id="targetYield"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 5.0"
                  value={formData.targetYield}
                  onChange={(e) => handleInputChange("targetYield", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="soilType">Soil Type</Label>
                <Select onValueChange={(value) => handleInputChange("soilType", value)}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select soil type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="Clay">Clay</SelectItem>
                    <SelectItem value="Loamy">Loamy</SelectItem>
                    <SelectItem value="Sandy">Sandy</SelectItem>
                    <SelectItem value="Clayey">Clayey</SelectItem>
                    <SelectItem value="Clay-loam">Clay-loam</SelectItem>
                    <SelectItem value="Sandy-loam">Sandy-loam</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-medium mb-3 text-gray-800">Soil Test Results (kg/ha)</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="nitrogen">Nitrogen (N)</Label>
                    <Input
                      id="nitrogen"
                      type="number"
                      placeholder="180"
                      value={formData.nitrogen}
                      onChange={(e) => handleInputChange("nitrogen", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phosphorus">Phosphorus (P)</Label>
                    <Input
                      id="phosphorus"
                      type="number"
                      placeholder="25"
                      value={formData.phosphorus}
                      onChange={(e) => handleInputChange("phosphorus", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="potassium">Potassium (K)</Label>
                    <Input
                      id="potassium"
                      type="number"
                      placeholder="150"
                      value={formData.potassium}
                      onChange={(e) => handleInputChange("potassium", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="soilPh">Soil pH</Label>
                    <Input
                      id="soilPh"
                      type="number"
                      step="0.1"
                      placeholder="6.5"
                      value={formData.soilPh}
                      onChange={(e) => handleInputChange("soilPh", e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <Label htmlFor="organicMatter">Organic Matter (%)</Label>
                  <Input
                    id="organicMatter"
                    type="number"
                    step="0.1"
                    placeholder="1.2"
                    value={formData.organicMatter}
                    onChange={(e) => handleInputChange("organicMatter", e.target.value)}
                  />
                </div>
              </div>

              <Button 
                onClick={calculateFertilizer} 
                className="w-full bg-primary hover:bg-primary/90 text-white" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : "Calculate Fertilizer"}
              </Button>
            </div>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {!recommendation ? (
            <Card className="p-8 text-center bg-white border-gray-200 shadow-sm">
              <Leaf className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-primary">Precision Fertilizer Calculation</h3>
              <p className="text-gray-600 mb-4">
                Get customized fertilizer recommendations based on:
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Beaker className="h-4 w-4 mr-2 text-primary" />
                  Soil Test Results
                </div>
                <div className="flex items-center">
                  <Leaf className="h-4 w-4 mr-2 text-primary" />
                  Crop Requirements
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-accent" />
                  Cost Optimization
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  Application Timing
                </div>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Soil Status */}
              <Card className="p-6 bg-white border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-primary">Soil Nutrient Status</h2>
                <div className="grid grid-cols-3 gap-4">
                  {['nitrogen', 'phosphorus', 'potassium'].map((nutrient) => {
                    const value = recommendation.soilTest[nutrient as keyof typeof recommendation.soilTest];
                    const status = getNutrientStatus(value, nutrient);
                    return (
                      <div key={nutrient} className="text-center p-3 bg-gray-100 rounded-lg">
                        <div className="text-lg font-bold text-gray-800">{value}</div>
                        <div className="text-sm text-gray-600 capitalize">{nutrient}</div>
                        <Badge className={`mt-1 ${status.color}`} variant="secondary">
                          {status.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-100 rounded-lg">
                    <div className="text-lg font-bold text-gray-800">{recommendation.soilTest.ph}</div>
                    <div className="text-sm text-gray-600">pH Level</div>
                  </div>
                  <div className="text-center p-3 bg-gray-100 rounded-lg">
                    <div className="text-lg font-bold text-gray-800">{recommendation.soilTest.organicMatter}%</div>
                    <div className="text-sm text-gray-600">Organic Matter</div>
                  </div>
                </div>
              </Card>

              {/* Recommendations */}
              <Card className="p-6 bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-primary">Fertilizer Recommendations</h2>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">₹{recommendation.totalCost.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Cost</div>
                  </div>
                </div>

                <Tabs defaultValue="primary" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-gray-100">
                    <TabsTrigger value="primary">Primary</TabsTrigger>
                    <TabsTrigger value="secondary">Secondary</TabsTrigger>
                    <TabsTrigger value="organic">Organic</TabsTrigger>
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                  </TabsList>

                  <TabsContent value="primary" className="mt-4">
                    <div className="space-y-4">
                      {recommendation.recommendations.primary.map((fertilizer, index) => (
                        <div key={index} className="border border-gray-200 bg-white rounded-lg p-4 shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-800">{fertilizer.name}</h4>
                              <p className="text-sm text-gray-600">{fertilizer.npk}</p>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-gray-800">{fertilizer.quantity} kg</div>
                              <div className="text-sm text-gray-600">₹{fertilizer.cost}</div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {fertilizer.applicationTiming.map((timing, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {timing}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="secondary" className="mt-4">
                    <div className="space-y-4">
                      {recommendation.recommendations.secondary.map((fertilizer, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{fertilizer.name}</h4>
                              <p className="text-sm text-muted-foreground">{fertilizer.purpose}</p>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{fertilizer.quantity} kg</div>
                              <div className="text-sm text-muted-foreground">₹{fertilizer.cost}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="organic" className="mt-4">
                    <div className="space-y-4">
                      {recommendation.recommendations.organic.map((fertilizer, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold">{fertilizer.name}</h4>
                              <div className="text-sm text-muted-foreground">
                                {fertilizer.benefits.join(", ")}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{fertilizer.quantity} kg</div>
                              <div className="text-sm text-muted-foreground">₹{fertilizer.cost}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="schedule" className="mt-4">
                    <div className="space-y-4">
                      {recommendation.applicationSchedule.map((schedule, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold">{schedule.stage}</h4>
                              <p className="text-sm text-muted-foreground">{schedule.timing}</p>
                            </div>
                            <Badge variant="outline">{schedule.method}</Badge>
                          </div>
                          <div className="text-sm">
                            <strong>{schedule.fertilizer}</strong> - {schedule.quantity} kg
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>

              {/* Tips and Warnings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-white border border-gray-200 shadow-sm">
                  <h3 className="font-semibold mb-4 flex items-center text-primary">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Application Tips
                  </h3>
                  <ul className="space-y-2">
                    {recommendation.tips.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <Info className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-6 bg-white border border-gray-200 shadow-sm">
                  <h3 className="font-semibold mb-4 flex items-center text-accent">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Important Warnings
                  </h3>
                  <ul className="space-y-2">
                    {recommendation.warnings.map((warning, index) => (
                      <li key={index} className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{warning}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
