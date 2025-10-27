import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { medicalCaseSchema, type MedicalCaseInput } from '@/lib/validation';

export interface MedicalCase {
  id: string;
  patient_id: string;
  case_title: string;
  symptoms?: string;
  image_urls: string[];
  ai_diagnosis?: any;
  doctor_diagnosis?: any;
  status: 'pending' | 'ai_analyzed' | 'doctor_reviewed' | 'treated' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_emergency: boolean;
  created_at: string;
  updated_at: string;
  user_location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface CreateCaseData {
  case_title: string;
  symptoms?: string;
  image_urls?: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  is_emergency?: boolean;
  user_location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export function useMedicalCases() {
  const [cases, setCases] = useState<MedicalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchCases();
    }
  }, [user]);

  const fetchCases = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('medical_cases')
        .select('*')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching cases:', error);
        toast({
          title: "Error",
          description: "Failed to fetch medical cases",
          variant: "destructive"
        });
        return;
      }

      setCases((data || []) as MedicalCase[]);
    } catch (error) {
      console.error('Error fetching cases:', error);
      toast({
        title: "Error",
        description: "Failed to fetch medical cases",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createCase = async (caseData: CreateCaseData): Promise<{ case: MedicalCase | null; error: any }> => {
    if (!user) {
      return { case: null, error: new Error('User not authenticated') };
    }

    // Validate input
    try {
      medicalCaseSchema.parse(caseData);
    } catch (error: any) {
      const errorMessage = error.errors?.[0]?.message || 'Invalid input data';
      toast({
        title: "Validation error",
        description: errorMessage,
        variant: "destructive",
      });
      return { case: null, error: errorMessage };
    }

    try {
      const { data, error } = await supabase
        .from('medical_cases')
        .insert({
          patient_id: user.id,
          ...caseData
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating case:', error);
        toast({
          title: "Error",
          description: "Failed to create medical case",
          variant: "destructive"
        });
        return { case: null, error };
      }

      setCases(prev => [data as MedicalCase, ...prev]);
      toast({
        title: "Success",
        description: "Medical case created successfully",
      });

      return { case: data as MedicalCase, error: null };
    } catch (error) {
      console.error('Error creating case:', error);
      toast({
        title: "Error",
        description: "Failed to create medical case",
        variant: "destructive"
      });
      return { case: null, error };
    }
  };

  const updateCase = async (caseId: string, updates: Partial<MedicalCase>): Promise<{ case: MedicalCase | null; error: any }> => {
    try {
      const { data, error } = await supabase
        .from('medical_cases')
        .update(updates)
        .eq('id', caseId)
        .select()
        .single();

      if (error) {
        console.error('Error updating case:', error);
        toast({
          title: "Error",
          description: "Failed to update medical case",
          variant: "destructive"
        });
        return { case: null, error };
      }

      setCases(prev => prev.map(c => c.id === caseId ? data as MedicalCase : c));
      return { case: data as MedicalCase, error: null };
    } catch (error) {
      console.error('Error updating case:', error);
      toast({
        title: "Error",
        description: "Failed to update medical case",
        variant: "destructive"
      });
      return { case: null, error };
    }
  };

  const analyzeWithAI = async (caseId: string, imageUrl: string, symptoms?: string): Promise<{ analysis: any | null; error: any }> => {
    try {
      // Validate symptoms length
      if (symptoms && symptoms.length > 5000) {
        toast({
          title: "Input too long",
          description: "Symptoms description must be under 5000 characters",
          variant: "destructive",
        });
        return { analysis: null, error: 'Symptoms too long' };
      }

      console.log('Starting AI analysis for case:', caseId);
      
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to analyze images",
          variant: "destructive",
        });
        return { analysis: null, error: 'Not authenticated' };
      }

      const { data, error } = await supabase.functions.invoke('analyze-skin', {
        body: { imageUrl, symptoms },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Error analyzing with AI:', error);
        toast({
          title: "Analysis Error",
          description: error.message || "Failed to analyze image with AI. Please try again.",
          variant: "destructive"
        });
        return { analysis: null, error };
      }

      console.log('AI analysis response:', data);

      if (data && data.success && data.analysis) {
        // Update the case with AI diagnosis
        const { case: updatedCase, error: updateError } = await updateCase(caseId, {
          ai_diagnosis: data.analysis,
          status: 'ai_analyzed'
        });

        if (updateError) {
          console.error('Error updating case with AI diagnosis:', updateError);
          toast({
            title: "Update Error",
            description: "Analysis complete but failed to update case",
            variant: "destructive"
          });
          return { analysis: data.analysis, error: updateError };
        }

        toast({
          title: "Analysis Complete",
          description: `Detected: ${data.analysis.condition}`,
        });

        return { analysis: data.analysis, error: null };
      }

      toast({
        title: "Analysis Failed",
        description: data?.error || "Unable to analyze the image. Please ensure the image is clear and try again.",
        variant: "destructive"
      });
      
      return { analysis: null, error: new Error(data?.error || 'Analysis failed') };
    } catch (error) {
      console.error('Error analyzing with AI:', error);
      toast({
        title: "Analysis Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
      return { analysis: null, error };
    }
  };

  return {
    cases,
    loading,
    createCase,
    updateCase,
    analyzeWithAI,
    refetch: fetchCases
  };
}