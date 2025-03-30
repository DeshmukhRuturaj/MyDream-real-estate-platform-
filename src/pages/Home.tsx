import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Home as HomeIcon, MapPin } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { useAuth } from '../context/AuthContext';
import { SignInModal } from '../components/SignInModal';

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  // Handle redirect after authentication
  React.useEffect(() => {
    if (user && location.state?.from) {
      navigate(location.state.from.pathname);
    }
  }, [user, location.state, navigate]);

  const handleActionClick = (path: string) => {
    if (!user) {
      setIsSignInModalOpen(true);
      return;
    }
    navigate(path);
  };

  const handleSearch = async (query: string) => {
    if (!user) {
      setIsSignInModalOpen(true);
      return;
    }

    // Navigate with the location parameter immediately
    navigate(`/buy?location=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section 
        className="relative h-[600px] bg-cover bg-center flex items-center" 
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/hero-image.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-white mb-4">Find Your Dream Home</h1>
            <p className="text-xl text-white mb-8">
              Discover the perfect property that matches your lifestyle. Browse through our extensive collection of homes for sale and rent.
            </p>
            <SearchBar onSearch={handleSearch} redirectToBuy={true} />
            <div className="mt-8">
              <button 
                onClick={() => handleActionClick('/about')}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition duration-300"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MyDream Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">About MyDream's Recommendations</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Recommendations are based on your location and search activity, such as the homes you've viewed and saved and the filters you've used. We use this information to bring similar homes to your attention, so you don't miss out.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Search Activity Card */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Search Activity</h3>
              <p className="text-gray-600">
                We analyze your search patterns and preferences to understand what type of properties interest you.
              </p>
            </div>

            {/* Location Based Card */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Location Based</h3>
              <p className="text-gray-600">
                Get personalized recommendations for properties in your preferred locations and neighborhoods.
              </p>
            </div>

            {/* Smart Filters Card */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Filters</h3>
              <p className="text-gray-600">
                Your filter preferences help us show you properties that match your specific requirements.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button 
              onClick={() => handleActionClick('/buy')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Start Exploring
              <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What are you looking for?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-6">
                <img 
                  src="/buy-home.png"
                  alt="Buy a home" 
                  className="w-32 h-32 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/128?text=Buy+Home';
                  }}
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Buy a home</h3>
              <p className="text-gray-600 mb-6">
                Find your place with an immersive photo experience and the most listings.
              </p>
              <button 
                onClick={() => handleActionClick('/buy')}
                className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search homes
              </button>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-6">
                <img 
                  src="/rent-home.png"
                  alt="Rent a home" 
                  className="w-32 h-32 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/128?text=Rent+Home';
                  }}
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Rent a home</h3>
              <p className="text-gray-600 mb-6">
                We're creating a seamless online experience from shopping to signing.
              </p>
              <button 
                onClick={() => handleActionClick('/rent')}
                className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Find rentals
              </button>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-6">
                <img 
                  src="/sell-home.png"
                  alt="Sell a home" 
                  className="w-32 h-32 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/128?text=Sell+Home';
                  }}
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Sell a home</h3>
              <p className="text-gray-600 mb-6">
                Get a better picture of your home's value and explore selling options.
              </p>
              <button 
                onClick={() => handleActionClick('/list-property')}
                className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start selling
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sign In Section - Only show if not authenticated */}
      {!user && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 bg-blue-50 rounded-2xl p-12">
              <div className="lg:w-1/2">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Get personalized recommendations
                </h2>
                <p className="text-gray-600 mb-6">
                  Sign in to see more relevant listings, save your favorite homes, and receive updates on property changes.
                </p>
                <button 
                  onClick={() => setIsSignInModalOpen(true)}
                  className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign in now
                </button>
              </div>
              
              <div className="lg:w-1/2 space-y-4">
                <div className="bg-white rounded-xl shadow-md p-6 transform hover:scale-[1.02] transition-transform">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-blue-100">
                      <HomeIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Recommended homes</h3>
                      <p className="text-gray-600">Get suggestions based on your preferences</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-md p-6 transform hover:scale-[1.02] transition-transform">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-blue-100">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Save your searches</h3>
                      <p className="text-gray-600">Keep track of your favorite properties</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
            <Link to="/about" className="text-gray-600 hover:text-blue-600">About</Link>
            <span className="text-gray-600">Research</span>
            <span className="text-gray-600">Careers</span>
            <span className="text-gray-600">Help</span>
            <span className="text-gray-600">Advertise</span>
            <span className="text-gray-600">Fair Housing Guide</span>
            <span className="text-gray-600">Terms of use</span>
            <span className="text-gray-600">Privacy Notice</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
            <span className="text-gray-600">Cookie Preference</span>
            <span className="text-gray-600">Learn</span>
            <span className="text-gray-600">AI</span>
            <span className="text-gray-600">Mobile Apps</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <span className="text-gray-600">Trulia</span>
            <span className="text-gray-600">StreetEasy</span>
            <span className="text-gray-600">HotPads</span>
            <span className="text-gray-600">Out East</span>
            <span className="text-gray-600">ShowingTime+</span>
          </div>
        </div>
      </footer>

      {/* Sign In Modal */}
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
      />
    </div>
  );
} 