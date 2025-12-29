import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface City {
  name: string;
  lat: number;
  lon: number;
}

interface CitySelectorProps {
  selectedLocation: string;
  onLocationChange: (location: string) => void;
  cities: City[];
  userLocation: { lat: number; lon: number } | null;
  currentLocationName: string;
}

export const CitySelector: React.FC<CitySelectorProps> = ({
  selectedLocation,
  onLocationChange,
  cities,
  userLocation,
  currentLocationName
}) => {
  const handleLocationSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value === "current") {
      if (userLocation) {
        onLocationChange(`${userLocation.lat},${userLocation.lon}`);
      }
    } else {
      onLocationChange(value);
    }
  };

  return (
    <div className="relative flex items-center">
      <div className="absolute left-3 pointer-events-none z-10">
        <MapPin className="h-5 w-5 text-[#3E8E41]" />
      </div>
      
      <select 
        value={selectedLocation || "current"} 
        onChange={handleLocationSelect}
        className="appearance-none w-full md:w-72 bg-white border border-gray-100 shadow-md pl-10 pr-10 py-3 rounded-full text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#3E8E41]"
      >
        <option value="current">Current Location ({currentLocationName})</option>
        {cities.map((city) => (
          <option 
            key={`${city.lat},${city.lon}`} 
            value={`${city.lat},${city.lon}`}
          >
            {city.name}
          </option>
        ))}
      </select>
      
      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
        <svg className="h-5 w-5 text-[#3E8E41]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
};
