import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { ImageDropzone } from '../components/ImageDropzone';
import { toast, Toaster } from 'react-hot-toast';

interface FormData {
  title: string;
  description: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  square_footage: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  property_type: string;
  amenities: string[];
  owner_name: string;
  owner_email: string;
  owner_phone: string;
}

export function ListForSale() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [propertyImages, setPropertyImages] = useState<File[]>([]);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    square_footage: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    property_type: 'house', // default value
    amenities: [],
    owner_name: '',
    owner_email: '',
    owner_phone: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAmenitiesChange = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const uploadImages = async (files: File[]) => {
    if (!user) throw new Error('You must be signed in to upload images');

    const uploadPromises = files.map(async (file) => {
      try {
        // Create a unique filename
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${timestamp}-${sanitizedName}`;

        // Upload to the properties bucket
        const { data, error: uploadError } = await supabase.storage
          .from('properties')
          .upload(`property-images/${fileName}`, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('properties')
          .getPublicUrl(`property-images/${fileName}`);

        console.log('Successfully uploaded:', fileName);
        return publicUrl;
      } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
      }
    });

    try {
      const urls = await Promise.all(uploadPromises);
      console.log('All images uploaded successfully');
      return urls;
    } catch (error) {
      console.error('Failed to upload all images:', error);
      throw error;
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      throw new Error('Title is required');
    }
    if (!formData.description.trim()) {
      throw new Error('Description is required');
    }
    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      throw new Error('Please enter a valid price');
    }
    if (!formData.bedrooms || isNaN(parseInt(formData.bedrooms)) || parseInt(formData.bedrooms) <= 0) {
      throw new Error('Please enter a valid number of bedrooms');
    }
    if (!formData.bathrooms || isNaN(parseInt(formData.bathrooms)) || parseInt(formData.bathrooms) <= 0) {
      throw new Error('Please enter a valid number of bathrooms');
    }
    if (!formData.square_footage || isNaN(parseInt(formData.square_footage)) || parseInt(formData.square_footage) <= 0) {
      throw new Error('Please enter a valid square footage');
    }
    if (!formData.address.trim()) {
      throw new Error('Address is required');
    }
    if (!formData.city.trim()) {
      throw new Error('City is required');
    }
    if (!formData.state.trim()) {
      throw new Error('State is required');
    }
    if (!formData.zip_code.trim()) {
      throw new Error('ZIP code is required');
    }
    if (!formData.owner_name.trim()) {
      throw new Error('Owner name is required');
    }
    if (!formData.owner_email.trim()) {
      throw new Error('Owner email is required');
    }
    if (!formData.owner_phone.trim()) {
      throw new Error('Owner phone is required');
    }
    if (propertyImages.length === 0) {
      throw new Error('Please upload at least one image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!user) {
        throw new Error('You must be signed in to list a property');
      }

      console.log('Starting form submission...');
      console.log('Number of images to upload:', propertyImages.length);

      // Validate form data
      validateForm();
      console.log('Form validation passed');

      // Upload images first
      let imageUrls: string[] = [];
      try {
        console.log('Starting image upload...');
        imageUrls = await uploadImages(propertyImages);
        console.log('Images uploaded successfully:', imageUrls);
      } catch (error) {
        console.error('Image upload failed:', error);
        throw new Error('Failed to upload images. Please try again.');
      }

      // Create the property listing
      const propertyData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        monthly_rent: null,
        security_deposit: null,
        lease_term: null,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        square_footage: parseInt(formData.square_footage),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zip_code: formData.zip_code.trim(),
        property_type: formData.property_type,
        amenities: formData.amenities,
        utilities: [],
        pets_allowed: false,
        images: imageUrls,
        listed_by: user.id,
        owner_name: formData.owner_name.trim(),
        owner_email: formData.owner_email.trim(),
        owner_phone: formData.owner_phone.trim(),
        status: 'available',
        type: 'sale',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Inserting property data:', propertyData);

      // Insert the property data
      const { data, error: insertError } = await supabase
        .from('properties')
        .insert([propertyData])
        .select('id')
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error(insertError.message || 'Failed to create property listing');
      }

      if (!data) {
        throw new Error('Failed to create property listing: No data returned');
      }

      console.log('Property listed successfully:', data);
      toast.success('Property listed successfully!');
      navigate('/buy');
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while listing the property';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Toaster position="top-center" />
      <h1 className="text-3xl font-bold text-gray-900 mb-8">List Your Property for Sale</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Images
            </label>
            <ImageDropzone
              onImagesChange={setPropertyImages}
              maxFiles={10}
              maxSize={5 * 1024 * 1024} // 5MB
            />
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (₹)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-2">
                Property Type
              </label>
              <select
                id="propertyType"
                name="propertyType"
                value={formData.property_type}
                onChange={handleInputChange}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="land">Land</option>
              </select>
            </div>

            <div>
              <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-2">
                Bedrooms
              </label>
              <input
                type="number"
                id="bedrooms"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleInputChange}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-2">
                Bathrooms
              </label>
              <input
                type="number"
                id="bathrooms"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleInputChange}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="squareFootage" className="block text-sm font-medium text-gray-700 mb-2">
                Square Footage
              </label>
              <input
                type="number"
                id="squareFootage"
                name="square_footage"
                value={formData.square_footage}
                onChange={handleInputChange}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Street Address"
              className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="City"
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="State"
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                id="zipCode"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleInputChange}
                placeholder="ZIP Code"
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amenities
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                'Parking',
                'Pool',
                'Garden',
                'Gym',
                'Security',
                'Air Conditioning',
                'Heating',
                'Laundry',
                'Storage',
                'Balcony',
                'Elevator',
                'Pet Friendly'
              ].map(amenity => (
                <label key={amenity} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenitiesChange(amenity)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Owner Information Section */}
          <div className="bg-gray-50 p-6 rounded-lg space-y-4">
            <h2 className="text-lg font-medium">Owner Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Owner Name</label>
                <input
                  type="text"
                  name="owner_name"
                  value={formData.owner_name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Owner Email</label>
                <input
                  type="email"
                  name="owner_email"
                  value={formData.owner_email}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Owner Phone</label>
                <input
                  type="tel"
                  name="owner_phone"
                  value={formData.owner_phone}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Listing...' : 'List Property'}
          </button>
        </div>
      </form>
    </div>
  );
} 