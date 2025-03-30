import React from 'react';
import { Home, Search, Map, User, MessageSquare, Building } from 'lucide-react';

export function About() {
  return (
    <div className="flex-1 bg-white">
      {/* Hero Section */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Discover Your Perfect Property with MyDream
          </h1>
          <p className="text-xl text-gray-600">
            MyDream is more than just a real estate platform – it's your personalized gateway to finding the home of your dreams. We've reimagined property searching to make it intuitive, comprehensive, and tailored to your unique needs.
          </p>
        </div>
      </section>

      {/* Why MyDream Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why MyDream?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Comprehensive Property Discovery */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-full bg-blue-100">
                  <Home className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Comprehensive Property Discovery</h3>
              </div>
              <p className="text-gray-600">
                Explore an extensive collection of properties with unprecedented depth and detail. From cozy apartments to spacious family homes, MyDream provides a seamless search experience that goes beyond traditional listings.
              </p>
            </div>

            {/* Intelligent Search */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-full bg-blue-100">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Intelligent Search & Powerful Filters</h3>
              </div>
              <p className="text-gray-600">
                Our advanced search system allows you to find exactly what you're looking for. Filter by price, location, amenities, property type, and more. Whether you're a first-time buyer, an investor, or looking for your dream home, MyDream puts precision at your fingertips.
              </p>
            </div>

            {/* Interactive Mapping */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-full bg-blue-100">
                  <Map className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Interactive Mapping Technology</h3>
              </div>
              <p className="text-gray-600">
                Visualize your future neighborhood with our cutting-edge map integration. Explore property locations, discover nearby points of interest, calculate commute times, and get a true feel for the area – all within a few clicks.
              </p>
            </div>

            {/* Personalized Experience */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-full bg-blue-100">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Personalized Experience</h3>
              </div>
              <p className="text-gray-600">
                Save your favorite properties, receive custom notifications, and create a personalized dashboard that tracks your property journey. MyDream adapts to your preferences, making property hunting efficient and enjoyable.
              </p>
            </div>

            {/* Trusted Connections */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-full bg-blue-100">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Trusted Connections</h3>
              </div>
              <p className="text-gray-600">
                Connect directly with property owners, agents, and sellers. Our secure messaging system ensures transparent communication, helping you make informed decisions with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Everyone Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            For Everyone in Real Estate
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-full bg-blue-100">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Buyers & Renters</h3>
              </div>
              <p className="text-gray-600">Find your perfect space with unparalleled ease</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-full bg-blue-100">
                  <Home className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Property Owners</h3>
              </div>
              <p className="text-gray-600">List and showcase your properties to a wide audience</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-full bg-blue-100">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Real Estate Agents</h3>
              </div>
              <p className="text-gray-600">Streamline your listings and client interactions</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-full bg-blue-100">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Investors</h3>
              </div>
              <p className="text-gray-600">Discover opportunities with comprehensive property insights</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 bg-blue-600 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-2xl font-medium mb-2">MyDream isn't just a website – it's your partner in finding not just a property, but a place to call home.</p>
          <p className="text-xl italic">Your dream property is just a click away.</p>
        </div>
      </section>
    </div>
  );
} 