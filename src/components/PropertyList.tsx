import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Property } from '../lib/supabase';
import { Heart, X, Phone, Mail, User, Home } from 'lucide-react';

interface PropertyListProps {
  type?: 'sale' | 'rent';
}

interface PropertyWithOwner extends Property {
  owner?: {
    name: string;
    email: string;
    phone: string;
  };
  lat: number;
  lng: number;
}

export function PropertyList({ type = 'sale' }: PropertyListProps) {
  const [properties, setProperties] = useState<PropertyWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<PropertyWithOwner | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error state before fetching

        // First check if Supabase client is properly initialized
        if (!supabase) {
          throw new Error('Database connection not initialized');
        }

        const { data, error: supabaseError } = await supabase
          .from('properties')
          .select(`
            *,
            owner:user_id (
              name,
              email,
              phone
            )
          `)
          .eq('type', type)
          .order('created_at', { ascending: false });

        if (supabaseError) {
          throw supabaseError;
        }

        setProperties(data || []);
      } catch (err) {
        console.error('Error fetching properties:', err);
        // Use mock data as fallback when in development
        if (process.env.NODE_ENV === 'development') {
          setProperties(mockProperties);
        } else {
          setError(err instanceof Error ? err.message : 'Failed to fetch properties');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [type]);

  // Mock data for development and fallback
  const mockProperties: PropertyWithOwner[] = [
    {
      id: '1',
      created_at: new Date().toISOString(),
      user_id: 'mock-user-1',
      type: 'sale',
      title: 'Beautiful Modern House',
      description: 'Spacious modern house with great amenities',
      price: 589000,
      bedrooms: 4,
      bathrooms: 3,
      square_feet: 2110,
      address: '1720 W 104th Ave',
      city: 'Anchorage',
      state: 'AK',
      zip_code: '99515',
      year_built: 2020,
      property_type: 'house',
      amenities: ['garage', 'pool'],
      images: ['/mock/house1.jpg'],
      lat: 61.2181,
      lng: -149.9003,
      owner: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '(555) 123-4567'
      }
    },
    {
      id: '2',
      created_at: new Date().toISOString(),
      user_id: 'mock-user-2',
      type: 'sale',
      title: 'Cozy Family Home',
      description: 'Perfect home for a growing family',
      price: 335000,
      bedrooms: 3,
      bathrooms: 2,
      square_feet: 1440,
      address: '2503 Parks Hwy',
      city: 'Fairbanks',
      state: 'AK',
      zip_code: '99709',
      year_built: 2018,
      property_type: 'house',
      amenities: ['garage', 'garden'],
      images: ['/mock/house2.jpg'],
      lat: 64.8401,
      lng: -147.7200,
      owner: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '(555) 987-6543'
      }
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Home className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load properties</h3>
        <p className="text-gray-500 text-center mb-4">We're having trouble connecting to our servers. Please try again later.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Home className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
        <p className="text-gray-500 text-center">
          No properties listed for {type === 'sale' ? 'sale' : 'rent'} yet.
          Check back later or try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 p-4">
        {properties.map((property) => (
          <div
            key={property.id}
            onClick={() => setSelectedProperty(property)}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="relative">
              {property.images && property.images.length > 0 && (
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <button className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100">
                <Heart className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-800">${property.price.toLocaleString()}</h3>
              <div className="mt-1 text-gray-600">
                {property.bedrooms} bd | {property.bathrooms} ba | {property.square_feet} sqft
              </div>
              <p className="mt-2 text-gray-800">{property.title}</p>
              <p className="mt-1 text-gray-600">
                {property.address}, {property.city}, {property.state} {property.zip_code}
              </p>
              <div className="mt-2 text-sm text-gray-500">
                Listed {new Date(property.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Property Details Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedProperty.title}</h2>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {selectedProperty.images && selectedProperty.images.length > 0 && (
                <img
                  src={selectedProperty.images[0]}
                  alt={selectedProperty.title}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">${selectedProperty.price.toLocaleString()}</h3>
                  <div className="text-gray-600">
                    {selectedProperty.bedrooms} bd | {selectedProperty.bathrooms} ba | {selectedProperty.square_feet} sqft
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Property Details</h3>
                  <div className="text-gray-600">
                    <p>Type: {selectedProperty.property_type}</p>
                    <p>Year Built: {selectedProperty.year_built}</p>
                    <p>Address: {selectedProperty.address}, {selectedProperty.city}, {selectedProperty.state} {selectedProperty.zip_code}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{selectedProperty.description}</p>
              </div>

              {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.amenities.map((amenity, index) => (
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

              {selectedProperty.owner && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Owner</h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <User className="w-5 h-5 mr-2" />
                      <span>{selectedProperty.owner.name}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-5 h-5 mr-2" />
                      <span>{selectedProperty.owner.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-5 h-5 mr-2" />
                      <span>{selectedProperty.owner.phone}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
} 