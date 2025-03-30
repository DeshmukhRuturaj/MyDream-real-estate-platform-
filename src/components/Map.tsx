import React from 'react';
import { Property } from '../types';

interface MapProps {
  properties: Property[];
  center?: google.maps.LatLngLiteral;
  zoom?: number;
}

export function Map({ properties, center = { lat: 20.5937, lng: 78.9629 }, zoom = 5 }: MapProps) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = React.useState<google.maps.Map>();
  const [markers, setMarkers] = React.useState<google.maps.Marker[]>([]);

  React.useEffect(() => {
    if (mapRef.current && !map) {
      const newMap = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeControl: false,
        streetViewControl: false,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });
      setMap(newMap);
    }
  }, [mapRef, map, center, zoom]);

  React.useEffect(() => {
    if (map) {
      // Clear existing markers
      markers.forEach(marker => marker.setMap(null));
      
      // Create new markers for each property
      const newMarkers = properties.map(property => {
        const marker = new google.maps.Marker({
          position: {
            lat: property.location?.lat || 0,
            lng: property.location?.lng || 0
          },
          map,
          title: property.title,
          animation: google.maps.Animation.DROP
        });

        // Add info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-semibold">${property.title}</h3>
              <p class="text-sm text-gray-600">${property.address.street}, ${property.address.city}</p>
              <p class="text-lg font-bold text-blue-600">₹${(property.price / 100000).toFixed(2)} L</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        return marker;
      });

      setMarkers(newMarkers);
    }
  }, [map, properties]);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
} 