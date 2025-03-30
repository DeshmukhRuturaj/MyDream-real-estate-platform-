import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { supabase, Property } from '../lib/supabase';
import { GoogleMap, useLoadScript, Marker, StandaloneSearchBox } from '@react-google-maps/api';
import type { Libraries } from '@react-google-maps/api';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PropertyWithOwner extends Property {
  owner?: {
    name: string;
    email: string;
    phone: string;
  };
  lat?: number;
  lng?: number;
}

interface MapSearchBoxProps {
  onPlacesChanged: (location: { lat: number; lng: number }) => void;
  initialSearchValue?: string;
}

interface PropertyDetailsModalProps {
  property: PropertyWithOwner | null;
  onClose: () => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '600px'
};

const searchBoxStyle = {
  boxSizing: 'border-box' as const,
  border: '1px solid transparent',
  width: '300px',
  height: '40px',
  padding: '0 12px',
  borderRadius: '4px',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
  fontSize: '14px',
  outline: 'none',
  textOverflow: 'ellipses',
  position: 'absolute' as const,
  left: '10px',
  top: '10px',
  backgroundColor: 'white',
};

const center = {
  lat: 40.7128,
  lng: -74.0060
};

const libraries: Libraries = ['places'];

function MapSearchBox({ onPlacesChanged, initialSearchValue }: MapSearchBoxProps) {
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onLoad = useCallback((ref: google.maps.places.SearchBox) => {
    setSearchBox(ref);
  }, []);

  useEffect(() => {
    if (inputRef.current && initialSearchValue) {
      inputRef.current.value = initialSearchValue;
    }
  }, [initialSearchValue]);

  const onPlacesChangedCallback = () => {
    if (searchBox) {
      const places = searchBox.getPlaces();
      if (places && places.length > 0 && places[0].geometry && places[0].geometry.location) {
        const location = places[0].geometry.location;
        onPlacesChanged({
          lat: location.lat(),
          lng: location.lng()
        });
      }
    }
  };

  return (
    <StandaloneSearchBox
      onLoad={onLoad}
      onPlacesChanged={onPlacesChangedCallback}
    >
      <input
        ref={inputRef}
        type="text"
        placeholder="Search location..."
        style={searchBoxStyle}
        className="map-search-box"
      />
    </StandaloneSearchBox>
  );
}

const formatIndianPrice = (price: number) => {
  if (price >= 10000000) { // 1 Crore or more
    const crores = (price / 10000000).toFixed(2);
    return `₹${crores} Cr`;
  } else if (price >= 100000) { // 1 Lakh or more
    const lakhs = (price / 100000).toFixed(2);
    return `₹${lakhs} L`;
  } else {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  }
};

