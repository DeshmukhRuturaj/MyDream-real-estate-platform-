-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(12,2),
    monthly_rent DECIMAL(12,2),
    security_deposit DECIMAL(12,2),
    lease_term INTEGER,
    bedrooms INTEGER NOT NULL,
    bathrooms INTEGER NOT NULL,
    square_footage INTEGER NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    property_type TEXT NOT NULL,
    amenities TEXT[] DEFAULT '{}',
    utilities TEXT[] DEFAULT '{}',
    pets_allowed BOOLEAN DEFAULT false,
    images TEXT[] DEFAULT '{}',
    status TEXT NOT NULL,
    listed_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    owner_name TEXT NOT NULL,
    owner_email TEXT NOT NULL,
    owner_phone TEXT NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Properties are viewable by everyone"
    ON properties FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own properties"
    ON properties FOR INSERT
    WITH CHECK (auth.uid() = listed_by);

CREATE POLICY "Users can update their own properties"
    ON properties FOR UPDATE
    USING (auth.uid() = listed_by)
    WITH CHECK (auth.uid() = listed_by);

CREATE POLICY "Users can delete their own properties"
    ON properties FOR DELETE
    USING (auth.uid() = listed_by); 