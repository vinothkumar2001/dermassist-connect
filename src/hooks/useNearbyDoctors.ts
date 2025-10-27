import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { locationSchema } from '@/lib/validation';

interface Doctor {
  user_id: string;
  first_name: string;
  last_name: string;
  specialties: string[];
  years_experience: number;
  avatar_url?: string;
  bio?: string;
  distance: number;
  is_verified: boolean;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

interface Location {
  latitude: number;
  longitude: number;
}

export function useNearbyDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const findNearbyDoctors = useCallback(async (location: Location, radius = 50) => {
    if (!location) return;
    
    // Validate location
    try {
      locationSchema.parse(location);
    } catch (error: any) {
      const errorMessage = error.errors?.[0]?.message || 'Invalid location data';
      toast({
        title: "Validation error",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    // Validate radius
    if (radius < 1 || radius > 100) {
      toast({
        title: "Invalid radius",
        description: "Radius must be between 1 and 100 km",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to search for doctors",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('find-nearby-doctors', {
        body: {
          latitude: location.latitude,
          longitude: location.longitude,
          radius
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Error finding nearby doctors:', error);
        toast({
          title: "Search Failed",
          description: "Unable to find nearby doctors. Please try again.",
          variant: "destructive"
        });
        setDoctors([]);
        return;
      }

      setDoctors(data.doctors || []);
      
      if (data.doctors?.length === 0) {
        toast({
          title: "No Doctors Found",
          description: `No dermatologists found within ${radius}km of your location.`,
          variant: "default"
        });
      } else {
        toast({
          title: "Doctors Found",
          description: `Found ${data.doctors.length} dermatologist${data.doctors.length > 1 ? 's' : ''} nearby.`,
        });
      }
    } catch (error) {
      console.error('Error in findNearbyDoctors:', error);
      toast({
        title: "Search Error",
        description: "An unexpected error occurred while searching for doctors.",
        variant: "destructive"
      });
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    doctors,
    loading,
    findNearbyDoctors
  };
}