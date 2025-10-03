import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Consultation {
  id: string;
  doctor_id: string;
  patient_id: string;
  case_id?: string;
  scheduled_at: string;
  duration_minutes: number;
  consultation_type: string;
  status: string;
  notes?: string;
  created_at: string;
}

interface CreateConsultationData {
  doctor_id: string;
  case_id?: string;
  scheduled_at: Date;
  duration_minutes?: number;
  consultation_type?: 'video' | 'phone' | 'in-person';
  notes?: string;
}

export function useConsultations() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const createConsultation = async (data: CreateConsultationData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book a consultation",
        variant: "destructive"
      });
      return { consultation: null, error: new Error('User not authenticated') };
    }

    setLoading(true);
    try {
      const consultationData = {
        doctor_id: data.doctor_id,
        patient_id: user.id,
        case_id: data.case_id || null,
        scheduled_at: data.scheduled_at.toISOString(),
        duration_minutes: data.duration_minutes || 30,
        consultation_type: data.consultation_type || 'video',
        notes: data.notes || null,
        status: 'scheduled'
      };

      const { data: consultation, error } = await supabase
        .from('consultations')
        .insert(consultationData)
        .select()
        .single();

      if (error) {
        console.error('Error creating consultation:', error);
        toast({
          title: "Booking Failed",
          description: "Unable to book consultation. Please try again.",
          variant: "destructive"
        });
        return { consultation: null, error };
      }

      toast({
        title: "Consultation Booked",
        description: "Your consultation has been scheduled successfully!",
      });

      return { consultation, error: null };
    } catch (error) {
      console.error('Error creating consultation:', error);
      toast({
        title: "Booking Error",
        description: "An unexpected error occurred while booking.",
        variant: "destructive"
      });
      return { consultation: null, error };
    } finally {
      setLoading(false);
    }
  };

  const fetchUserConsultations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .or(`doctor_id.eq.${user.id},patient_id.eq.${user.id}`)
        .order('scheduled_at', { ascending: true });

      if (error) {
        console.error('Error fetching consultations:', error);
        return;
      }

      setConsultations(data || []);
    } catch (error) {
      console.error('Error fetching consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserConsultations();
  }, [user]);

  return {
    consultations,
    loading,
    createConsultation,
    fetchUserConsultations
  };
}