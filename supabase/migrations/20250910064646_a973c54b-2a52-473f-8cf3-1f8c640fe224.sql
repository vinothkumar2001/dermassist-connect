-- Clean up duplicate storage policies and buckets
-- First drop all existing policies on storage.objects for our buckets
DROP POLICY IF EXISTS "Users can upload their own medical images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own medical images" ON storage.objects;
DROP POLICY IF EXISTS "Doctors can view case medical images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload medical images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view medical images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update medical images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their medical images" ON storage.objects;
DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload profile avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can view profile avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update profile avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete profile avatars" ON storage.objects;

-- Delete and recreate buckets with proper settings
DELETE FROM storage.buckets WHERE id IN ('medical-images', 'profile-avatars');

-- Create storage buckets with proper configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('medical-images', 'medical-images', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('profile-avatars', 'profile-avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- Create clean storage policies for medical images
CREATE POLICY "Users can upload medical images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'medical-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own medical images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'medical-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Doctors can view case medical images" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'medical-images' AND
  EXISTS (
    SELECT 1 FROM public.consultations c
    JOIN public.medical_cases mc ON mc.id = c.case_id
    WHERE c.doctor_id = auth.uid() 
    AND (storage.foldername(name))[1] = mc.patient_id::text
  )
);

CREATE POLICY "Users can delete their medical images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'medical-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create clean storage policies for profile avatars
CREATE POLICY "Public avatar access" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-avatars');

CREATE POLICY "Users can upload their own avatars" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatars" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatars" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);