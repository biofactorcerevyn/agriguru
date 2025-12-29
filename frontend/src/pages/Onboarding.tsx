import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Sprout, User, MapPin, Tractor, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    state: "",
    district: "",
    village: "",
    farm_size_value: "",
    farm_size_unit: "acres",
    primary_soil_type: "",
    water_source: "rainfed",
    experience_level: "beginner",
    farming_objective: "",
    preferred_language: "english"
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is authenticated and fetch user data
    const checkAuthAndLoadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      
      // Fetch user metadata to pre-fill form fields
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.user_metadata) {
        const { full_name, phone_number, farm_location } = user.user_metadata;
        
        // Pre-populate form fields with data from signup
        setFormData(prevData => ({
          ...prevData,
          full_name: full_name || prevData.full_name,
          phone_number: phone_number || prevData.phone_number,
          // If farm_location exists, try to extract district and maybe state
          ...(farm_location && {
            district: farm_location.split(',')?.[0]?.trim() || prevData.district,
            // If there's a comma in farm_location, use second part as state hint
            state: farm_location.split(',')?.[1]?.trim() || prevData.state
          })
        }));
      }
    };
    
    checkAuthAndLoadData();
  }, [navigate]);

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { error } = await (supabase as any)
        .from('farmer_profiles')
        .insert({
          user_id: user.id,
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          state: formData.state,
          district: formData.district,
          village: formData.village,
          farm_size_value: parseFloat(formData.farm_size_value) || null,
          farm_size_unit: formData.farm_size_unit as any,
          primary_soil_type: formData.primary_soil_type as any,
          water_source: formData.water_source as any,
          experience_level: formData.experience_level as any,
          farming_objective: formData.farming_objective,
          preferred_language: formData.preferred_language as any
        });

      if (error) throw error;

      toast({
        title: "Profile Created!",
        description: "Welcome to the AgriGuru community. Let's start your farming journey!",
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Profile creation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <User className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground">Personal Information</h2>
              <p className="text-muted-foreground">Tell us about yourself</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  placeholder="Enter your phone number"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="preferred_language">Preferred Language</Label>
                <Select value={formData.preferred_language} onValueChange={(value) => handleInputChange('preferred_language', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your preferred language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="hindi">हिंदी (Hindi)</SelectItem>
                    <SelectItem value="tamil">தமிழ் (Tamil)</SelectItem>
                    <SelectItem value="telugu">తెలుగు (Telugu)</SelectItem>
                    <SelectItem value="marathi">मराठी (Marathi)</SelectItem>
                    <SelectItem value="gujarati">ગુજરાતી (Gujarati)</SelectItem>
                    <SelectItem value="bengali">বাংলা (Bengali)</SelectItem>
                    <SelectItem value="punjabi">ਪੰਜਾਬੀ (Punjabi)</SelectItem>
                    <SelectItem value="kannada">ಕನ್ನಡ (Kannada)</SelectItem>
                    <SelectItem value="malayalam">മലയാളം (Malayalam)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground">Farm Location</h2>
              <p className="text-muted-foreground">Where is your farm located?</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="state">State *</Label>
                <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="district">District *</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  placeholder="Enter your district"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="village">Village/Town</Label>
                <Input
                  id="village"
                  value={formData.village}
                  onChange={(e) => handleInputChange('village', e.target.value)}
                  placeholder="Enter your village or town"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Tractor className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground">Farm Details</h2>
              <p className="text-muted-foreground">Tell us about your farming setup</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="farm_size_value">Farm Size</Label>
                  <Input
                    id="farm_size_value"
                    type="number"
                    value={formData.farm_size_value}
                    onChange={(e) => handleInputChange('farm_size_value', e.target.value)}
                    placeholder="e.g., 2.5"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="farm_size_unit">Unit</Label>
                  <Select value={formData.farm_size_unit} onValueChange={(value) => handleInputChange('farm_size_unit', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="acres">Acres</SelectItem>
                      <SelectItem value="hectares">Hectares</SelectItem>
                      <SelectItem value="bigha">Bigha</SelectItem>
                      <SelectItem value="katha">Katha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="primary_soil_type">Primary Soil Type</Label>
                <Select value={formData.primary_soil_type} onValueChange={(value) => handleInputChange('primary_soil_type', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select soil type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clay">Clay</SelectItem>
                    <SelectItem value="sandy">Sandy</SelectItem>
                    <SelectItem value="loamy">Loamy</SelectItem>
                    <SelectItem value="alluvial">Alluvial</SelectItem>
                    <SelectItem value="black">Black Cotton</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="laterite">Laterite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="water_source">Primary Water Source</Label>
                <Select value={formData.water_source} onValueChange={(value) => handleInputChange('water_source', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rainfed">Rainfed</SelectItem>
                    <SelectItem value="irrigated">Irrigated</SelectItem>
                    <SelectItem value="borewell">Borewell</SelectItem>
                    <SelectItem value="canal">Canal</SelectItem>
                    <SelectItem value="river">River</SelectItem>
                    <SelectItem value="pond">Pond/Tank</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="experience_level">Farming Experience</Label>
                <Select value={formData.experience_level} onValueChange={(value) => handleInputChange('experience_level', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (3-10 years)</SelectItem>
                    <SelectItem value="expert">Expert (10+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Target className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground">Your Goals</h2>
              <p className="text-muted-foreground">What are your farming objectives?</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="farming_objective">Primary Farming Objective</Label>
                <Textarea
                  id="farming_objective"
                  value={formData.farming_objective}
                  onChange={(e) => handleInputChange('farming_objective', e.target.value)}
                  placeholder="e.g., Increase yield, reduce costs, try organic farming, diversify crops..."
                  className="mt-1"
                  rows={4}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="card-agricultural p-8 backdrop-blur-sm bg-white/95">
          {/* Logo */}
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Sprout className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-primary">AgriGuru</span>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-between mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  i <= step
                    ? "bg-primary border-primary text-white"
                    : "border-muted-foreground text-muted-foreground"
                }`}
              >
                {i}
              </div>
            ))}
          </div>

          {/* Form content */}
          {renderStep()}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={step === 1}
            >
              Previous
            </Button>

            {step < 4 ? (
              <Button
                variant="gradient"
                onClick={handleNext}
                disabled={
                  (step === 1 && !formData.full_name) ||
                  (step === 2 && (!formData.state || !formData.district))
                }
              >
                Next
              </Button>
            ) : (
              <Button
                variant="gradient"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Creating Profile..." : "Complete Setup"}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
