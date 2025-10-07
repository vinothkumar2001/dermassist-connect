import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('find-nearby-doctors', {
        body: {
          latitude: location.latitude,
          longitude: location.longitude,
          radius
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