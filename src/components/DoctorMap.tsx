import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const doctorIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

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

function MapUpdater({ doctors, userLocation }: { doctors: Doctor[]; userLocation: { latitude: number; longitude: number } }) {
  const map = useMap();

  useEffect(() => {
    if (doctors.length > 0) {
      const bounds = L.latLngBounds([
        [userLocation.latitude, userLocation.longitude],
        ...doctors.map(d => [d.location.latitude, d.location.longitude] as [number, number])
      ]);
      map.fitBounds(bounds, { padding: [20, 20], maxZoom: 15 });
    } else {
      map.setView([userLocation.latitude, userLocation.longitude], 12);
    }
  }, [doctors, userLocation, map]);

  return null;
}

export function DoctorMap({ doctors, userLocation, className }: DoctorMapProps) {
  if (!userLocation) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg ${className}`}>
        <p className="text-muted-foreground">Set location to view nearby doctors on map</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <MapContainer
        center={[userLocation.latitude, userLocation.longitude]}
        zoom={12}
        className="w-full h-full rounded-lg shadow-lg"
        style={{ minHeight: '400px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
          <Popup>
            <div className="p-2">
              <strong>Your Location</strong>
            </div>
          </Popup>
        </Marker>

        {/* Doctor markers */}
        {doctors.map((doctor) => (
          doctor.location && (
            <Marker
              key={doctor.user_id}
              position={[doctor.location.latitude, doctor.location.longitude]}
              icon={doctorIcon}
            >
              <Popup>
                <div className="p-3 max-w-xs">
                  <h3 className="font-semibold text-sm">{doctor.first_name} {doctor.last_name}</h3>
                  <p className="text-xs text-gray-600 mb-2">{doctor.specialties?.join(', ') || 'Dermatologist'}</p>
                  <p className="text-xs text-gray-500">{doctor.years_experience} years experience</p>
                  <p className="text-xs text-blue-600 font-medium">{doctor.distance} km away</p>
                  {doctor.location.address && (
                    <p className="text-xs text-gray-500 mt-1">{doctor.location.address}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        ))}

        <MapUpdater doctors={doctors} userLocation={userLocation} />
      </MapContainer>
    </div>
  );
}
