import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RequestCallbackButtonProps {
  phoneNumber: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export default function RequestCallbackButton({ phoneNumber, className = "", variant = "default" }: RequestCallbackButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const requestCallback = async () => {
    setLoading(true);
    
    try {
      // Format the phone number to match the API's expected format
      // Remove any spaces, dashes, or other characters and ensure it starts with +91
      let formattedNumber = phoneNumber.replace(/\s+/g, '');
      if (!formattedNumber.startsWith('+')) {
        formattedNumber = formattedNumber.startsWith('91') 
          ? '+' + formattedNumber 
          : '+91' + formattedNumber.replace(/^0+/, '');
      }
      
      // Call the Bolna.ai API
      const url = 'https://api.bolna.ai/call';
      const options = {
        method: 'POST',
        headers: {
          Authorization: 'Bearer bn-80e1c48ad1cc4db29fa1458379085838',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agent_id: "eabb9742-e320-4f4e-a1a3-b5723ee4aa86",
          recipient_phone_number: formattedNumber
        })
      };
      
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Call Requested",
          description: "Our AgriGuru assistant will call you shortly.",
          duration: 5000
        });
      } else {
        throw new Error(data.message || "Failed to request call");
      }
      
    } catch (error) {
      console.error("Error requesting callback:", error);
      toast({
        title: "Request Failed",
        description: "We couldn't process your call request. Please try again later.",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Button 
      variant={variant} 
      onClick={requestCallback}
      disabled={loading || !phoneNumber}
      className={`flex items-center ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Requesting call...
        </>
      ) : (
        <>
          <Phone className="h-4 w-4 mr-2" />
          Get AgriGuru Call
        </>
      )}
    </Button>
  );
}
