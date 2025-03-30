import { Loader } from '@googlemaps/js-api-loader';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

console.log('Google Maps API Key:', GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing');

if (!GOOGLE_MAPS_API_KEY) {
  console.error('Google Maps API key is not set. Please set VITE_GOOGLE_MAPS_API_KEY in your environment variables.');
}

const loader = new Loader({
  apiKey: GOOGLE_MAPS_API_KEY || '',
  version: 'weekly',
  libraries: ['places', 'drawing', 'geometry'],
  language: 'en',
  region: 'IN'
});

interface MapOptions {
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  disableDefaultUI?: boolean;
  zoomControl?: boolean;
  mapTypeControl?: boolean;
  scaleControl?: boolean;
  streetViewControl?: boolean;
  rotateControl?: boolean;
  fullscreenControl?: boolean;
}

const DEFAULT_OPTIONS: MapOptions = {
  center: { lat: 20.5937, lng: 78.9629 }, // Center on India
  zoom: 5
};

let googleMapsPromise: Promise<typeof google> | null = null;

export async function loadGoogleMaps() {
  try {
    if (!googleMapsPromise) {
      console.log('Loading Google Maps...');
      googleMapsPromise = loader.load().catch(error => {
        console.error('Error loading Google Maps:', error);
        googleMapsPromise = null;
        throw error;
      });
    }
    await googleMapsPromise;
    console.log('Google Maps loaded successfully');
    return googleMapsPromise;
  } catch (error) {
    console.error('Failed to load Google Maps:', error);
    throw error;
  }
}

export async function initializeMap(element: HTMLElement, options?: MapOptions) {
  try {
    console.log('Initializing map with element:', element);
    if (!element) {
      throw new Error('Map element is required');
    }

    await loadGoogleMaps();
    
    // Set explicit size to ensure the map renders
    element.style.width = '100%';
    element.style.height = '100%';
    element.style.minHeight = '400px';

    console.log('Creating map with options:', { ...DEFAULT_OPTIONS, ...options });
    const map = new google.maps.Map(element, {
      ...DEFAULT_OPTIONS,
      ...options,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    // Force a resize event after a short delay to ensure proper rendering
    setTimeout(() => {
      google.maps.event.trigger(map, 'resize');
      console.log('Map resize triggered');
    }, 100);

    return map;
  } catch (error) {
    console.error('Error initializing Google Maps:', error);
    return null;
  }
}

export function addMarkers(map: google.maps.Map, properties: any[]) {
  if (!map) return;
  
  properties.forEach(property => {
    if (property.lat && property.lng) {
      const marker = new google.maps.Marker({
        position: { lat: property.lat, lng: property.lng },
        map,
        title: property.address
      });

      marker.addListener('click', () => {
        // Handle marker click - show property details, etc.
      });
    }
  });
} 