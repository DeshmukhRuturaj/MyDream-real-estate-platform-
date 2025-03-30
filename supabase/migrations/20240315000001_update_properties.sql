-- Make monthly_rent and security_deposit nullable
ALTER TABLE properties
ALTER COLUMN monthly_rent DROP NOT NULL,
ALTER COLUMN security_deposit DROP NOT NULL,
ALTER COLUMN lease_term DROP NOT NULL;

-- Add price column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'properties' AND column_name = 'price') THEN
        ALTER TABLE properties ADD COLUMN price DECIMAL(12,2);
    END IF;
END $$;

-- Update existing rental properties
UPDATE properties
SET type = 'rental'
WHERE type = 'rent';

-- Update existing sale properties
UPDATE properties
SET type = 'sale'
WHERE type = 'for_sale'; 