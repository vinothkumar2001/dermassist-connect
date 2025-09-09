-- Create storage policies for medical images (buckets already exist)
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