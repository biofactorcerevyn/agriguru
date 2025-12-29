import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Location {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  district?: string;
  country?: string;
  address?: string;
}

interface LocationContextType {
  location: Location | null;
  setLocation: (location: Location) => void;
  getCurrentLocation: () => Promise<Location>;
  isLoading: boolean;
  error: string | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [location, setLocationState] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setLocation = (newLocation: Location) => {
    setLocationState(newLocation);
    // Store in localStorage for persistence
    localStorage.setItem('agriguru-location', JSON.stringify(newLocation));
  };

  const getCurrentLocation = (): Promise<Location> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      setIsLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            let locationData: Location = { latitude, longitude };
            
            try {
              // Try to get address using a free geocoding API
              const geocodeUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
              
              const response = await fetch(geocodeUrl);
              const data = await response.json();
              
              if (data) {
                locationData = {
                  latitude,
                  longitude,
                  city: data.locality || data.city,
                  state: data.principalSubdivision,
                  district: data.localityInfo?.administrative?.[0]?.name,
                  country: data.countryName,
                  address: data.localityLanguageRequested
                };
              }
            } catch (geocodeError) {
              console.warn('Reverse geocoding failed, using coordinates only:', geocodeError);
              // Set some default values based on India if geocoding fails
              locationData.country = 'India';
            }
            
            setLocation(locationData);
            setIsLoading(false);
            resolve(locationData);
          } catch (error) {
            setIsLoading(false);
            setError('Failed to get location details');
            reject(error);
          }
        },
        (error) => {
          setIsLoading(false);
          let errorMessage = 'Failed to get your location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location services.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
          }
          
          setError(errorMessage);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  };

  useEffect(() => {
    // Load saved location on mount
    const savedLocation = localStorage.getItem('agriguru-location');
    if (savedLocation) {
      try {
        const parsedLocation = JSON.parse(savedLocation);
        setLocationState(parsedLocation);
      } catch (error) {
        console.error('Failed to parse saved location:', error);
      }
    }
  }, []);

  return (
    <LocationContext.Provider value={{ 
      location, 
      setLocation, 
      getCurrentLocation, 
      isLoading, 
      error 
    }}>
      {children}
    </LocationContext.Provider>
  );
};