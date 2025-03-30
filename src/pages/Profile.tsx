import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Loader2, Trash2, PencilIcon } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  description: string;
  price?: number;
  monthly_rent?: number;
  images: string[];
  type: string;
  status: string;
  created_at: string;
}

export function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserProperties();
    }
  }, [user]);

  const fetchUserProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('listed_by', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to load your properties');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    setDeleteLoading(propertyId);
    try {
      // Delete the property
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      // Update the local state
      setProperties(prev => prev.filter(p => p.id !== propertyId));
      toast.success('Property deleted successfully');
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatIndianPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/list-for-sale')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            List for Sale
          </button>
          <button
            onClick={() => navigate('/list-for-rent')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            List for Rent
          </button>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">You haven't listed any properties yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-48">
                <img
                  src={property.images[0] || '/placeholder-property.jpg'}
                  alt={property.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-property.jpg';
                  }}
                />
                <div className={`absolute top-2 right-2 px-2 py-1 rounded text-sm text-white ${
                  property.type === 'sale' ? 'bg-blue-600' : 'bg-green-600'
                }`}>
                  {property.type === 'sale' ? 'For Sale' : 'For Rent'}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{property.title}</h3>
                <p className="text-gray-600 mb-2 line-clamp-2">{property.description}</p>
                <p className="text-xl font-bold text-blue-600 mb-2">
                  {property.type === 'sale' 
                    ? formatIndianPrice(property.price || 0)
                    : `${formatIndianPrice(property.monthly_rent || 0)}/mo`}
                </p>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-500">
                    Listed: {new Date(property.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/edit-property/${property.id}`)}
                      className="p-2 text-gray-600 hover:text-blue-600"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(property.id)}
                      disabled={deleteLoading === property.id}
                      className="p-2 text-gray-600 hover:text-red-600"
                    >
                      {deleteLoading === property.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 