import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, BarChart3, Cloud, Droplets, Sprout, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

// API Configuration
const API_BASE_URL = "http://localhost:8000";

// Types aligned with API response
interface YieldPrediction {
  crop: string;
  state: string;
  season: string;
  prediction: number;
}

// API response types
interface ApiResponse<T> {
  status: string;
  prediction?: T;
  message?: string;
}

// Model data types (aligned with pkl files used in app.py)
interface ModelData {
  crops: string[];
  states: string[];
  seasons: string[];
}

export default function YieldPredictionPage() {
  // Form state to match the ML model inputs exactly
  const [formData, setFormData] = useState({
    crop: "",
    state: "",
    season: "",
    year: "",
    rainfall: "",
    fertilizer: "",
    pesticide: ""
  });
  const [prediction, setPrediction] = useState<YieldPrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelData, setModelData] = useState<ModelData>({
    crops: [],
    states: [],
    seasons: []
  });
  const { toast } = useToast();

  // Load model data (crops, states, seasons) from API on component mount
  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);
      setError(null);
      
      try {
        const response = await axios.get(`${API_BASE_URL}/yield/options`);
        setModelData({
          crops: response.data.crops || [],
          states: response.data.states || [],
          seasons: response.data.seasons || [],
        });
      } catch (err) {
        console.error("Failed to load options:", err);
        setError("Failed to load form options. Please try refreshing the page.");
        toast({
          title: "Error",
          description: "Failed to load form options. Please try refreshing the page.",
          variant: "destructive",
        });
      } finally {
        setLoadingOptions(false);
      }
    };
    
    fetchOptions();
  }, [toast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generatePrediction = async () => {
    // Validate required fields
    if (!formData.crop || !formData.state || !formData.season) {
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
        state: formData.state,
        season: formData.season
      };
      
      // Add optional fields if they have values
      if (formData.year) payload["year"] = formData.year;
      if (formData.rainfall) payload["rainfall"] = formData.rainfall;
      if (formData.fertilizer) payload["fertilizer"] = formData.fertilizer;
      if (formData.pesticide) payload["pesticide"] = formData.pesticide;

      // Make the API call to our unified server
      const response = await axios.post<ApiResponse<YieldPrediction>>(
        `${API_BASE_URL}/yield/predict`, 
        payload
      );
      
      if (response.data.status === "success" && response.data.prediction) {
        setPrediction(response.data.prediction);
        toast({
          title: "Success",
          description: "Yield prediction generated successfully!",
        });
      } else {
        throw new Error(response.data.message || "Failed to generate prediction");
      }
    } catch (err) {
      console.error("Prediction error:", err);
      const errorMessage = err.response?.data?.message || "Failed to generate prediction. Please try again.";
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

  // Helper function to get a color based on the prediction value
  const getPredictionColor = (yield_value: number) => {
    if (yield_value >= 4) return "text-green-600";
    if (yield_value >= 3) return "text-yellow-600";
    return "text-blue-600";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl bg-white min-h-screen">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <TrendingUp className="h-8 w-8 text-primary mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-primary">AI Yield Prediction</h1>
            <p className="text-gray-600">Predict your crop yield using advanced AI models and historical data</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-1">
          <Card className="p-6 bg-white border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-primary">
              <Sprout className="h-5 w-5 mr-2 text-primary" />
              Crop Yield Prediction
            </h2>
            
            {/* Display error message if present */}
            {error && (
              <div className="mb-4 p-3 bg-destructive/20 border border-destructive/50 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-destructiveForeground mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-destructiveForeground">{error}</p>
              </div>
            )}
            
            <div className="space-y-4">
              {loadingOptions ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  {/* Required Fields */}
                  <div>
                    <Label htmlFor="crop">Crop Type <span className="text-red-500">*</span></Label>
                    <Select onValueChange={(value) => handleInputChange("crop", value)} disabled={loadingOptions}>
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder="Select crop" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        {modelData.crops.map((crop) => (
                          <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="state">State <span className="text-red-500">*</span></Label>
                    <Select onValueChange={(value) => handleInputChange("state", value)} disabled={loadingOptions}>
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        {modelData.states.map((state) => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="season">Season <span className="text-red-500">*</span></Label>
                    <Select onValueChange={(value) => handleInputChange("season", value)} disabled={loadingOptions}>
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder="Select season" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        {modelData.seasons.map((season) => (
                          <SelectItem key={season} value={season}>{season}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Optional Fields */}
              <div>
                <Label htmlFor="year">Crop Year (Optional)</Label>
                <Input
                  id="year"
                  type="number"
                  placeholder="Enter year"
                  value={formData.year}
                  onChange={(e) => handleInputChange("year", e.target.value)}
                  min="2000"
                  max="2025"
                />
              </div>

              <div>
                <Label htmlFor="rainfall">Annual Rainfall (Optional)</Label>
                <Input
                  id="rainfall"
                  type="number"
                  placeholder="Enter rainfall in mm"
                  value={formData.rainfall}
                  onChange={(e) => handleInputChange("rainfall", e.target.value)}
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="fertilizer">Fertilizer (Optional)</Label>
                <Input
                  id="fertilizer"
                  type="number"
                  placeholder="Enter fertilizer amount"
                  value={formData.fertilizer}
                  onChange={(e) => handleInputChange("fertilizer", e.target.value)}
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="pesticide">Pesticide (Optional)</Label>
                <Input
                  id="pesticide"
                  type="number"
                  placeholder="Enter pesticide amount"
                  value={formData.pesticide}
                  onChange={(e) => handleInputChange("pesticide", e.target.value)}
                  min="0"
                />
              </div>

              <Button 
                onClick={generatePrediction} 
                className="w-full bg-primary hover:bg-primary/90 text-white" 
                disabled={loading || loadingOptions}
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">◌</span>
                    Analyzing...
                  </>
                ) : "Predict Yield"}
              </Button>
            </div>
          </Card>
        </div>

        {/* Prediction Results */}
        <div className="lg:col-span-2">
          {!prediction ? (
            <Card className="p-8 text-center bg-white border-gray-200 shadow-sm">
              <BarChart3 className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-primary">AI Yield Analysis</h3>
              <p className="text-gray-600 mb-4">
                Our ML model analyzes multiple factors to predict your crop yield:
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Cloud className="h-4 w-4 mr-2 text-primary" />
                  Seasonal Patterns
                </div>
                <div className="flex items-center">
                  <Droplets className="h-4 w-4 mr-2 text-primary" />
                  Rainfall & Irrigation
                </div>
                <div className="flex items-center">
                  <Sprout className="h-4 w-4 mr-2 text-primary" />
                  Fertilizer Usage
                </div>
                <div className="flex items-center">
                  <Sprout className="h-4 w-4 mr-2 text-accent" />
                  Pesticide Application
                </div>
              </div>
            </Card>
          ) : (
            <div>
              {/* Prediction Result Card */}
              <Card className="p-6 bg-white border border-gray-200 shadow-sm">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-4 text-primary">Yield Prediction Results</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2 text-primary">Crop Information</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Crop:</span>
                          <span className="font-medium text-gray-800">{prediction.crop}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">State:</span>
                          <span className="font-medium text-gray-800">{prediction.state}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Season:</span>
                          <span className="font-medium text-gray-800">{prediction.season}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center">
                      <h3 className="text-lg font-semibold mb-2 text-primary">Predicted Yield</h3>
                      <div className={`text-4xl font-bold ${getPredictionColor(prediction.prediction)}`}>
                        {prediction.prediction}
                      </div>
                      <div className="text-sm text-gray-600 mt-2">Metric Tons per Hectare</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
