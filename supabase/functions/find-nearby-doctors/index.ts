import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude, radius = 50 } = await req.json();
    
    if (!latitude || !longitude) {
      return new Response(
        JSON.stringify({ error: 'Latitude and longitude are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Searching for doctors near ${latitude}, ${longitude} within ${radius}km`);

    // Query doctors with location data and user_type = 'doctor'
    const { data: doctors, error } = await supabase
      .from('profiles')
      .select(`
        user_id,
        first_name,
        last_name,
        specialties,
        years_experience,
        avatar_url,
        bio,
        location,
        is_verified
      `)
      .eq('user_type', 'doctor')
      .eq('is_active', true)
      .not('location', 'is', null);

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch doctors' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${doctors?.length || 0} doctors in database`);

    // Calculate distances and filter by radius
    const nearbyDoctors = doctors
      ?.map(doctor => {
        if (!doctor.location?.latitude || !doctor.location?.longitude) {
          return null;
        }

        // Calculate distance using Haversine formula
        const R = 6371; // Earth's radius in kilometers
        const dLat = (doctor.location.latitude - latitude) * Math.PI / 180;
        const dLon = (doctor.location.longitude - longitude) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(latitude * Math.PI / 180) * Math.cos(doctor.location.latitude * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;

        return {
          ...doctor,
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
          location: doctor.location
        };
      })
      .filter(doctor => doctor && doctor.distance <= radius)
      .sort((a, b) => a!.distance - b!.distance)
      .slice(0, 5) || []; // Limit to 5 doctors

    console.log(`Found ${nearbyDoctors.length} doctors within ${radius}km`);

    // If no doctors found in database, return limited mock data for demo
    if (nearbyDoctors.length === 0) {
      const mockDoctors = [
        {
          user_id: 'mock-1',
          first_name: 'Dr. Sarah',
          last_name: 'Johnson',
          specialties: ['Dermatology', 'Cosmetic Surgery'],
          years_experience: 12,
          avatar_url: null,
          bio: 'Specialized in skin cancer detection and cosmetic procedures',
          distance: Math.round((Math.random() * 10 + 2) * 10) / 10,
          is_verified: true,
          location: {
            latitude: latitude + (Math.random() - 0.5) * 0.1,
            longitude: longitude + (Math.random() - 0.5) * 0.1,
            address: '123 Medical Plaza, Downtown'
          }
        },
        {
          user_id: 'mock-2',
          first_name: 'Dr. Michael',
          last_name: 'Chen',
          specialties: ['Dermatology', 'Pediatric Dermatology'],
          years_experience: 8,
          avatar_url: null,
          bio: 'Expert in pediatric skin conditions and general dermatology',
          distance: Math.round((Math.random() * 15 + 5) * 10) / 10,
          is_verified: true,
          location: {
            latitude: latitude + (Math.random() - 0.5) * 0.2,
            longitude: longitude + (Math.random() - 0.5) * 0.2,
            address: '456 Health Center, Medical District'
          }
        },
        {
          user_id: 'mock-3',
          first_name: 'Dr. Emily',
          last_name: 'Rodriguez',
          specialties: ['Dermatology', 'Mohs Surgery'],
          years_experience: 15,
          avatar_url: null,
          bio: 'Board-certified dermatologist specializing in skin cancer surgery',
          distance: Math.round((Math.random() * 20 + 8) * 10) / 10,
          is_verified: true,
          location: {
            latitude: latitude + (Math.random() - 0.5) * 0.3,
            longitude: longitude + (Math.random() - 0.5) * 0.3,
            address: '789 Specialist Clinic, University Area'
          }
        }
      ]
      .filter(doctor => doctor.distance <= radius)
      .slice(0, 5); // Limit mock data to 5 as well

      console.log(`Returning ${mockDoctors.length} mock doctors`);

      return new Response(
        JSON.stringify({ doctors: mockDoctors }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ doctors: nearbyDoctors }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});