function PropertyDetailsModal({ property, onClose }: PropertyDetailsModalProps) {
  if (!property) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{property.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {property.images && property.images.length > 0 && (
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {property.type === 'sale' 
                  ? `$${property.price.toLocaleString()}`
                  : `$${property.price.toLocaleString()}/month`}
              </h3>
              <div className="text-gray-600">
                {property.bedrooms} bd | {property.bathrooms} ba | {property.square_feet} sqft
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Property Details</h3>
              <div className="text-gray-600">
                <p>Type: {property.property_type}</p>
                <p>Year Built: {property.year_built}</p>
                <p>Address: {property.address}, {property.city}, {property.state} {property.zip_code}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600">{property.description}</p>
          </div>

          {property.amenities && property.amenities.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {property.owner && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Owner</h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="text-gray-600 sm:w-24 mb-1 sm:mb-0">Name:</span>
                  <span className="font-medium">{property.owner?.name}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="text-gray-600 sm:w-24 mb-1 sm:mb-0">Phone:</span>
                  <a 
                    href={`tel:${property.owner?.phone}`}
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    {property.owner?.phone}
                  </a>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="text-gray-600 sm:w-24 mb-1 sm:mb-0">Email:</span>
                  <a 
                    href={`mailto:${property.owner?.email}?subject=Inquiry about ${property.title}`}
                    className="font-medium text-blue-600 hover:text-blue-800 break-all"
                  >
                    {property.owner?.email}
                  </a>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 mt-6">
                <button 
                  onClick={() => window.location.href = `tel:${property.owner?.phone}`}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  Call Now
                </button>
                <button 
                  onClick={() => window.location.href = `mailto:${property.owner?.email}?subject=Inquiry about ${property.title}`}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  Send Email
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Buy() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<PropertyWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<PropertyWithOwner | null>(null);
  const [mapCenter, setMapCenter] = useState(center);
  const [mapZoom, setMapZoom] = useState(12);
  const [filters, setFilters] = useState({
    type: 'all',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
    propertyType: 'all',
    city: searchParams.get('city') || '',
    state: searchParams.get('state') || '',
  });
  const [searchLocation, setSearchLocation] = useState<string | null>(null);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const location = searchParams.get('location');
    
    if (location) {
      setSearchLocation(decodeURIComponent(location));
    }
    
    if (lat && lng) {
      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        setMapCenter({ lat: parsedLat, lng: parsedLng });
        setMapZoom(14);
      }
    } else if (location) {
      if (isLoaded && window.google) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: location }, (results, status) => {
          if (status === 'OK' && results && results[0] && results[0].geometry) {
            const { location } = results[0].geometry;
            setMapCenter({ lat: location.lat(), lng: location.lng() });
            setMapZoom(14);
            setSearchLocation(results[0].formatted_address);
            
            navigate(`/buy?lat=${location.lat()}&lng=${location.lng()}&location=${encodeURIComponent(results[0].formatted_address)}`, { replace: true });
          }
        });
      }
    }
  }, [searchParams, isLoaded, navigate]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      // If city is provided, center map on that city
      if (filters.city && isLoaded && window.google) {
        const geocoder = new window.google.maps.Geocoder();
        const address = `${filters.city}${filters.state ? `, ${filters.state}` : ''}`;
        
        const results = await new Promise((resolve, reject) => {
          geocoder.geocode({ address }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              resolve(results[0]);
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          });
        });

        if (results && (results as any).geometry) {
          const location = (results as any).geometry.location;
          setMapCenter({ lat: location.lat(), lng: location.lng() });
          setMapZoom(12);
          setSearchLocation((results as any).formatted_address);
          navigate(`/buy?lat=${location.lat()}&lng=${location.lng()}&location=${encodeURIComponent((results as any).formatted_address)}`, { replace: true });
        }
      }

      // Fetch properties with filters
      let query = supabase
        .from('properties')
        .select('*');

      // Apply strict filters
      if (filters.type !== 'all') {
        query = query.eq('type', filters.type === 'sale' ? 'sale' : 'rental');
      }
      if (filters.minPrice) {
        const priceField = filters.type === 'rent' ? 'monthly_rent' : 'price';
        query = query.gte(priceField, parseFloat(filters.minPrice));
      }
      if (filters.maxPrice) {
        const priceField = filters.type === 'rent' ? 'monthly_rent' : 'price';
        query = query.lte(priceField, parseFloat(filters.maxPrice));
      }
      if (filters.bedrooms) {
        query = query.eq('bedrooms', parseInt(filters.bedrooms));
      }
      if (filters.bathrooms) {
        query = query.eq('bathrooms', parseInt(filters.bathrooms));
      }
      if (filters.propertyType !== 'all') {
        query = query.eq('property_type', filters.propertyType.toLowerCase());
      }
      if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }
      if (filters.state) {
        query = query.ilike('state', `%${filters.state}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase query error:', error);
        toast.error('Error fetching properties');
        throw error;
      }
      
      setProperties(data || []);
      
      if (data && data.length > 0) {
        toast.success(`Found ${data.length} properties matching your criteria`);
      } else {
        toast.success('No properties found matching your criteria');
      }
    } catch (error) {
      console.error('Error during search:', error);
      toast.error('Error during search');
    } finally {
      setLoading(false);
    }
  };

  // Remove the useEffect that was automatically fetching on filter changes
  // This ensures properties are only fetched when the search button is clicked
  useEffect(() => {
    // Initial fetch when component mounts
    handleSearch();
  }, []); // Empty dependency array for initial load only

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    // Remove automatic fetching on filter change
  };

  const handlePlacesChanged = useCallback((location: { lat: number; lng: number }) => {
    setMapCenter(location);
    setMapZoom(14);
    navigate(`/buy?lat=${location.lat}&lng=${location.lng}`, { replace: true });
  }, [navigate]);

  const handlePropertyClick = (property: PropertyWithOwner) => {
    setSelectedProperty(property);
    setShowPropertyDetails(true);
  };

  const renderMap = () => {
    if (loadError) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-100 p-6">
          <p className="text-gray-500">Error loading map</p>
        </div>
      );
    }

    if (!isLoaded) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    return (
      <div className="relative h-full">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={mapZoom}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: true,
            mapTypeControl: true,
            mapTypeControlOptions: {
              position: google.maps.ControlPosition.TOP_RIGHT
            }
          }}
        >
          <MapSearchBox 
            onPlacesChanged={handlePlacesChanged} 
            initialSearchValue={searchLocation || ''} 
          />
          {properties.map((property) => (
            property.lat && property.lng && (
              <Marker
                key={property.id}
                position={{ lat: property.lat, lng: property.lng }}
                onClick={() => handlePropertyClick(property)}
              />
            )
          ))}
        </GoogleMap>
      </div>
    );
  };

  const renderPropertyList = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {properties.map((property) => (
        <div
          key={property.id}
          onClick={() => handlePropertyClick(property)}
          className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="relative">
            {property.images && property.images.length > 0 && (
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="absolute top-2 left-2">
              <span className="bg-white/80 px-3 py-1 rounded-full text-sm font-medium">
                {property.type === 'sale' ? 'For Sale' : 'For Rent'}
              </span>
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-xl font-semibold text-gray-900">
              {property.type === 'sale' 
                ? `$${property.price.toLocaleString()}`
                : `$${property.price.toLocaleString()}/month`}
            </h3>
            <div className="text-gray-600 mt-1">
              {property.bedrooms} bd | {property.bathrooms} ba | {property.square_feet} sqft
            </div>
            <p className="text-gray-800 font-medium mt-2 line-clamp-2">{property.title}</p>
            <p className="text-gray-600 mt-1 line-clamp-1">
              {property.address}, {property.city}, {property.state} {property.zip_code}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4">
        {/* Top Filters */}
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Type
              </label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full rounded-md border border-gray-300 p-2 text-sm"
              >
                <option value="all">All Properties</option>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Price
              </label>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="Min Price"
                className="w-full rounded-md border border-gray-300 p-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Price
              </label>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="Max Price"
                className="w-full rounded-md border border-gray-300 p-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bedrooms
              </label>
              <select
                name="bedrooms"
                value={filters.bedrooms}
                onChange={handleFilterChange}
                className="w-full rounded-md border border-gray-300 p-2 text-sm"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bathrooms
              </label>
              <select
                name="bathrooms"
                value={filters.bathrooms}
                onChange={handleFilterChange}
                className="w-full rounded-md border border-gray-300 p-2 text-sm"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Category
              </label>
              <select
                name="propertyType"
                value={filters.propertyType}
                onChange={handleFilterChange}
                className="w-full rounded-md border border-gray-300 p-2 text-sm"
              >
                <option value="all">All Types</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="studio">Studio</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                placeholder="Enter city"
                className="w-full rounded-md border border-gray-300 p-2 text-sm"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={filters.state}
                  onChange={handleFilterChange}
                  placeholder="Enter state"
                  className="w-full rounded-md border border-gray-300 p-2 text-sm"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  className="h-[38px] px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Map */}
          <div className="w-full lg:w-1/2 bg-white rounded-lg shadow overflow-hidden order-2 lg:order-1">
            {renderMap()}
          </div>

          {/* Property Listings */}
          <div className="w-full lg:w-1/2 order-1 lg:order-2">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : properties.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-4 sm:p-6 text-center">
                <p className="text-gray-500">No properties found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    onClick={() => handlePropertyClick(property)}
                    className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <div className="relative">
                      {property.images && property.images.length > 0 && (
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="absolute top-2 left-2">
                        <span className="bg-white/80 px-3 py-1 rounded-full text-sm font-medium">
                          {property.type === 'sale' ? 'For Sale' : 'For Rent'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {property.type === 'sale' 
                          ? `$${property.price.toLocaleString()}`
                          : `$${property.price.toLocaleString()}/month`}
                      </h3>
                      <div className="text-gray-600 mt-1">
                        {property.bedrooms} bd | {property.bathrooms} ba | {property.square_feet} sqft
                      </div>
                      <p className="text-gray-800 font-medium mt-2 line-clamp-2">{property.title}</p>
                      <p className="text-gray-600 mt-1 line-clamp-1">
                        {property.address}, {property.city}, {property.state} {property.zip_code}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Property Details Modal */}
      <PropertyDetailsModal 
        property={selectedProperty} 
        onClose={() => {
          setShowPropertyDetails(false);
          setSelectedProperty(null);
        }}
      />
    </div>
  );
} 