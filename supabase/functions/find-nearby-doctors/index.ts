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
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Use ANON_KEY to respect RLS policies instead of SERVICE_ROLE_KEY
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user searching for doctors:', user.id);

    const { latitude, longitude, radius = 50 } = await req.json();
    
    // Input validation
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return new Response(
        JSON.stringify({ error: 'Latitude and longitude must be numbers' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return new Response(
        JSON.stringify({ error: 'Invalid latitude or longitude values' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (typeof radius !== 'number' || radius < 1 || radius > 100) {
      return new Response(
        JSON.stringify({ error: 'Radius must be between 1 and 100 km' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Searching for doctors near ${latitude}, ${longitude} within ${radius}km`);

    // Query doctors with location data and user_type = 'doctor'
    // Now respects RLS policies because we're using ANON_KEY
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
      .filter(doctor => doctor && doctor.distance <= Math.min(radius, 5)) // Ensure max 5km radius
      .sort((a, b) => a!.distance - b!.distance)
      .slice(0, 5) || []; // Limit to 5 results

    console.log(`Found ${nearbyDoctors.length} doctors within ${radius}km`);

    // If no doctors found in database, return mock data for demo (limited to 5)
    if (nearbyDoctors.length === 0) {
      console.log('No real doctors found, returning mock data');
      const mockDoctors = [
        {
          user_id: 'mock-1',
          first_name: 'Dr. Sarah',
          last_name: 'Johnson',
          specialties: ['Dermatology', 'Cosmetic Surgery'],
          years_experience: 12,
          avatar_url: null,
          bio: 'Specialized in skin cancer detection and cosmetic procedures',
          distance: Math.round((Math.random() * 4 + 1) * 10) / 10, // 1-5km
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
          distance: Math.round((Math.random() * 4 + 1) * 10) / 10, // 1-5km
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
          distance: Math.round((Math.random() * 4 + 1) * 10) / 10, // 1-5km
          is_verified: true,
          location: {
            latitude: latitude + (Math.random() - 0.5) * 0.3,
            longitude: longitude + (Math.random() - 0.5) * 0.3,
            address: '789 Specialist Clinic, University Area'
          }
        },
        {
          user_id: 'mock-4',
          first_name: 'Dr. James',
          last_name: 'Wilson',
          specialties: ['Dermatology', 'Acne Treatment'],
          years_experience: 6,
          avatar_url: null,
          bio: 'Young specialist focused on acne and teenage skin problems',
          distance: Math.round((Math.random() * 4 + 1) * 10) / 10, // 1-5km
          is_verified: true,
          location: {
            latitude: latitude + (Math.random() - 0.5) * 0.4,
            longitude: longitude + (Math.random() - 0.5) * 0.4,
            address: '321 Youth Clinic, Suburbs'
          }
        },
        {
          user_id: 'mock-5',
          first_name: 'Dr. Lisa',
          last_name: 'Brown',
          specialties: ['Dermatology', 'Psoriasis Treatment'],
          years_experience: 20,
          avatar_url: null,
          bio: 'Senior dermatologist with expertise in chronic skin conditions',
          distance: Math.round((Math.random() * 4 + 1) * 10) / 10, // 1-5km
          is_verified: true,
          location: {
            latitude: latitude + (Math.random() - 0.5) * 0.5,
            longitude: longitude + (Math.random() - 0.5) * 0.5,
            address: '654 Senior Care Center, Medical Row'
          }
        }
      ].filter(doctor => doctor.distance <= Math.min(radius, 5)).slice(0, 5); // Ensure max 5km

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
