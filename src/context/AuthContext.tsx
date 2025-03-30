import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { sendWelcomeEmail } from '../utils/emailService';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (signed in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);

      // Sign up the user first
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            email: email // Store email in user metadata
          }
        }
      });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        throw new Error(signUpError.message);
      }

      if (!data?.user) {
        throw new Error('No user data returned after signup');
      }

      // Wait a short moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Profile will be created automatically by the trigger
      // Just verify it exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) {
        console.error('Profile verification error:', profileError);
        // Delete the user if profile doesn't exist
        await supabase.auth.admin.deleteUser(data.user.id);
        throw new Error('Failed to verify user profile');
      }

      // Send welcome email
      try {
        await sendWelcomeEmail({
          to_email: email,
          to_name: email.split('@')[0]
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Continue even if email fails
      }

      // Set the user immediately after successful signup
      setUser(data.user);
      
      // Update session
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        toast.success('Account created successfully! Welcome to R-Estate Market!');
        navigate('/');
        return { error: null };
      }

      // If no session, try to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError || !signInData.user) {
        console.error('Auto sign-in error:', signInError);
        toast.error('Account created! Please sign in with your credentials.');
        return { error: new Error('Please sign in with your credentials') };
      }

      setUser(signInData.user);
      toast.success('Account created successfully! Welcome to R-Estate Market!');
      navigate('/');
      return { error: null };
    } catch (error) {
      console.error('Signup process error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during sign up';
      toast.error(errorMessage);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Sign in error:', error);
        toast.error(error.message);
        return { error };
      }

      if (!data.user) {
        const err = new Error('No user data returned after sign in');
        console.error(err);
        toast.error(err.message);
        return { error: err };
      }

      setUser(data.user);
      toast.success('Signed in successfully!');
      navigate('/');
      return { error: null };
    } catch (error) {
      console.error('Error in signIn:', error);
      toast.error('Failed to sign in');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 