import React, { useState, useEffect } from 'react';
import { Plus, Home, Wheat, Flower, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Crop {
  id: string;
  name: string;
  image: string;
}

const AVAILABLE_CROPS: Crop[] = [
  { id: 'almond', name: 'Almond', image: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=150&h=150&fit=crop' },
  { id: 'apple', name: 'Apple', image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=150&h=150&fit=crop' },
  { id: 'apricot', name: 'Apricot', image: 'https://images.unsplash.com/photo-1528821154947-1aa3d1b74941?w=150&h=150&fit=crop' },
  { id: 'banana', name: 'Banana', image: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=150&h=150&fit=crop' },
  { id: 'barley', name: 'Barley', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=150&h=150&fit=crop' },
  { id: 'bean', name: 'Bean', image: 'https://images.unsplash.com/photo-1506501139174-099022df5260?w=150&h=150&fit=crop' },
  { id: 'cabbage', name: 'Cabbage', image: 'https://images.unsplash.com/photo-1594282354806-60eacaab23c8?w=150&h=150&fit=crop' },
  { id: 'canola', name: 'Canola', image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=150&h=150&fit=crop' },
  { id: 'carrot', name: 'Carrot', image: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=150&h=150&fit=crop' },
  { id: 'cauliflower', name: 'Cauliflower', image: 'https://images.unsplash.com/photo-1568584711075-3d021a58ee9a?w=150&h=150&fit=crop' },
  { id: 'cherry', name: 'Cherry', image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=150&h=150&fit=crop' },
  { id: 'chickpea', name: 'Chickpea', image: 'https://images.unsplash.com/photo-1605081573886-b5e2ce7b80a1?w=150&h=150&fit=crop' },
  { id: 'citrus', name: 'Citrus', image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=150&h=150&fit=crop' },
  { id: 'coffee', name: 'Coffee', image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=150&h=150&fit=crop' },
  { id: 'cotton', name: 'Cotton', image: 'https://images.unsplash.com/photo-1616431101491-554c71364fd1?w=150&h=150&fit=crop' },
  { id: 'cucumber', name: 'Cucumber', image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=150&h=150&fit=crop' },
  { id: 'grape', name: 'Grape', image: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=150&h=150&fit=crop' },
  { id: 'maize', name: 'Maize', image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=150&h=150&fit=crop' },
  { id: 'mango', name: 'Mango', image: 'https://images.unsplash.com/photo-1605195476516-a0b28bbdffe8?w=150&h=150&fit=crop' },
  { id: 'onion', name: 'Onion', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=150&h=150&fit=crop' },
  { id: 'potato', name: 'Potato', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=150&h=150&fit=crop' },
  { id: 'rice', name: 'Rice', image: 'https://images.unsplash.com/photo-1536304447766-da0ed4ce1b73?w=150&h=150&fit=crop' },
  { id: 'tomato', name: 'Tomato', image: 'https://images.unsplash.com/photo-1546470427-e18e962e8214?w=150&h=150&fit=crop' },
  { id: 'wheat', name: 'Wheat', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=150&h=150&fit=crop' },
];

type GrowingScale = 'home' | 'fields' | 'pots';

export const CropAnalysis: React.FC = () => {
  const [selectedScale, setSelectedScale] = useState<GrowingScale>('fields');
  const [selectedCrops, setSelectedCrops] = useState<Crop[]>([]);
  const [showCropSelector, setShowCropSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Load preferred crops from user profile
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // First check if the preferred_crops column exists
        const { data, error } = await (supabase as any)
          .from('farmer_profiles')
          .select('*')  // Select all columns to see what's available
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        
        // If preferred_crops exists and has data, use it
        if (data && data.preferred_crops && Array.isArray(data.preferred_crops)) {
          // Match preferred crop IDs with available crops
          const userCrops = data.preferred_crops
            .map((cropId: string) => AVAILABLE_CROPS.find(c => c.id === cropId))
            .filter((crop: Crop | undefined) => crop !== undefined);
          
          setSelectedCrops(userCrops);
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
        // Don't show an error toast here - this is expected if the column doesn't exist yet
      }
    };

    loadUserPreferences();
  }, []);

  const handleScaleSelect = (scale: GrowingScale) => {
    setSelectedScale(scale);
  };

  const handleCropSelect = (crop: Crop) => {
    if (!selectedCrops.find(c => c.id === crop.id)) {
      const updatedCrops = [...selectedCrops, crop];
      setSelectedCrops(updatedCrops);
      saveToProfile(updatedCrops);
    }
    setShowCropSelector(false);
  };

  const removeCrop = (cropId: string) => {
    const updatedCrops = selectedCrops.filter(c => c.id !== cropId);
    setSelectedCrops(updatedCrops);
    saveToProfile(updatedCrops);
  };

  // Save selected crops to user profile
  const saveToProfile = async (crops: Crop[]) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const cropIds = crops.map(crop => crop.id);
      
      // First try to update - this will work if the column exists
      const { error } = await (supabase as any)
        .from('farmer_profiles')
        .update({
          preferred_crops: cropIds
        })
        .eq('user_id', user.id);

      // If we get a specific error about the column not existing, inform the user
      // but don't show it as an error since we expect the DB admin to run the migration
      if (error && (error.code === 'PGRST204' || error.code === '42703')) {
        console.log('The preferred_crops column does not exist yet. Please run the migration.');
        toast({
          title: "Feature Not Available",
          description: "Crop preferences storage is not available yet. Please check back soon.",
          variant: "default",
        });
      } else if (error) {
        throw error;
      } else {
        toast({
          title: "Preferences Saved",
          description: "Your crop preferences have been updated",
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error('Error saving crop preferences:', error);
      toast({
        title: "Error",
        description: "Could not save your preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getScaleIcon = (scale: GrowingScale) => {
    switch (scale) {
      case 'home': return Home;
      case 'fields': return Wheat;
      case 'pots': return Flower;
    }
  };

  const getScaleLabel = (scale: GrowingScale) => {
    switch (scale) {
      case 'home': return 'Home Garden';
      case 'fields': return 'Fields';
      case 'pots': return 'Pots';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">🌱 Crop Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Growing Scale Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Where do you grow your crops?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['home', 'fields', 'pots'] as GrowingScale[]).map((scale) => {
              const Icon = getScaleIcon(scale);
              return (
                <Button
                  key={scale}
                  variant={selectedScale === scale ? "default" : "outline"}
                  className="h-20 flex-col gap-2"
                  onClick={() => handleScaleSelect(scale)}
                >
                  <Icon className="h-6 w-6" />
                  <span>I grow crops in my {getScaleLabel(scale).toLowerCase()}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Selected Crops Display */}
        {selectedCrops.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Your Selected Crops</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedCrops.map((crop) => (
                <Badge
                  key={crop.id}
                  variant="secondary"
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeCrop(crop.id)}
                >
                  <img src={crop.image} alt={crop.name} className="w-6 h-6 rounded mr-2" />
                  {crop.name}
                  <span className="ml-2">×</span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Crop Selection */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Select Your Crops</h3>
            <Button
              variant="outline"
              onClick={() => setShowCropSelector(!showCropSelector)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Crops
            </Button>
          </div>

          {showCropSelector && (
            <Card className="p-4">
              <ScrollArea className="h-[400px]">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {AVAILABLE_CROPS.map((crop) => {
                    const isSelected = selectedCrops.find(c => c.id === crop.id);
                    return (
                      <div
                        key={crop.id}
                        className={`cursor-pointer p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                          isSelected 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => handleCropSelect(crop)}
                      >
                        <img
                          src={crop.image}
                          alt={crop.name}
                          className="w-full h-20 object-cover rounded mb-2"
                        />
                        <p className="text-sm font-medium text-center">{crop.name}</p>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </Card>
          )}
        </div>

        {/* Analysis Summary */}
        {selectedCrops.length > 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-4">
              <h4 className="font-semibold text-primary mb-2">Analysis Summary</h4>
              <p className="text-sm text-muted-foreground">
                Growing <strong>{selectedCrops.length}</strong> crop varieties in{" "}
                <strong>{getScaleLabel(selectedScale).toLowerCase()}</strong>
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedCrops.map((crop) => (
                  <Badge key={crop.id} variant="outline" className="text-xs">
                    {crop.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};
