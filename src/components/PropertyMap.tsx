import React, { useState, useEffect, useRef } from 'react';
import { Heart, Search } from 'lucide-react';
import { initializeMap, loadGoogleMaps } from '../utils/maps';

interface Property {
  id: string;
  title: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  address: string;
  city: string;
  state: string;
  zip: string;
  type: string;
  images: string[];
  has3DTour?: boolean;
  agency: string;
  lat: number;
  lng: number;
}

interface PropertyMapProps {
  listingType: 'sale' | 'rent';
  center: { lat: number; lng: number };
  zoom: number;
  onSearch: (query: string, lat: number, lng: number) => void;
  initialLocation?: { query: string; lat: number; lng: number } | null;
}

export function PropertyMap({ listingType, center, zoom, onSearch, initialLocation }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = useState(initialLocation?.query || '');
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // Initialize map
  useEffect(() => {
    async function initMap() {
      console.log('Starting map initialization');
      if (!mapRef.current) {
        console.error('Map container ref is not available');
        return;
      }

      try {
        console.log('Loading Google Maps...');
        // Load Google Maps first
        await loadGoogleMaps();
        console.log('Google Maps loaded successfully');

        // Initialize map using the utility function
        const mapInstance = await initializeMap(mapRef.current, {
          center,
          zoom,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: true,
          rotateControl: true,
          fullscreenControl: true,
        });

        if (mapInstance) {
          console.log('Map instance created successfully');
          setMap(mapInstance);

          // Add markers for mock properties
          mockProperties.forEach((property) => {
            const marker = new google.maps.Marker({
              position: { lat: property.lat, lng: property.lng },
              map: mapInstance,
              title: property.title,
            });

            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div class="p-2">
                  <h3 class="font-semibold">${property.title}</h3>
                  <p class="text-sm">${property.price}</p>
                </div>
              `,
            });

            marker.addListener('click', () => {
              infoWindow.open(mapInstance, marker);
            });
          });
        } else {
          console.error('Failed to create map instance');
        }
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }

    initMap();
  }, [center, zoom]);

  // Update map center when center prop changes
  useEffect(() => {
    if (map) {
      map.setCenter(center);
    }
  }, [center, map]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = e.currentTarget.value;
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: value }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          onSearch(value, lat, lng);
        }
      });
    }
  };

  // Mock data - replace with real data from your backend
  const mockProperties: Property[] = [
    {
      id: '1',
      title: 'House for sale',
      price: 589000,
      beds: 4,
      baths: 3,
      sqft: 2110,
      address: '1720 W 104th Ave',
      city: 'Anchorage',
      state: 'AK',
      zip: '99515',
      type: 'House for sale',
      images: ['/mock/house1.jpg'],
      has3DTour: true,
      agency: 'JACK WHITE REAL ESTATE',
      lat: 61.2181,
      lng: -149.9003
    },
    {
      id: '2',
      title: 'House for sale',
      price: 335000,
      beds: 3,
      baths: 2,
      sqft: 1440,
      address: '2503 Parks Hwy',
      city: 'Fairbanks',
      state: 'AK',
      zip: '99709',
      type: 'House for sale',
      images: ['/mock/house2.jpg'],
      has3DTour: true,
      agency: 'MAJORS REALTY GROUP, LLC',
      lat: 64.8401,
      lng: -147.7200
    }
  ];

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-96">
        <div className="relative">
          <input
            type="text"
            placeholder="Search on map"
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearch}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      <div ref={mapRef} className="absolute inset-0" />
    </div>
  );
} 