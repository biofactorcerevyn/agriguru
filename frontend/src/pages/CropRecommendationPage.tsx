import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wheat, TrendingUp, Calendar, MapPin, Thermometer, Droplets, DollarSign, Clock, Lightbulb, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

// API Configuration - same as YieldPredictionPage
const API_BASE_URL = "http://localhost:8000";

interface CropRecommendation {
  name: string;
  suitability: number;
  expectedYield: string;
  marketPrice: string;
  profitability: string;
  season: string;
  waterRequirement: string;
  soilType: string[];
  growthPeriod: string;
  benefits: string[];
  challenges: string[];
}

// No mock data needed - using API data

export default function CropRecommendationPage() {
  const [formData, setFormData] = useState({
    state: "",
    district: "",
    soilType: "",
    farmSize: "",
    season: "",
    waterAvailability: "",
    budget: ""
  });
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const { toast } = useToast();

  // Fetch states when component mounts
  useEffect(() => {
    const fetchStates = async () => {
      setLoadingStates(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/crop/states`);
        if (response.data.status === "success") {
          setStates(response.data.states);
        } else {
          console.error("Failed to fetch states:", response.data);
        }
      } catch (err) {
        console.error("Error fetching states:", err);
        // Fallback states in case the API call fails
        setStates([
          "Andhra Pradesh", "Assam", "Bihar", "Gujarat", "Haryana", "Karnataka", 
          "Madhya Pradesh", "Maharashtra", "Punjab", "Tamil Nadu", "Uttar Pradesh", 
          "West Bengal"
        ]);
      } finally {
        setLoadingStates(false);
      }
    };
    
    fetchStates();
  }, []);

  // Fetch districts when state changes
  useEffect(() => {
    // Reset district when state changes
    setFormData(prev => ({ ...prev, district: "" }));
    setDistricts([]);
    
    if (!formData.state) return;
    
    const fetchDistricts = async () => {
      setLoadingDistricts(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/crop/districts?state=${formData.state}`);
        if (response.data.status === "success") {
          setDistricts(response.data.districts);
          console.log("Loaded districts:", response.data.districts);
        } else {
          console.error("Failed to fetch districts:", response.data);
        }
      } catch (err) {
        console.error("Error fetching districts:", err);
        toast({
          title: "Warning",
          description: "Could not load districts for selected state. Please enter district manually.",
          variant: "destructive",
        });
      } finally {
        setLoadingDistricts(false);
      }
    };
    
    fetchDistricts();
  }, [formData.state]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateRecommendations = async () => {
    // Validate required fields
    if (!formData.state || !formData.district || !formData.soilType || !formData.season) {
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
        state: formData.state,
        district: formData.district,
        soilType: formData.soilType,
        farmSize: formData.farmSize,
        season: formData.season,
        waterAvailability: formData.waterAvailability,
        budget: formData.budget
      };
      
      // Make the API call to our unified server
      const response = await axios.post(`${API_BASE_URL}/crop/recommend`, payload);
      console.log("API Response:", response.data);
      
      if (response.data.status === "success" && Array.isArray(response.data.recommendations)) {
        setRecommendations(response.data.recommendations);
        console.log("Setting recommendations:", response.data.recommendations);
      } else {
        console.error("Unexpected API response format:", response.data);
        throw new Error(response.data.message || "Failed to get recommendations or invalid response format");
      }
      toast({
        title: "Success",
        description: "Crop recommendations generated successfully!",
      });
    } catch (err: any) {
      console.error("Recommendation error:", err);
      const errorMessage = err.response?.data?.message || "Failed to generate recommendations. Please try again.";
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

  const getSuitabilityColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 80) return "bg-yellow-500";
    if (score >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getProfitabilityColor = (profitability: string) => {
    if (profitability === "High") return "text-green-600 bg-green-50";
    if (profitability === "Medium-High" || profitability === "Medium") return "text-yellow-600 bg-yellow-50";
    if (profitability === "Low") return "text-red-600 bg-red-50";
    // Default case if profitability is undefined or has an unexpected value
    return "text-blue-600 bg-blue-50";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl bg-white min-h-screen">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Wheat className="h-8 w-8 text-primary mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-primary">AI Crop Recommendation</h1>
            <p className="text-gray-600">Get personalized crop suggestions based on your farm conditions</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-1">
          <Card className="p-6 bg-white border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-primary">
              <MapPin className="h-5 w-5 mr-2 text-primary" />
              Farm Details
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
                <Label htmlFor="state">State</Label>
                <Select 
                  onValueChange={(value) => handleInputChange("state", value)}
                  disabled={loadingStates}
                >
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder={loadingStates ? "Loading states..." : "Select your state"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 max-h-[300px] overflow-y-auto">
                    {states.map(state => (
                      <SelectItem key={state} value={state.toLowerCase()}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="district">District</Label>
                {districts.length > 0 ? (
                  <Select 
                    onValueChange={(value) => handleInputChange("district", value)}
                    disabled={loadingDistricts || districts.length === 0}
                  >
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder={loadingDistricts ? "Loading districts..." : "Select district"} />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 max-h-[300px] overflow-y-auto">
                      {districts.map(district => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="district"
                    placeholder="Enter your district"
                    value={formData.district}
                    onChange={(e) => handleInputChange("district", e.target.value)}
                  />
                )}
              </div>

              <div>
                <Label htmlFor="soilType">Soil Type</Label>
                <Select onValueChange={(value) => handleInputChange("soilType", value)}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select soil type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="clay">Clay</SelectItem>
                    <SelectItem value="loamy">Loamy</SelectItem>
                    <SelectItem value="sandy">Sandy</SelectItem>
                    <SelectItem value="clay-loam">Clay-loam</SelectItem>
                    <SelectItem value="sandy-loam">Sandy-loam</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="farmSize">Farm Size (acres)</Label>
                <Input
                  id="farmSize"
                  type="number"
                  placeholder="Enter farm size"
                  value={formData.farmSize}
                  onChange={(e) => handleInputChange("farmSize", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="season">Preferred Season</Label>
                <Select onValueChange={(value) => handleInputChange("season", value)}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="kharif">Kharif (Monsoon)</SelectItem>
                    <SelectItem value="rabi">Rabi (Winter)</SelectItem>
                    <SelectItem value="zaid">Zaid (Summer)</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="waterAvailability">Water Availability</Label>
                <Select onValueChange={(value) => handleInputChange("waterAvailability", value)}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select water availability" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="high">High (Irrigation + Rainfall)</SelectItem>
                    <SelectItem value="medium">Medium (Limited irrigation)</SelectItem>
                    <SelectItem value="low">Low (Rain-fed only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="budget">Budget Range (₹/acre)</Label>
                <Select onValueChange={(value) => handleInputChange("budget", value)}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="low">₹10,000 - ₹25,000</SelectItem>
                    <SelectItem value="medium">₹25,000 - ₹50,000</SelectItem>
                    <SelectItem value="high">₹50,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={generateRecommendations} 
                className="w-full bg-primary hover:bg-primary/90 text-white" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">◌</span>
                    Analyzing...
                  </>
                ) : "Get AI Recommendations"}
              </Button>
            </div>
          </Card>
        </div>

        {/* Recommendations */}
        <div className="lg:col-span-2">
          {recommendations.length === 0 ? (
            <Card className="p-8 text-center bg-white border border-gray-200 shadow-sm">
              <Lightbulb className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-primary">AI-Powered Crop Analysis</h3>
              <p className="text-gray-600 mb-4">
                Fill in your farm details to get personalized crop recommendations based on:
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-primary" />
                  Location & Climate
                </div>
                <div className="flex items-center">
                  <Thermometer className="h-4 w-4 mr-2 text-primary" />
                  Soil Conditions
                </div>
                <div className="flex items-center">
                  <Droplets className="h-4 w-4 mr-2 text-primary" />
                  Water Availability
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-accent" />
                  Market Prices
                </div>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-primary">Recommended Crops</h2>
                <Badge variant="secondary" className="text-sm bg-primary/20 text-primary">
                  {recommendations.length} recommendations
                </Badge>
              </div>

              {recommendations.map((crop, index) => {
                console.log("Rendering crop:", crop);
                return (
                <Card key={index} className="p-6 bg-white border border-gray-200 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold flex items-center text-gray-800">
                        {crop.name}
                        <Badge 
                          className={`ml-3 ${getProfitabilityColor(crop.profitability)}`}
                          variant="secondary"
                        >
                          {crop.profitability} Profit
                        </Badge>
                      </h3>
                      <div className="flex items-center mt-2">
                        <span className="text-sm text-gray-600 mr-4">Suitability Score:</span>
                        <div className="flex items-center">
                          <div className="w-24 h-2 bg-gray-300 rounded-full mr-2">
                            <div 
                              className={`h-2 rounded-full ${getSuitabilityColor(crop.suitability)}`}
                              style={{ width: `${crop.suitability}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-800">{crop.suitability}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="requirements">Requirements</TabsTrigger>
                      <TabsTrigger value="analysis">Analysis</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-gray-100 rounded-lg">
                          <TrendingUp className="h-5 w-5 mx-auto mb-1 text-primary" />
                          <div className="text-sm font-medium text-gray-800">Expected Yield</div>
                          <div className="text-xs text-gray-600">{crop.expectedYield}</div>
                        </div>
                        <div className="text-center p-3 bg-gray-100 rounded-lg">
                          <DollarSign className="h-5 w-5 mx-auto mb-1 text-primary" />
                          <div className="text-sm font-medium text-gray-800">Market Price</div>
                          <div className="text-xs text-gray-600">{crop.marketPrice}</div>
                        </div>
                        <div className="text-center p-3 bg-gray-100 rounded-lg">
                          <Calendar className="h-5 w-5 mx-auto mb-1 text-primary" />
                          <div className="text-sm font-medium text-gray-800">Season</div>
                          <div className="text-xs text-gray-600">{crop.season}</div>
                        </div>
                        <div className="text-center p-3 bg-gray-100 rounded-lg">
                          <Clock className="h-5 w-5 mx-auto mb-1 text-accent" />
                          <div className="text-sm font-medium text-gray-800">Growth Period</div>
                          <div className="text-xs text-gray-600">{crop.growthPeriod}</div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="requirements" className="mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2 flex items-center text-gray-800">
                            <Droplets className="h-4 w-4 mr-2 text-primary" />
                            Water Requirement
                          </h4>
                          <p className="text-sm text-gray-600">{crop.waterRequirement}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2 text-gray-800">Suitable Soil Types</h4>
                          <div className="flex flex-wrap gap-1">
                            {crop.soilType.map((soil, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs text-gray-600 border-gray-300">
                                {soil}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="analysis" className="mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2 text-primary">Benefits</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {crop.benefits.map((benefit, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-primary mr-2">•</span>
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2 text-accent">Challenges</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {crop.challenges.map((challenge, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-accent mr-2">•</span>
                                {challenge}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </Card>
              )})}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
