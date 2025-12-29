import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Sprout, MapPin, Calendar, RefreshCw, User, Leaf, Droplets, Flower } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useLocation } from "@/contexts/LocationContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CultivationTip {
  crop_name: string;
  best_season: string;
  varieties: string[];
  soil_preparation: string[];
  irrigation: string;
  fertilizer: string[];
  pest_management: string[];
  weed_control: string[];
  harvest_indicators: string[];
  post_harvest: string[];
  expected_yield: string;
  region_note?: string;
  fetched_at?: string;
}

interface TipsHistory {
  tips: CultivationTip[];
  lastFetched: string;
  location: {
    state: string;
    district: string;
  };
  crops: string[];
}

interface FarmerProfile {
  id: string;
  full_name: string;
  state: string;
  district: string;
  village?: string;
  farm_size_value?: number;
  farm_size_unit: string;
  experience_level: string;
  preferred_language: string;
  phone?: string;
  email?: string;
  primary_soil_type?: string;
  water_source?: string;
  farming_objective?: string;
  preferred_crops?: string[];
}

export default function CultivationTipsPage() {
  const navigate = useNavigate();
  const { location } = useLocation();
  const [tips, setTips] = useState<CultivationTip[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetched, setFetched] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  
  // State for tips history
  const [tipsHistory, setTipsHistory] = useState<TipsHistory | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Local storage key for cultivation tips
  const STORAGE_KEY = 'agriguru-cultivation-tips';

  useEffect(() => {
    fetchUserProfile();
    loadTipsHistory();
  }, []);
  
  const loadTipsHistory = () => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEY);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory) as TipsHistory;
        setTipsHistory(parsedHistory);
      }
    } catch (error) {
      console.error("Error loading tips history from localStorage:", error);
      // Don't set an error state as this is non-critical
    }
  };
  
  const saveTipsHistory = (newTips: CultivationTip[], profileData: FarmerProfile) => {
    try {
      // Add timestamp to each tip
      const timestampedTips = newTips.map(tip => ({
        ...tip,
        fetched_at: new Date().toISOString()
      }));
      
      const historyData: TipsHistory = {
        tips: timestampedTips,
        lastFetched: new Date().toISOString(),
        location: {
          state: profileData.state,
          district: profileData.district
        },
        crops: profileData.preferred_crops || []
      };
      
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(historyData));
      
      // Update state
      setTipsHistory(historyData);
    } catch (error) {
      console.error("Error saving tips history to localStorage:", error);
      // Non-critical error, so just log it
    }
  };
  
  const clearTipsHistory = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setTipsHistory(null);
      toast({
        title: "History cleared",
        description: "Your cultivation tips history has been cleared.",
      });
    } catch (error) {
      console.error("Error clearing tips history:", error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      setProfileLoading(true);
      setProfileError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfileError("User not authenticated. Please log in.");
        return;
      }

      const { data, error } = await (supabase as any)
        .from('farmer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setProfile(data);
      } else {
        setProfileError("Profile not found. Please complete your profile setup.");
      }
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      setProfileError("Failed to load profile information.");
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchCultivationTips = async () => {
    setLoading(true);
    setError(null);

    if (!profile) {
      setError("Profile information is required. Please complete your profile first.");
      setLoading(false);
      return;
    }

    if (!profile.preferred_crops || profile.preferred_crops.length === 0) {
      setError("No preferred crops found in your profile. Please add crops in your profile settings.");
      setLoading(false);
      return;
    }

    try {
      // Call the API to get cultivation tips based on user location
      const response = await axios.post("http://localhost:8000/cultivation_tips", {
        location: {
          state: profile.state,
          district: profile.district
        },
        crops: profile.preferred_crops,
        language: "en" // Default to English
      });

      if (response.data && response.data.tips) {
        const newTips = response.data.tips;
        setTips(newTips);
        setFetched(true);
        
        // Save tips to localStorage
        if (profile) {
          saveTipsHistory(newTips, profile);
        }
        
        // Show success message
        toast({
          title: "Cultivation tips fetched successfully",
          description: `Found ${newTips.length} cultivation tips for your crops.`,
        });
      } else {
        throw new Error("No tips data received from server");
      }
    } catch (err: any) {
      console.error("Error fetching cultivation tips:", err);
      setError(err.message || "Failed to fetch cultivation tips. Please try again.");
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch cultivation tips. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Flower className="h-8 w-8 text-green-500 mr-3" />
          <div>
            <h1 className="text-3xl font-bold">Cultivation Tips</h1>
            <p className="text-gray-600">Get personalized cultivation guidance for your crops and region</p>
          </div>
        </div>

        {profileError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Profile Error</AlertTitle>
            <AlertDescription className="flex flex-col gap-4">
              <p>{profileError}</p>
              <div>
                <Button 
                  onClick={() => navigate('/profile')} 
                  size="sm" 
                  variant="outline"
                  className="mt-2"
                >
                  <User className="h-4 w-4 mr-2" /> Go to Profile
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {profileLoading ? (
          <Card className="mb-6 p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-40" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Skeleton className="h-5 w-20 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-5 w-20 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-5 w-20 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <Skeleton className="h-12 w-full" />
            </div>
          </Card>
        ) : profile ? (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Your Location Information</CardTitle>
              <CardDescription>Cultivation tips are personalized based on this data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-muted-foreground">State</span>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-primary" />
                    <span className="font-medium">{profile.state}</span>
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-muted-foreground">District</span>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-primary" />
                    <span className="font-medium">{profile.district}</span>
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-muted-foreground">Crops</span>
                  <div className="flex flex-wrap gap-2">
                    {profile.preferred_crops && profile.preferred_crops.length > 0 ? profile.preferred_crops.map(crop => (
                      <Badge key={crop} variant="outline" className="bg-green-50">
                        <Sprout className="h-3 w-3 mr-1 text-green-600" />
                        {crop}
                      </Badge>
                    )) : (
                      <div className="text-sm text-yellow-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span>No preferred crops selected. Please update your profile.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-3 border-t">
              <div className="w-full flex flex-col gap-2">
                <Button 
                  onClick={fetchCultivationTips}
                  disabled={loading || !profile?.preferred_crops || profile.preferred_crops.length === 0}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
                      Analyzing crop requirements...
                    </>
                  ) : (
                    <>
                      <Flower className="h-4 w-4 mr-2" /> 
                      Get Cultivation Tips
                    </>
                  )}
                </Button>
                
              {(!profile.preferred_crops || profile.preferred_crops.length === 0) && (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate('/profile')}
                >
                  <User className="h-4 w-4 mr-2" /> 
                  Add Crops to Your Profile
                </Button>
              )}
              </div>
            </CardFooter>
          </Card>
        ) : null}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-1/4" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tips History Toggle */}
        {tipsHistory && tipsHistory.tips.length > 0 && (
          <div className="mb-4">
            <Button 
              variant="outline" 
              className="w-full flex justify-between items-center" 
              onClick={() => setShowHistory(!showHistory)}
            >
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" /> 
                {showHistory ? "Hide Tips History" : "Show Tips History"}
              </span>
              <span className="text-xs text-muted-foreground">
                Last fetched: {new Date(tipsHistory.lastFetched).toLocaleString()}
              </span>
              {showHistory && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-2 text-red-500 hover:text-red-700" 
                  onClick={(e) => {
                    e.stopPropagation();
                    clearTipsHistory();
                  }}
                >
                  Clear
                </Button>
              )}
            </Button>
          </div>
        )}
        
        {/* Previous Tips */}
        {showHistory && tipsHistory && tipsHistory.tips.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Previous Tips History
            </h3>
            <Card className="mb-4 bg-gray-50">
              <CardContent className="pt-4">
                <div className="text-sm mb-2">
                  <span className="font-medium">Location:</span> {tipsHistory.location.district}, {tipsHistory.location.state}
                </div>
                <div className="text-sm mb-4">
                  <span className="font-medium">Crops:</span> {tipsHistory.crops.join(", ")}
                </div>
                
                <div className="space-y-4">
                  {tipsHistory.tips.map((tip, index) => (
                    <Card key={`history-${index}`} className="overflow-hidden border-gray-200">
                      <CardHeader className="pb-2 bg-gray-100">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base flex items-center">
                              <Flower className="h-4 w-4 text-green-500 mr-2" />
                              {tip.crop_name}
                            </CardTitle>
                            <CardDescription className="text-xs">Best Season: {tip.best_season}</CardDescription>
                          </div>
                      <div className="text-xs font-medium text-gray-700">
                        Expected yield: {tip.expected_yield}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="py-2 text-xs">
                        <div className="mb-2">
                          <span className="font-medium text-gray-800">Recommended varieties:</span> {tip.varieties.join(", ")}
                        </div>
                        <p className="text-xs text-gray-700">{tip.region_note}</p>
                      </CardContent>
                      <CardFooter className="py-2 text-xs text-muted-foreground bg-gray-50">
                        Fetched: {tip.fetched_at ? new Date(tip.fetched_at).toLocaleString() : 'Unknown'}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!loading && fetched && tips.length === 0 && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <Sprout className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">No Tips Available</AlertTitle>
            <AlertDescription className="text-green-700">
              No cultivation tips could be generated for your specific crops and region. Please try adding different crops to your profile or contact your local agricultural extension office for personalized guidance.
            </AlertDescription>
          </Alert>
        )}

        {!loading && tips.length > 0 && (
          <div className="space-y-6">
            {tips.map((tip, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-3 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl flex items-center">
                        <Flower className="h-5 w-5 text-green-500 mr-2" />
                        {tip.crop_name}
                      </CardTitle>
                      <CardDescription>Best planting season: {tip.best_season}</CardDescription>
                    </div>
                    <div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {tip.expected_yield}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-4">
                  <Tabs defaultValue="varieties">
                    <TabsList className="grid grid-cols-4 mb-4">
                      <TabsTrigger value="varieties">Varieties</TabsTrigger>
                      <TabsTrigger value="cultivation">Cultivation</TabsTrigger>
                      <TabsTrigger value="management">Management</TabsTrigger>
                      <TabsTrigger value="harvest">Harvest</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="varieties" className="space-y-4">
                      <div>
                          <h4 className="text-sm font-semibold mb-2 flex items-center text-gray-900">
                            <Sprout className="h-4 w-4 mr-2 text-green-500" />
                            Recommended Varieties
                          </h4>
                          <ul className="text-sm text-gray-700 list-disc pl-5">
                          {tip.varieties.map((variety, i) => (
                            <li key={i}>{variety}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                          <h4 className="text-sm font-semibold mb-2 flex items-center text-gray-900">
                            <Leaf className="h-4 w-4 mr-2 text-brown-500" />
                            Soil Preparation
                          </h4>
                          <ul className="text-sm text-gray-700 list-disc pl-5">
                          {tip.soil_preparation.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="cultivation" className="space-y-4">
                      <div>
                          <h4 className="text-sm font-semibold mb-2 flex items-center text-gray-900">
                            <Droplets className="h-4 w-4 mr-2 text-blue-500" />
                            Irrigation
                          </h4>
                          <p className="text-sm text-gray-700">{tip.irrigation}</p>
                      </div>
                      
                      <div>
                          <h4 className="text-sm font-semibold mb-2 text-gray-900">Fertilizer Application</h4>
                          <ul className="text-sm text-gray-700 list-disc pl-5">
                          {tip.fertilizer.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="management" className="space-y-4">
                      <div>
                          <h4 className="text-sm font-semibold mb-2 text-gray-900">Pest Management</h4>
                          <ul className="text-sm text-gray-700 list-disc pl-5">
                          {tip.pest_management.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                          <h4 className="text-sm font-semibold mb-2 text-gray-900">Weed Control</h4>
                          <ul className="text-sm text-gray-700 list-disc pl-5">
                          {tip.weed_control.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="harvest" className="space-y-4">
                      <div>
                          <h4 className="text-sm font-semibold mb-2 text-gray-900">Harvest Indicators</h4>
                          <ul className="text-sm text-gray-700 list-disc pl-5">
                          {tip.harvest_indicators.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                          <h4 className="text-sm font-semibold mb-2 text-gray-900">Post-Harvest Handling</h4>
                          <ul className="text-sm text-gray-700 list-disc pl-5">
                          {tip.post_harvest.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                
                {tip.region_note && (
                  <CardFooter className="pt-3 border-t">
                    <div className="text-xs text-gray-700">
                      <span className="font-medium">Note:</span> {tip.region_note}
                    </div>
                  </CardFooter>
                )}
              </Card>
            ))}
            
          </div>
        )}
      </div>
    </div>
  );
}
