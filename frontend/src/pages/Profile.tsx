import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Edit, MapPin, Phone, Mail, Calendar, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useLocation } from "@/contexts/LocationContext";
import { useLanguage } from "@/contexts/LanguageContext";

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

export default function Profile() {
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { location } = useLocation();
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await (supabase as any)
        .from('farmer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Build an update object with only the fields that are in the profile
      // This prevents errors with missing columns in the database
      const updateData: any = {
        full_name: profile.full_name,
      };
      
      // Add optional fields only if they exist in the profile
      if (profile.district) updateData.district = profile.district;
      if (profile.state) updateData.state = profile.state;
      if (profile.farm_size_value !== undefined) updateData.farm_size_value = profile.farm_size_value;
      if (profile.farm_size_unit) updateData.farm_size_unit = profile.farm_size_unit;
      if (profile.experience_level) updateData.experience_level = profile.experience_level;
      if (profile.preferred_language) updateData.preferred_language = profile.preferred_language;
      
      // These fields might not exist in the database yet
      if (profile.village !== undefined) updateData.village = profile.village;
      if (profile.phone !== undefined) updateData.phone = profile.phone;
      if (profile.primary_soil_type !== undefined) updateData.primary_soil_type = profile.primary_soil_type;
      if (profile.water_source !== undefined) updateData.water_source = profile.water_source;
      if (profile.farming_objective !== undefined) updateData.farming_objective = profile.farming_objective;
      if (profile.preferred_crops && Array.isArray(profile.preferred_crops)) {
        updateData.preferred_crops = profile.preferred_crops;
      }

      const { error } = await (supabase as any)
        .from('farmer_profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) {
        // If the error is related to a missing column, show a specific message
        if (error.code === 'PGRST204' || error.code === '42703') {
          toast({
            title: "Database Migration Required",
            description: "Some fields could not be saved. Please run the database migration script.",
            variant: "default",
          });
        } else {
          throw error;
        }
      } else {
        setEditing(false);
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg text-muted-foreground">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Farmer Profile</h1>
        <p className="text-base text-muted-foreground">
          Manage your profile information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture & Basic Info */}
        <Card className="p-6">
          <div className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {profile.full_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <h2 className="text-xl font-semibold mb-2">{profile.full_name}</h2>
            <p className="text-base text-muted-foreground mb-4">
              {profile.experience_level} Farmer
            </p>
            
            <div className="space-y-2 text-left">
              <div className="flex items-center text-base">
                <MapPin className="h-4 w-4 mr-2 text-primary" />
                <span>{profile.district}, {profile.state}</span>
              </div>
              <div className="flex items-center text-base">
                <Briefcase className="h-4 w-4 mr-2 text-primary" />
                <span>{profile.farm_size_value} {profile.farm_size_unit}</span>
              </div>
              <div className="flex items-center text-base">
                <span className="mr-2">🗣️</span>
                <span>{currentLanguage.name}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Personal Information</h3>
              <Button
                variant={editing ? "outline" : "default"}
                onClick={() => editing ? setEditing(false) : setEditing(true)}
                className="text-base"
              >
                <Edit className="h-4 w-4 mr-2" />
                {editing ? "Cancel" : "Edit"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName" className="text-base">Full Name</Label>
                <Input
                  id="fullName"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  disabled={!editing}
                  className="mt-1 text-base h-12"
                />
              </div>

              <div>
                <Label htmlFor="village" className="text-base">Village</Label>
                <Input
                  id="village"
                  value={profile.village || ''}
                  onChange={(e) => setProfile({ ...profile, village: e.target.value })}
                  disabled={!editing}
                  className="mt-1 text-base h-12"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-base">Phone Number</Label>
                <Input
                  id="phone"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  disabled={!editing}
                  className="mt-1 text-base h-12"
                />
              </div>

              <div>
                <Label htmlFor="district" className="text-base">District</Label>
                <Input
                  id="district"
                  value={profile.district}
                  onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                  disabled={!editing}
                  className={`mt-1 text-base h-12 ${!editing ? 'bg-muted' : ''}`}
                />
              </div>

              <div>
                <Label htmlFor="state" className="text-base">State</Label>
                <Input
                  id="state"
                  value={profile.state}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  disabled={!editing}
                  className={`mt-1 text-base h-12 ${!editing ? 'bg-muted' : ''}`}
                />
              </div>

              <div>
                <Label htmlFor="farmSizeValue" className="text-base">Farm Size</Label>
                <Input
                  id="farmSizeValue"
                  type="number"
                  value={profile.farm_size_value || ''}
                  onChange={(e) => setProfile({ ...profile, farm_size_value: parseFloat(e.target.value) || undefined })}
                  disabled={!editing}
                  className={`mt-1 text-base h-12 ${!editing ? 'bg-muted' : ''}`}
                />
              </div>

              <div>
                <Label htmlFor="farmSizeUnit" className="text-base">Farm Size Unit</Label>
                <Input
                  id="farmSizeUnit"
                  value={profile.farm_size_unit}
                  onChange={(e) => setProfile({ ...profile, farm_size_unit: e.target.value })}
                  disabled={!editing}
                  className={`mt-1 text-base h-12 ${!editing ? 'bg-muted' : ''}`}
                />
              </div>

              <div>
                <Label htmlFor="experience" className="text-base">Experience Level</Label>
                <Input
                  id="experience"
                  value={profile.experience_level}
                  onChange={(e) => setProfile({ ...profile, experience_level: e.target.value })}
                  disabled={!editing}
                  className={`mt-1 text-base h-12 ${!editing ? 'bg-muted' : ''}`}
                />
              </div>

              <div>
                <Label htmlFor="primarySoilType" className="text-base">Primary Soil Type</Label>
                <Input
                  id="primarySoilType"
                  value={profile.primary_soil_type || ''}
                  onChange={(e) => setProfile({ ...profile, primary_soil_type: e.target.value })}
                  disabled={!editing}
                  className={`mt-1 text-base h-12 ${!editing ? 'bg-muted' : ''}`}
                />
              </div>

              <div>
                <Label htmlFor="waterSource" className="text-base">Water Source</Label>
                <Input
                  id="waterSource"
                  value={profile.water_source || ''}
                  onChange={(e) => setProfile({ ...profile, water_source: e.target.value })}
                  disabled={!editing}
                  className={`mt-1 text-base h-12 ${!editing ? 'bg-muted' : ''}`}
                />
              </div>

              <div>
                <Label htmlFor="farmingObjective" className="text-base">Farming Objective</Label>
                <Input
                  id="farmingObjective"
                  value={profile.farming_objective || ''}
                  onChange={(e) => setProfile({ ...profile, farming_objective: e.target.value })}
                  disabled={!editing}
                  className={`mt-1 text-base h-12 ${!editing ? 'bg-muted' : ''}`}
                />
              </div>
            </div>

            {editing && (
              <div className="mt-6 flex gap-4">
                <Button onClick={handleSave} className="text-base px-6 py-3">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)} className="text-base px-6 py-3">
                  Cancel
                </Button>
              </div>
            )}
          </Card>

          {/* Preferred Crops */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Preferred Crops</h3>
            <div className="flex flex-wrap gap-2">
              {profile.preferred_crops && Array.isArray(profile.preferred_crops) && profile.preferred_crops.length > 0 ? (
                profile.preferred_crops.map((cropId) => {
                  // Find the crop in the list of available crops
                  const crop = {
                    name: cropId, // Default to ID if not found
                    id: cropId
                  };
                  return (
                    <Badge key={cropId} variant="outline" className="text-sm py-2 px-3">
                      {crop.name}
                    </Badge>
                  );
                })
              ) : (
                <div className="text-muted-foreground text-sm">
                  No preferred crops selected yet. Visit the Dashboard to select your crops.
                </div>
              )}
            </div>
            {editing && (
              <div className="mt-4 space-y-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                  className="text-sm"
                >
                  Edit Crops in Dashboard
                </Button>
                <div className="text-xs text-muted-foreground">
                  Note: If you cannot save crop preferences, the database administrator 
                  needs to run the migration in frontend/supabase/migrations/.
                </div>
              </div>
            )}
          </Card>

          {/* Current Location */}
          {location && (
            <Card className="p-6 mt-6">
              <h3 className="text-xl font-semibold mb-4">Current Location</h3>
              <div className="space-y-2">
                {location.city && (
                  <div className="text-base">
                    <span className="font-medium">City:</span> {location.city}
                  </div>
                )}
                {location.district && (
                  <div className="text-base">
                    <span className="font-medium">District:</span> {location.district}
                  </div>
                )}
                {location.state && (
                  <div className="text-base">
                    <span className="font-medium">State:</span> {location.state}
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  Coordinates: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
