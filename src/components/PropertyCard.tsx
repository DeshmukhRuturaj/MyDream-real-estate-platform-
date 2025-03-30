import React from 'react';
import { Home, Bed, Bath, Square, Heart } from 'lucide-react';
import { Property } from '../lib/supabase';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="relative">
        <img 
          src={property.images[0]} 
          alt={property.title}
          className="w-full h-48 sm:h-56 md:h-64 object-cover"
        />
        <button className="absolute top-2 sm:top-4 right-2 sm:right-4 p-1.5 sm:p-2 rounded-full bg-white/80 hover:bg-white transition-colors">
          <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
        </button>
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
          <span className="bg-white/80 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium">
            {property.type === 'sale' ? 'For Sale' : 'For Rent'}
          </span>
        </div>
      </div>
      
      <div className="p-3 sm:p-4">
        <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
          {formatIndianPrice(property.price)}
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-4 text-sm sm:text-base text-gray-600 mb-1.5 sm:mb-2">
          <span className="flex items-center">
            <Bed className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
            {property.bedrooms} bd
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center">
            <Bath className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
            {property.bathrooms} ba
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center">
            <Square className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
            {property.square_feet} sqft
          </span>
        </div>
        <div className="text-base sm:text-lg text-gray-800 font-medium mb-1.5 sm:mb-2 line-clamp-2">
          {property.title}
        </div>
        <div className="text-sm sm:text-base text-gray-600 line-clamp-2">
          {property.address}, {property.city}, {property.state} {property.zip_code}
        </div>
      </div>
    </div>
  );
}