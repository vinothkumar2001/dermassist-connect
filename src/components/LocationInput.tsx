import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const { toast } = useToast();

  // Get Mapbox token on component mount
  useEffect(() => {
    const getMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        setMapboxToken(data.token);
      } catch (error) {
        console.error('Failed to get Mapbox token:', error);
        toast({
          title: "Configuration Error",
          description: "Failed to load mapping services",
          variant: "destructive"
        });
      }
    };
    getMapboxToken();
  }, [toast]);

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
          if (!mapboxToken) {
            console.log('No Mapbox token available for reverse geocoding');
            setCurrentLocation(location);
            onLocationChange(location);
            setLoading(false);
            toast({
              title: "Location Found",
              description: `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`,
            });
            return;
          }

          // Reverse geocode to get address
          const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${location.longitude},${location.latitude}.json?access_token=${mapboxToken}&types=address,poi`);
          
          if (response.ok) {
            const data = await response.json();
            if (data.features && data.features.length > 0) {
              location.address = data.features[0].place_name;
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
    
    if (!mapboxToken) {
      toast({
        title: "Service Unavailable",
        description: "Address lookup service is currently unavailable",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      // Geocode address to coordinates
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxToken}&types=address,poi`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          const feature = data.features[0];
          const location: Location = {
            latitude: feature.center[1],
            longitude: feature.center[0],
            address: feature.place_name
          };
          
          setCurrentLocation(location);
          onLocationChange(location);
          
          toast({
            title: "Address Found",
            description: location.address,
          });
        } else {
          toast({
            title: "Address Not Found",
            description: "Please try a different address",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      toast({
        title: "Geocoding Error",
        description: "Failed to find address coordinates",
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
        <div className="mt-2 text-xs text-muted-foreground bg-muted p-2 rounded">
          📍 {currentLocation.address || `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`}
        </div>
      )}
    </div>
  );
}