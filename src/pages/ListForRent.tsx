import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { ImageDropzone } from '../components/ImageDropzone';
import { toast } from 'react-hot-toast';

interface FormData {
  title: string;
  description: string;
  monthly_rent: string;
  security_deposit: string;
  lease_term: string;
  bedrooms: string;
  bathrooms: string;
  square_footage: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  property_type: string;
  amenities: string[];
  utilities: string[];
  pets_allowed: boolean;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
}

export function ListForRent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [propertyImages, setPropertyImages] = useState<File[]>([]);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    monthly_rent: '',
    security_deposit: '',
    lease_term: '12',
    bedrooms: '',
    bathrooms: '',
    square_footage: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    property_type: 'apartment',
    amenities: [],
    utilities: [],
    pets_allowed: false,
    owner_name: '',
    owner_email: '',
    owner_phone: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleCheckboxChange = (name: string, list: 'amenities' | 'utilities') => {
    setFormData(prev => ({
      ...prev,
      [list]: prev[list].includes(name)
        ? prev[list].filter(item => item !== name)
        : [...prev[list], name]
    }));
  };

  const validateForm = () => {
    if (propertyImages.length === 0) {
      throw new Error('Please upload at least one image');
    }
    if (!formData.title.trim()) {
      throw new Error('Title is required');
    }
    if (!formData.description.trim()) {
      throw new Error('Description is required');
    }
    if (!formData.monthly_rent || isNaN(parseFloat(formData.monthly_rent))) {
      throw new Error('Valid monthly rent is required');
    }
    if (!formData.security_deposit || isNaN(parseFloat(formData.security_deposit))) {
      throw new Error('Valid security deposit is required');
    }
    if (!formData.bedrooms || isNaN(parseInt(formData.bedrooms))) {
      throw new Error('Valid number of bedrooms is required');
    }
    if (!formData.bathrooms || isNaN(parseInt(formData.bathrooms))) {
      throw new Error('Valid number of bathrooms is required');
    }
    if (!formData.square_footage || isNaN(parseInt(formData.square_footage))) {
      throw new Error('Valid square footage is required');
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
  };

  const uploadImages = async (files: File[]) => {
    if (!user) throw new Error('You must be signed in to upload images');

    const uploadPromises = files.map(async (file) => {
      try {
        // Create a unique filename with timestamp and sanitized name
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${timestamp}-${sanitizedName}`;
        const filePath = `property-images/${fileName}`;

        // Upload the file
        const { error: uploadError } = await supabase.storage
          .from('properties')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('properties')
          .getPublicUrl(filePath);

        return publicUrl;
      } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
      }
    });

    try {
      const urls = await Promise.all(uploadPromises);
      if (!urls.length) {
        throw new Error('No images were uploaded successfully');
      }
      return urls;
    } catch (error) {
      console.error('Error in uploadImages:', error);
      throw new Error('Failed to upload images. Please try again.');
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
        monthly_rent: parseFloat(formData.monthly_rent),
        security_deposit: parseFloat(formData.security_deposit),
        lease_term: parseInt(formData.lease_term),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        square_footage: parseInt(formData.square_footage),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zip_code: formData.zip_code.trim(),
        property_type: formData.property_type,
        amenities: formData.amenities,
        utilities: formData.utilities,
        pets_allowed: formData.pets_allowed,
        images: imageUrls,
        listed_by: user.id,
        owner_name: formData.owner_name.trim(),
        owner_email: formData.owner_email.trim(),
        owner_phone: formData.owner_phone.trim(),
        status: 'available',
        type: 'rental',
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
      navigate('/rent');
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while listing the property';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // If not authenticated, show error message
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          You must be signed in to list a property
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">List Your Property for Rent</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
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
                Monthly Rent (₹)
              </label>
              <input
                type="number"
                name="monthly_rent"
                value={formData.monthly_rent}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Security Deposit (₹)
              </label>
              <input
                type="number"
                name="security_deposit"
                value={formData.security_deposit}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="leaseTerm" className="block text-sm font-medium text-gray-700 mb-2">
                Lease Term (months)
              </label>
              <select
                id="leaseTerm"
                name="lease_term"
                value={formData.lease_term}
                onChange={handleInputChange}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="6">6 months</option>
                <option value="12">12 months</option>
                <option value="24">24 months</option>
              </select>
            </div>

            <div>
              <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-2">
                Property Type
              </label>
              <select
                id="propertyType"
                name="property_type"
                value={formData.property_type}
                onChange={handleInputChange}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="studio">Studio</option>
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
                'Gym',
                'Security',
                'Air Conditioning',
                'Heating',
                'Laundry',
                'Storage',
                'Balcony',
                'Elevator',
                'Furnished',
                'Pet Friendly'
              ].map(amenity => (
                <label key={amenity} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleCheckboxChange(amenity, 'amenities')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Utilities Included
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                'Water',
                'Electricity',
                'Gas',
                'Internet',
                'Cable TV',
                'Trash',
                'Heat',
                'Air Conditioning'
              ].map(utility => (
                <label key={utility} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.utilities.includes(utility)}
                    onChange={() => handleCheckboxChange(utility, 'utilities')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">{utility}</span>
                </label>
              ))}
            </div>
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

        {/* Add pets allowed checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="pets_allowed"
            name="pets_allowed"
            checked={formData.pets_allowed}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="pets_allowed" className="ml-2 block text-sm text-gray-900">
            Pets Allowed
          </label>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating listing...' : 'List Property'}
          </button>
        </div>
      </form>
    </div>
  );
} 