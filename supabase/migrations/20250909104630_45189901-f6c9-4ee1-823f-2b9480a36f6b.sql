-- Create storage buckets for medical images and profile avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('medical-images', 'medical-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('profile-avatars', 'profile-avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- Create storage policies for medical images
CREATE POLICY "Users can upload medical images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'medical-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view medical images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'medical-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their medical images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'medical-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their medical images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'medical-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for profile avatars
CREATE POLICY "Users can upload profile avatars" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view profile avatars" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their profile avatars" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their profile avatars" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);