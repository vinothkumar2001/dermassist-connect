-- Add baseline authentication policies to all tables
CREATE POLICY "Require authentication for profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Require authentication for medical cases"
ON public.medical_cases
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Require authentication for consultations"
ON public.consultations
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Require authentication for messages"
ON public.messages
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Require authentication for notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (true);

-- Make storage buckets private
UPDATE storage.buckets
SET public = false
WHERE id IN ('medical-images', 'profile-avatars');

-- Drop all existing storage policies to recreate them properly
DROP POLICY IF EXISTS "Authenticated users can upload medical images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload medical images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own medical images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view medical images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own medical images" ON storage.objects;
DROP POLICY IF EXISTS "Doctors can view case medical images" ON storage.objects;
DROP POLICY IF EXISTS "Doctors can view medical images for their consultations" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their medical images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own medical images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their medical images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own medical images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;
DROP POLICY IF EXISTS "Public avatars are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their profile avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their profile avatars" ON storage.objects;

-- Create proper storage policies for medical-images
CREATE POLICY "Auth users upload medical images to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'medical-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users view own medical images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'medical-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Doctors view patient images during consultations"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'medical-images'
  AND EXISTS (
    SELECT 1
    FROM public.consultations c
    JOIN public.medical_cases mc ON mc.id = c.case_id
    WHERE c.doctor_id = auth.uid()
      AND c.status IN ('scheduled', 'in_progress', 'completed')
      AND c.scheduled_at >= now() - interval '24 hours'
      AND c.scheduled_at <= now() + interval '7 days'
      AND (storage.foldername(objects.name))[1] = mc.patient_id::text
  )
);

CREATE POLICY "Users update own medical images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'medical-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users delete own medical images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'medical-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create proper storage policies for profile-avatars
CREATE POLICY "Auth users upload avatars to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users view own avatars"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'profile-avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users update own avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users delete own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);