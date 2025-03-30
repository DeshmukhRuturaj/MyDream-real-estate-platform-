import React, { useState, useRef } from 'react';
import { geocodeAddress, getPlaceDetails } from '../utils/mapsConfig';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface PropertyUploadProps {
  onUploadComplete: (data: PropertyData) => void;
}

export interface PropertyData {
  images: File[];
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  details: {
    price: number;
    bedrooms: number;
    bathrooms: number;
    squareFeet: number;
    propertyType: string;
    title: string;
    description: string;
    yearBuilt: number;
    amenities: string[];
  };
}

export function PropertyUpload({ onUploadComplete }: PropertyUploadProps) {
  const navigate = useNavigate();
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [address, setAddress] = useState('');
  const [details, setDetails] = useState({
    price: 0,
    bedrooms: 0,
    bathrooms: 0,
    squareFeet: 0,
    propertyType: 'house',
    title: '',
    description: '',
    yearBuilt: new Date().getFullYear(),
    amenities: [] as string[]
  });

  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setImages(prev => [...prev, ...files]);
  };

  const handleAddressChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = event.target.value;
    setAddress(newAddress);

    try {
      const coordinates = await geocodeAddress(newAddress);
      if (map && marker) {
        map.setCenter(coordinates);
        marker.setPosition(coordinates);
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setUploading(true);

    try {
      // Get location coordinates
      const coordinates = await geocodeAddress(address);

      // Upload images to Supabase Storage
      const imageUrls = await Promise.all(
        images.map(async (image) => {
          const fileExt = image.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError, data } = await supabase.storage
            .from('property-images')
            .upload(filePath, image);

          if (uploadError) {
            throw uploadError;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('property-images')
            .getPublicUrl(filePath);

          return publicUrl;
        })
      );

      // Parse address components
      const addressComponents = address.split(',');
      const city = addressComponents[1]?.trim() || '';
      const state = addressComponents[2]?.trim().split(' ')[0] || '';
      const zipCode = addressComponents[2]?.trim().split(' ')[1] || '';

      // Create property in database
      const { data: property, error } = await supabase
        .from('properties')
        .insert([
          {
            type: 'sale', // or 'rent' based on the context
            title: details.title,
            description: details.description,
            price: details.price,
            bedrooms: details.bedrooms,
            bathrooms: details.bathrooms,
            square_feet: details.squareFeet,
            address: addressComponents[0]?.trim() || '',
            city,
            state,
            zip_code: zipCode,
            year_built: details.yearBuilt,
            property_type: details.propertyType,
            amenities: details.amenities,
            images: imageUrls,
            lat: coordinates.lat,
            lng: coordinates.lng
          }
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      const propertyData: PropertyData = {
        images,
        location: {
          address,
          coordinates
        },
        details
      };

      onUploadComplete(propertyData);
      navigate('/buy'); // Redirect to buy page after successful upload
    } catch (error) {
      console.error('Error uploading property:', error);
      alert('Failed to upload property. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title and Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Property Title</label>
          <input
            type="text"
            value={details.title}
            onChange={e => setDetails({...details, title: e.target.value})}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter property title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={details.description}
            onChange={e => setDetails({...details, description: e.target.value})}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            placeholder="Enter property description"
            required
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Property Images</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                  <span>Upload files</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="sr-only"
                    required
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="h-24 w-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, i) => i !== index))}
                    className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Property Address</label>
          <input
            type="text"
            value={address}
            onChange={handleAddressChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter property address"
            required
          />
          <div ref={mapRef} className="mt-4 h-64 rounded-md"></div>
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              value={details.price}
              onChange={e => setDetails({...details, price: Number(e.target.value)})}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Property Type</label>
            <select
              value={details.propertyType}
              onChange={e => setDetails({...details, propertyType: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="condo">Condo</option>
              <option value="townhouse">Townhouse</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
            <input
              type="number"
              value={details.bedrooms}
              onChange={e => setDetails({...details, bedrooms: Number(e.target.value)})}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
            <input
              type="number"
              value={details.bathrooms}
              onChange={e => setDetails({...details, bathrooms: Number(e.target.value)})}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Square Feet</label>
            <input
              type="number"
              value={details.squareFeet}
              onChange={e => setDetails({...details, squareFeet: Number(e.target.value)})}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Year Built</label>
            <input
              type="number"
              value={details.yearBuilt}
              onChange={e => setDetails({...details, yearBuilt: Number(e.target.value)})}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
          <div className="grid grid-cols-2 gap-2">
            {['Garage', 'Pool', 'Parking', 'Gym', 'Garden', 'Security', 'Elevator', 'Balcony'].map((amenity) => (
              <label key={amenity} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={details.amenities.includes(amenity.toLowerCase())}
                  onChange={(e) => {
                    const newAmenities = e.target.checked
                      ? [...details.amenities, amenity.toLowerCase()]
                      : details.amenities.filter(a => a !== amenity.toLowerCase());
                    setDetails({...details, amenities: newAmenities});
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload Property'}
        </button>
      </form>
    </div>
  );
} 