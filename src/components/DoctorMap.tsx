import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';

interface Doctor {
  user_id: string;
  first_name: string;
  last_name: string;
  specialties: string[];
  years_experience: number;
  distance: number;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

interface DoctorMapProps {
  doctors: Doctor[];
  userLocation: { latitude: number; longitude: number } | null;
  className?: string;
}

export function DoctorMap({ doctors, userLocation, className }: DoctorMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);

  // Get Mapbox token
  useEffect(() => {
    const getMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        setMapboxToken(data.token);
      } catch (error) {
        console.error('Failed to get Mapbox token for map:', error);
      }
    };
    getMapboxToken();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !userLocation || !mapboxToken) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [userLocation.longitude, userLocation.latitude],
      zoom: 12,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
    };
  }, [userLocation, mapboxToken]);

  useEffect(() => {
    if (!map.current || !userLocation) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add user location marker
    const userMarker = new mapboxgl.Marker({
      color: '#3B82F6'
    })
      .setLngLat([userLocation.longitude, userLocation.latitude])
      .setPopup(new mapboxgl.Popup().setHTML('<div class="p-2"><strong>Your Location</strong></div>'))
      .addTo(map.current);
    
    markers.current.push(userMarker);

    // Add doctor markers
    doctors.forEach(doctor => {
      if (doctor.location) {
        const doctorMarker = new mapboxgl.Marker({
          color: '#10B981'
        })
          .setLngLat([doctor.location.longitude, doctor.location.latitude])
          .setPopup(
            new mapboxgl.Popup().setHTML(`
              <div class="p-3 max-w-xs">
                <h3 class="font-semibold text-sm">${doctor.first_name} ${doctor.last_name}</h3>
                <p class="text-xs text-gray-600 mb-2">${doctor.specialties?.join(', ') || 'Dermatologist'}</p>
                <p class="text-xs text-gray-500">${doctor.years_experience} years experience</p>
                <p class="text-xs text-blue-600 font-medium">${doctor.distance} km away</p>
                ${doctor.location.address ? `<p class="text-xs text-gray-500 mt-1">${doctor.location.address}</p>` : ''}
              </div>
            `)
          )
          .addTo(map.current!);
        
        markers.current.push(doctorMarker);
      }
    });

    // Fit map to show all markers
    if (doctors.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([userLocation.longitude, userLocation.latitude]);
      doctors.forEach(doctor => {
        if (doctor.location) {
          bounds.extend([doctor.location.longitude, doctor.location.latitude]);
        }
      });
      
      map.current.fitBounds(bounds, {
        padding: { top: 20, bottom: 20, left: 20, right: 20 },
        maxZoom: 15
      });
    }

  }, [doctors, userLocation]);

  if (!userLocation) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg ${className}`}>
        <p className="text-muted-foreground">Set location to view nearby doctors on map</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div ref={mapContainer} className="w-full h-full rounded-lg shadow-lg" />
    </div>
  );
}