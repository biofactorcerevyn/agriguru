import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sprout, Sun, TrendingUp, MessageSquare, Camera, Users, BookOpen, LogOut, ArrowRight, Lightbulb, Layers, CloudRain, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import WeatherWidget from "@/components/features/WeatherWidget";
import MarketPricesWidget from "@/components/features/market/MarketPricesWidget";
import AIAssistant from "@/components/features/AIAssistant";
import { LanguageSelector } from "@/components/features/LanguageSelector";
import { CropAnalysis } from "@/components/features/CropAnalysis";
import { EnhancedWeatherWidget } from "@/components/features/EnhancedWeatherWidget";
import { LocationWidget } from "@/components/features/LocationWidget";
import { SoilHealthWidget } from "@/components/features/soil/SoilHealthWidget";
import { useLocation } from "@/contexts/LocationContext";

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
}

export default function Dashboard() {
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { location } = useLocation();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await (supabase as any)
        .from('farmer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found, redirect to onboarding
          navigate('/onboarding');
          return;
        }
        throw error;
      }

      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const quickActions = [
    {
      title: "Plant Analysis Chat",
      description: "AI-powered crop advice in your language",
      icon: MessageSquare,
      color: "bg-accent",
      path: "/heal-crop/chat"
    },
    {
      title: "Disease Detection",
      description: "Upload photos to diagnose plant diseases",
      icon: Camera,
      color: "bg-success",
      path: "/heal-crop/disease-detection"
    },
    {
      title: "Fertilizer Calculator",
      description: "Calculate optimal fertilizer requirements",
      icon: Users,
      color: "bg-primary",
      path: "/analysis/fertilizer-calculator"
    },
    {
      title: "Crop Recommendations",
      description: "AI recommendations for best crops to grow",
      icon: BookOpen,
      color: "bg-secondary",
      path: "/analysis/crop-recommendation"
    },
    {
      title: "Soil Health Monitor",
      description: "Track and analyze your soil health",
      icon: Layers,
      color: "bg-warning",
      path: "/soil-health"
    }
  ];

  const coreQuestions = [
    {
      question: "What crop should I plant now?",
      description: "AI-powered crop recommendations based on your location, soil, season, and market demand",
      icon: "🌱",
      color: "bg-success",
      path: "/analysis/crop-recommendation"
    },
    {
      question: "How much yield can I expect?",
      description: "Predictive yield analysis using historical data, weather patterns, and farming practices",
      icon: "📈",
      color: "bg-accent",
      path: "/analysis/yield-prediction"
    },
    {
      question: "What weather should I prepare for?",
      description: "15-day detailed agricultural weather forecast with farming insights",
      icon: "🌤️",
      color: "bg-warning",
      path: "/dashboard"
    },
    {
      question: "What price can I likely sell at?",
      description: "Market price forecasts and optimal selling strategies for maximum profit",
      icon: "💰",
      color: "bg-primary",
      path: "/dashboard"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-lg">Loading your dashboard...</div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 min-h-screen">
      {/* Welcome message */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <h1 className="text-xl font-bold text-primary">Welcome back, {profile.full_name}</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Hero Section */}
        <div className="mb-8">
          <Card className="card-clean p-8 bg-white border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="relative">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-primary mb-2">
                  AgriGuru AI Advisory Platform
                </h2>
                <p className="text-lg text-gray-600 mb-4">
                  Get instant AI-powered answers to your most critical farming questions
                </p>
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                  <span className="flex items-center">
                    📍 {profile.district}, {profile.state}
                  </span>
                  {profile.farm_size_value && (
                    <span className="flex items-center">
                      🚜 {profile.farm_size_value} {profile.farm_size_unit}
                    </span>
                  )}
                  <span className="flex items-center">
                    👨‍🌾 {profile.experience_level} farmer
                  </span>
                  <span className="flex items-center">
                    🗣️ {profile.preferred_language}
                  </span>
                </div>
              </div>

              <div className="text-center">
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => navigate('/heal-crop/chat')}
                  className="text-base sm:text-lg px-4 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Start AI Conversation
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Core Questions Section */}
        <div className="mb-12">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-primary mb-2">
              Get AI-Powered Answers to Your Farming Questions
            </h3>
            <p className="text-gray-600">
              Our AI analyzes your location, soil, weather, and market data to provide personalized advice
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {coreQuestions.map((item, index) => (
              <Card 
                key={index} 
                className="card-clean p-6 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-natural cursor-pointer group"
                onClick={() => navigate(item.path)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-16 h-16 ${item.color === "bg-success" ? "bg-green-100" : item.color === "bg-accent" ? "bg-purple-100" : item.color === "bg-warning" ? "bg-amber-100" : "bg-blue-100"} rounded-md flex items-center justify-center text-2xl group-hover:scale-110 transition-natural`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors">
                      {item.question}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    <div className="flex items-center text-primary text-sm font-medium">
                      <span>Ask AI Now</span>
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Crop Analysis Section */}
        <div className="mb-12">
          <CropAnalysis />
        </div>

        {/* Location and Weather Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-1">
            <LocationWidget />
          </div>
          <div className="lg:col-span-2">
            <EnhancedWeatherWidget 
              district={location?.district || profile.district} 
              state={location?.state || profile.state}
            />
          </div>
        </div>

        {/* Live Data Section */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-primary mb-6">Live Data Insights</h3>
          <div className="grid grid-cols-1 gap-8">
            {/* Weather Widget */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
              <h4 className="text-lg font-semibold text-primary mb-4 flex items-center">
                <CloudRain className="h-5 w-5 mr-2 text-blue-500" />
                Weather Forecast
              </h4>
              <WeatherWidget 
                district={location?.district || profile.district} 
                state={location?.state || profile.state} 
              />
            </div>
            
            {/* Market Prices Widget */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
              <h4 className="text-lg font-semibold text-primary mb-4 flex items-center">
                <Store className="h-5 w-5 mr-2 text-green-500" />
                Market Prices
              </h4>
              <MarketPricesWidget />
            </div>
            
            {/* Soil Health Widget */}
            {/* <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
              <h4 className="text-lg font-semibold text-primary mb-4 flex items-center">
                <Layers className="h-5 w-5 mr-2 text-amber-500" />
                Soil Health
              </h4>
              <SoilHealthWidget />
            </div> */}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-primary mb-6 text-center">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {quickActions.map((action, index) => (
              <Card 
                key={index} 
                className="card-clean p-6 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-natural cursor-pointer group"
                onClick={() => navigate(action.path)}
              >
                <div className={`w-12 h-12 ${action.color === "bg-accent" ? "bg-purple-100" : action.color === "bg-success" ? "bg-green-100" : action.color === "bg-primary" ? "bg-blue-100" : action.color === "bg-secondary" ? "bg-yellow-100" : "bg-amber-100"} rounded-md flex items-center justify-center mb-4 group-hover:scale-110 transition-natural`}>
                  <action.icon className="h-6 w-6 text-gray-700" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2 group-hover:text-primary transition-colors">
                  {action.title}
                </h4>
                <p className="text-sm text-gray-600">{action.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Success Stats */}
        <div className="text-center">
          <Card className="card-clean p-8 bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center justify-center mb-4">
              <Lightbulb className="h-8 w-8 text-amber-500 mr-2" />
              <h3 className="text-xl font-bold text-primary">
                AgriGuru Community Impact Predicted
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500">10,000+</div>
                <div className="text-sm text-gray-600">Farmers Helped</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500">25%</div>
                <div className="text-sm text-gray-600">Average Yield Increase</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-500">30%</div>
                <div className="text-sm text-gray-600">Cost Reduction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-500">500+</div>
                <div className="text-sm text-gray-600">Daily AI Consultations</div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Join thousands of farmers who are transforming their agricultural practices with AI-powered insights
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
