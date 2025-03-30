import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { SignInModal } from './components/SignInModal';
import { Home } from './pages/Home';
import { Buy } from './pages/Buy';
import { Rent } from './pages/Rent';
import { About } from './pages/About';
import { ListProperty } from './pages/ListProperty';
import { ListForSale } from './pages/ListForSale';
import { ListForRent } from './pages/ListForRent';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthCallback } from './pages/AuthCallback';
import { Profile } from './pages/Profile';
import { Toaster } from 'react-hot-toast';

function App() {
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar onSignInClick={() => setIsSignInModalOpen(true)} />
          
          <SignInModal
            isOpen={isSignInModalOpen}
            onClose={() => setIsSignInModalOpen(false)}
          />

          <Toaster position="top-center" />

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/buy" element={<Buy />} />
            <Route path="/rent" element={<Rent />} />
            <Route path="/about" element={<About />} />
            
            {/* Protected Routes */}
            <Route
              path="/list-property"
              element={
                <ProtectedRoute>
                  <ListProperty />
                </ProtectedRoute>
              }
            />
            <Route
              path="/list-for-sale"
              element={
                <ProtectedRoute>
                  <ListForSale />
                </ProtectedRoute>
              }
            />
            <Route
              path="/list-for-rent"
              element={
                <ProtectedRoute>
                  <ListForRent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;