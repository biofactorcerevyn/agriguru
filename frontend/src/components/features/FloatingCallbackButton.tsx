import { useState, useEffect } from "react";
import { Phone, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import RequestCallbackButton from "./RequestCallbackButton";

interface Profile {
  phone?: string;
}

export default function FloatingCallbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return;
      }

      const { data, error } = await (supabase as any)
        .from('farmer_profiles')
        .select('phone')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      if (data && data.phone) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user phone:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  // Always show the button (don't hide based on phone number)
  if (loading) {
    return null; // Only hide while loading
  }

  // Use hardcoded phone number: 7893525665
  // Format: +917893525665 (auto-formatted in RequestCallbackButton)
  const phoneNumber = '7893525665';

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-lg p-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Need Expert Help?</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0" 
              onClick={toggleOpen}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mb-2">
            Get a call from our agricultural expert
          </p>
          <RequestCallbackButton 
            phoneNumber={phoneNumber} 
            variant="default"
            className="w-full text-xs py-1 h-8"
          />
        </div>
      ) : (
        <button
          onClick={toggleOpen}
          className="bg-green-600 hover:bg-green-700 text-white rounded-full p-3 shadow-lg flex items-center justify-center transition-all hover:scale-105"
          aria-label="Request callback"
        >
          <Phone className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
