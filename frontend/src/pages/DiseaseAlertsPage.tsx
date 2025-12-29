import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Bug, Sprout, MapPin, Calendar, RefreshCw, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useLocation } from "@/contexts/LocationContext";

interface DiseaseAlert {
  disease_name: string;
  crop_type: string;
  severity: 'Low' | 'Medium' | 'High';
  probability: number;
  description: string;
  symptoms: string[];
  prevention_steps: string[];
  treatment_options: string[];
  affected_regions: string[];
  expected_duration: string;
  created_at: string;
  fetched_at: string;
}

interface AlertHistory {
  alerts: DiseaseAlert[];
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

export default function DiseaseAlertsPage() {
  const navigate = useNavigate();
  const { location } = useLocation();
  const [alerts, setAlerts] = useState<DiseaseAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetched, setFetched] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  
  // State for alert history
  const [alertHistory, setAlertHistory] = useState<AlertHistory | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Local storage key for disease alerts
  const STORAGE_KEY = 'agriguru-disease-alerts';

  useEffect(() => {
    fetchUserProfile();
    loadAlertHistory();
  }, []);
  
  const loadAlertHistory = () => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEY);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory) as AlertHistory;
        setAlertHistory(parsedHistory);
      }
    } catch (error) {
      console.error("Error loading alert history from localStorage:", error);
      // Don't set an error state as this is non-critical
    }
  };
  
  const saveAlertHistory = (newAlerts: DiseaseAlert[], profileData: FarmerProfile) => {
    try {
      // Add timestamp to each alert
      const timestampedAlerts = newAlerts.map(alert => ({
        ...alert,
        fetched_at: new Date().toISOString(),
        created_at: alert.created_at || new Date().toISOString()
      }));
      
      const historyData: AlertHistory = {
        alerts: timestampedAlerts,
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
      setAlertHistory(historyData);
    } catch (error) {
      console.error("Error saving alert history to localStorage:", error);
      // Non-critical error, so just log it
    }
  };
  
  const clearAlertHistory = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setAlertHistory(null);
      toast({
        title: "History cleared",
        description: "Your disease alert history has been cleared.",
      });
    } catch (error) {
      console.error("Error clearing alert history:", error);
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

  const fetchDiseaseAlerts = async () => {
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
      // Call the LLM API to get disease alerts based on user location
      const response = await axios.post("http://localhost:8000/disease_alerts", {
        location: {
          state: profile.state,
          district: profile.district
        },
        crops: profile.preferred_crops,
        language: "en" // Default to English
      });

      if (response.data && response.data.alerts) {
        const newAlerts = response.data.alerts;
        setAlerts(newAlerts);
        setFetched(true);
        
        // Save alerts to localStorage
        if (profile) {
          saveAlertHistory(newAlerts, profile);
        }
        
        // Show success message
        toast({
          title: "Disease alerts fetched successfully",
          description: `Found ${newAlerts.length} potential disease alerts for your region.`,
        });
      } else {
        throw new Error("No alert data received from server");
      }
    } catch (err: any) {
      console.error("Error fetching disease alerts:", err);
      setError(err.message || "Failed to fetch disease alerts. Please try again.");
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch disease alerts. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to render severity badge with appropriate color
  const renderSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return <Badge className="bg-red-600 hover:bg-red-700">{severity}</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">{severity}</Badge>;
      case 'low':
        return <Badge className="bg-green-600 hover:bg-green-700">{severity}</Badge>;
      default:
        return <Badge>{severity}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Bug className="h-8 w-8 text-red-500 mr-3" />
          <div>
            <h1 className="text-3xl font-bold">Crop Disease Alerts</h1>
            <p className="text-gray-600">Get real-time alerts on potential crop diseases in your region</p>
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
            <CardDescription>Disease alerts are personalized based on this data</CardDescription>
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
                onClick={fetchDiseaseAlerts}
                disabled={loading || !profile?.preferred_crops || profile.preferred_crops.length === 0}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
                    Analyzing regional disease patterns...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" /> 
                    Get Disease Alerts
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

        {/* Alert History Toggle */}
        {alertHistory && alertHistory.alerts.length > 0 && (
          <div className="mb-4">
            <Button 
              variant="outline" 
              className="w-full flex justify-between items-center" 
              onClick={() => setShowHistory(!showHistory)}
            >
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" /> 
                {showHistory ? "Hide Alert History" : "Show Alert History"}
              </span>
              <span className="text-xs text-muted-foreground">
                Last fetched: {new Date(alertHistory.lastFetched).toLocaleString()}
              </span>
              {showHistory && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-2 text-red-500 hover:text-red-700" 
                  onClick={(e) => {
                    e.stopPropagation();
                    clearAlertHistory();
                  }}
                >
                  Clear
                </Button>
              )}
            </Button>
          </div>
        )}
        
        {/* Previous Alerts */}
        {showHistory && alertHistory && alertHistory.alerts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Previous Alert History
            </h3>
            <Card className="mb-4 bg-gray-50">
              <CardContent className="pt-4">
                <div className="text-sm mb-2">
                  <span className="font-medium">Location:</span> {alertHistory.location.district}, {alertHistory.location.state}
                </div>
                <div className="text-sm mb-4">
                  <span className="font-medium">Crops:</span> {alertHistory.crops.join(", ")}
                </div>
                
                <div className="space-y-4">
                  {alertHistory.alerts.map((alert, index) => (
                    <Card key={`history-${index}`} className="overflow-hidden border-gray-200">
                      <CardHeader className="pb-2 bg-gray-100">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base flex items-center">
                              <Bug className="h-4 w-4 text-red-500 mr-2" />
                              {alert.disease_name}
                            </CardTitle>
                            <CardDescription className="text-xs">{alert.crop_type}</CardDescription>
                          </div>
                          <div className="flex flex-col items-end">
                            {renderSeverityBadge(alert.severity)}
                            <span className="text-xs text-muted-foreground mt-1">
                              {alert.probability.toFixed(0)}% probability
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="py-2">
                        <p className="text-xs text-muted-foreground">{alert.description}</p>
                      </CardContent>
                      <CardFooter className="py-2 text-xs text-muted-foreground bg-gray-50">
                        Fetched: {new Date(alert.fetched_at).toLocaleString()}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {!loading && fetched && alerts.length === 0 && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <Sprout className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Good news!</AlertTitle>
            <AlertDescription className="text-green-700">
              No active disease threats detected for your crops in your region at this time. Continue with your regular monitoring practices.
            </AlertDescription>
          </Alert>
        )}

        {!loading && alerts.length > 0 && (
          <div className="space-y-6">
            {alerts.map((alert, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl flex items-center">
                        <Bug className="h-5 w-5 text-red-500 mr-2" />
                        {alert.disease_name}
                      </CardTitle>
                      <CardDescription>Affecting {alert.crop_type}</CardDescription>
                    </div>
                    <div className="flex flex-col items-end">
                      {renderSeverityBadge(alert.severity)}
                      <span className="text-xs font-medium text-gray-700 mt-1">
                        {alert.probability.toFixed(0)}% probability
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-4">
                    <div>
                  <h3 className="text-sm font-semibold mb-1 text-gray-900">Description</h3>
                  <p className="text-sm text-gray-700">{alert.description}</p>
                    </div>
                    
                    <div>
                  <h3 className="text-sm font-semibold mb-1 text-gray-900">Symptoms</h3>
                  <ul className="text-sm text-gray-700 list-disc pl-5">
                        {alert.symptoms.map((symptom, i) => (
                          <li key={i}>{symptom}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                  <h3 className="text-sm font-semibold mb-1 text-gray-900">Prevention</h3>
                  <ul className="text-sm text-gray-700 list-disc pl-5">
                        {alert.prevention_steps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-gray-700" />
                    <span className="text-gray-700">{alert.affected_regions.join(", ")}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1 text-gray-700" />
                    <span className="text-gray-700">Expected duration: {alert.expected_duration}</span>
                  </div>
                </CardFooter>
              </Card>
            ))}
            
          </div>
        )}
      </div>
    </div>
  );
}
