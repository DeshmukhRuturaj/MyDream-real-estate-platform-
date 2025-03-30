import { Loader } from '@googlemaps/js-api-loader';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  console.error('Google Maps API key is not set. Please check your environment variables.');
}

// Initialize Google Maps loader
export const mapsLoader = new Loader({
  apiKey: GOOGLE_MAPS_API_KEY || '',
  version: 'weekly',
  libraries: ['places'],
  language: 'en'
});

// Function to geocode address
export const geocodeAddress = async (address: string): Promise<{lat: number, lng: number}> => {
  try {
    await mapsLoader.load();
    const geocoder = new google.maps.Geocoder();
    
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng()
          });
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  } catch (error) {
    console.error('Error loading Google Maps:', error);
    throw error;
  }
};

// Function to get place details
export const getPlaceDetails = async (placeId: string): Promise<google.maps.places.PlaceResult> => {
  try {
    await mapsLoader.load();
    const service = new google.maps.places.PlacesService(document.createElement('div'));
    
    return new Promise((resolve, reject) => {
      service.getDetails(
        { placeId, fields: ['formatted_address', 'geometry', 'name'] },
        (result, status) => {
          if (status === 'OK' && result) {
            resolve(result);
          } else {
            reject(new Error(`Place details request failed: ${status}`));
          }
        }
      );
    });
  } catch (error) {
    console.error('Error loading Google Maps:', error);
    throw error;
  }
}; 