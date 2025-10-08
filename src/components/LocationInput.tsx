import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface LocationInputProps {
  onLocationChange: (location: Location | null) => void;
  className?: string;
}

export function LocationInput({ onLocationChange, className }: LocationInputProps) {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const { toast } = useToast();

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive"
      });
      return;
    }


    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        
        try {
          // Reverse geocode using Nominatim (OpenStreetMap)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}&zoom=10`,
            {
              headers: {
                'User-Agent': 'DermaCare-App'
              }
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.display_name) {
              location.address = data.display_name;
              setAddress(location.address);
            }
          }
        } catch (error) {
          console.log('Reverse geocoding failed, using coordinates only');
        }
        
        setCurrentLocation(location);
        onLocationChange(location);
        setLoading(false);
        
        toast({
          title: "Location Found",
          description: location.address || `${location.latitude}, ${location.longitude}`,
        });
      },
      (error) => {
        setLoading(false);
        toast({
          title: "Location Error",
          description: "Failed to get your current location",
          variant: "destructive"
        });
      }
    );
  };

  const handleAddressSubmit = async () => {
    if (!address.trim()) return;
    
    setLoading(true);
    try {
      // Geocode using Nominatim (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        {
          headers: {
            'User-Agent': 'DermaCare-App'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const result = data[0];
          const location: Location = {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
            address: result.display_name
          };
          
          setCurrentLocation(location);
          setAddress(result.display_name);
          onLocationChange(location);
          
          toast({
            title: "Location Set",
            description: location.address,
          });
        } else {
          toast({
            title: "Location Not Found",
            description: "Please try a different address or city name",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Search Failed",
          description: "Please check your address and try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search for location",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  return (
    <div className={className}>
      <Label className="text-sm font-medium text-muted-foreground">Location for Doctor Search</Label>
      <div className="flex gap-2 mt-2">
        <Input
          placeholder="Enter address or use current location"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddressSubmit()}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleGeolocation}
          disabled={loading}
          className="shrink-0"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {address && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleAddressSubmit}
          disabled={loading}
          className="mt-2 w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Finding Location...
            </>
          ) : (
            "Use This Address"
          )}
        </Button>
      )}
      
      {currentLocation && (
        <div className="mt-2 space-y-2">
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
            📍 {currentLocation.address || `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setCurrentLocation(null);
              setAddress('');
              onLocationChange(null);
            }}
            className="w-full"
          >
            Change Location
          </Button>
        </div>
      )}
    </div>
  );
}