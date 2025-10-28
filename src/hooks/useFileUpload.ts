import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const uploadMedicalImage = async (file: File): Promise<{ url: string | null; error: any }> => {
    if (!user) {
      return { url: null, error: new Error('User not authenticated') };
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive"
      });
      return { url: null, error: new Error('Invalid file type') };
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive"
      });
      return { url: null, error: new Error('File too large') };
    }

    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('medical-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        toast({
          title: "Upload Failed",
          description: "Failed to upload image. Please try again.",
          variant: "destructive"
        });
        return { url: null, error };
      }

      // Get signed URL (1 hour expiry for medical images)
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from('medical-images')
        .createSignedUrl(data.path, 3600);

      if (urlError) {
        console.error('Failed to create signed URL:', urlError);
        toast({
          title: "Upload Failed",
          description: "Failed to generate secure URL for image",
          variant: "destructive"
        });
        return { url: null, error: urlError };
      }

      toast({
        title: "Upload Successful",
        description: "Image uploaded successfully",
      });

      return { url: signedUrlData.signedUrl, error: null };
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return { url: null, error };
    } finally {
      setUploading(false);
    }
  };

  const uploadAvatar = async (file: File): Promise<{ url: string | null; error: any }> => {
    if (!user) {
      return { url: null, error: new Error('User not authenticated') };
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive"
      });
      return { url: null, error: new Error('Invalid file type') };
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit for avatars
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return { url: null, error: new Error('File too large') };
    }

    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('profile-avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true // Allow overwriting existing avatar
        });

      if (error) {
        console.error('Avatar upload error:', error);
        toast({
          title: "Upload Failed",
          description: "Failed to upload avatar. Please try again.",
          variant: "destructive"
        });
        return { url: null, error };
      }

      // Get signed URL (24 hour expiry for avatars)
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from('profile-avatars')
        .createSignedUrl(data.path, 86400);

      if (urlError) {
        console.error('Failed to create signed URL:', urlError);
        toast({
          title: "Upload Failed",
          description: "Failed to generate secure URL for avatar",
          variant: "destructive"
        });
        return { url: null, error: urlError };
      }

      toast({
        title: "Avatar Updated",
        description: "Profile picture updated successfully",
      });

      return { url: signedUrlData.signedUrl, error: null };
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast({
        title: "Upload Failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return { url: null, error };
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadMedicalImage,
    uploadAvatar,
    uploading
  };
}