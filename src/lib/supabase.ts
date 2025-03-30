import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.');
}

// Create the Supabase client with proper error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Test the connection
(async () => {
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      console.error('Supabase connection error:', error);
    }
  } catch (error: unknown) {
    console.error('Failed to initialize Supabase client:', error);
  }
})().catch(console.error);

// Property types
export interface Property {
  id: string;
  created_at: string;
  user_id: string;
  type: 'sale' | 'rent';
  title: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  year_built: number;
  property_type: string;
  amenities: string[];
  images: string[];
}

// Property functions
export const createProperty = async (property: Omit<Property, 'id' | 'created_at' | 'user_id'>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User must be authenticated to create a property listing');
  }

  const { data, error } = await supabase
    .from('properties')
    .insert([
      {
        ...property,
        user_id: user.id,
      },
    ])
    .select();

  return { data, error };
};

export const getProperties = async (type?: 'sale' | 'rent') => {
  let query = supabase.from('properties').select('*');
  
  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;
  return { data, error };
};

export const getPropertyById = async (id: string) => {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
}; 