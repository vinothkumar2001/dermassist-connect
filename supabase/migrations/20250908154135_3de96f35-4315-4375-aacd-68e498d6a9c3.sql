-- Add location tracking to medical cases for better doctor recommendations
ALTER TABLE public.medical_cases 
ADD COLUMN user_location JSONB;

-- Add index for efficient location-based queries on medical cases
CREATE INDEX idx_medical_cases_location ON public.medical_cases USING GIN (user_location);

-- Update profiles table to ensure location data structure is consistent
-- (No changes needed as location field already exists as JSONB)