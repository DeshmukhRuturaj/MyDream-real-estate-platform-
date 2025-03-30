import React from 'react';
import { Home, Bed, Bath, Square, Heart } from 'lucide-react';
import type { Property } from '../types';

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
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="relative">
        <img 
          src={property.images[0]} 
          alt={property.title}
          className="w-full h-64 object-cover"
        />
        <button className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white transition-colors">
          <Heart className="w-6 h-6 text-gray-400" />
        </button>
        <div className="absolute top-4 left-4">
          <span className="bg-white/80 px-3 py-1 rounded-full text-sm font-medium">
            Showcase
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="text-2xl font-bold text-gray-900 mb-2">
          ₹{(property.price / 100000).toFixed(2)} L
        </div>
        <div className="flex gap-4 text-gray-600 mb-2">
          <span>{property.bedrooms} bd</span>
          <span>•</span>
          <span>{property.bathrooms} ba</span>
          <span>•</span>
          <span>{property.squareFeet} sqft</span>
        </div>
        <div className="text-gray-800 font-medium mb-2">{property.title}</div>
        <div className="text-gray-600">
          {property.address.street}, {property.address.city}, {property.address.state} {property.address.zipCode}
        </div>
      </div>
    </div>
  );
}