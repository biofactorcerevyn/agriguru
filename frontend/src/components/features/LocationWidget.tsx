import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { useLocation } from "@/contexts/LocationContext";

export function LocationWidget() {
  const { location, getCurrentLocation, isLoading, error } = useLocation();

  const handleGetLocation = async () => {
    try {
      await getCurrentLocation();
    } catch (error) {
      console.error('Failed to get location:', error);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Your Location</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGetLocation}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
        </Button>
      </div>

      {error && (
        <div className="text-sm text-red-600 mb-2">
          {error}
        </div>
      )}

      {location ? (
        <div className="space-y-2">
          {location.city && (
            <div className="text-sm">
              <span className="font-medium">City:</span> {location.city}
            </div>
          )}
          {location.district && (
            <div className="text-sm">
              <span className="font-medium">District:</span> {location.district}
            </div>
          )}
          {location.state && (
            <div className="text-sm">
              <span className="font-medium">State:</span> {location.state}
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            Coordinates: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">
          Click the location button to get your current location for weather and crop recommendations.
        </div>
      )}
    </Card>
  );
}