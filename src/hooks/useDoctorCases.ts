import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface DoctorCase {
  id: string;
  case_title: string;
  symptoms?: string;
  image_urls: string[];
  status: string;
  priority: string;
  ai_diagnosis?: any;
  doctor_diagnosis?: any;
  created_at: string;
  patient: {
    first_name: string;
    last_name: string;
    email: string;
  };
  consultation_id?: string;
}

export function useDoctorCases() {
  const [cases, setCases] = useState<DoctorCase[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCases = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: consultations, error: consError } = await supabase
        .from('consultations')
        .select('case_id, id')
        .eq('doctor_id', user.id);

      if (consError) throw consError;

      if (!consultations || consultations.length === 0) {
        setCases([]);
        setLoading(false);
        return;
      }

      const caseIds = consultations.map(c => c.case_id).filter(Boolean);

      if (caseIds.length === 0) {
        setCases([]);
        setLoading(false);
        return;
      }

      const { data: medicalCases, error: casesError } = await supabase
        .from('medical_cases')
        .select(`
          *,
          patient:profiles!medical_cases_patient_id_fkey(first_name, last_name, email)
        `)
        .in('id', caseIds)
        .order('created_at', { ascending: false });

      if (casesError) throw casesError;

      const casesWithConsultations = medicalCases?.map(c => {
        const consultation = consultations.find(con => con.case_id === c.id);
        return {
          ...c,
          consultation_id: consultation?.id,
          patient: Array.isArray(c.patient) ? c.patient[0] : c.patient
        };
      }) || [];

      setCases(casesWithConsultations);
    } catch (error) {
      console.error('Error fetching cases:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch cases',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [user]);

  const updateCaseReview = async (caseId: string, diagnosis: any, action: 'approve' | 'modify' | 'reject') => {
    try {
      const update: any = {
        doctor_diagnosis: diagnosis,
        status: action === 'approve' ? 'doctor_approved' : 'under_review'
      };

      const { error } = await supabase
        .from('medical_cases')
        .update(update)
        .eq('id', caseId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Case ${action}ed successfully`
      });

      fetchCases();
    } catch (error) {
      console.error('Error updating case:', error);
      toast({
        title: 'Error',
        description: 'Failed to update case',
        variant: 'destructive'
      });
    }
  };

  return { cases, loading, refetch: fetchCases, updateCaseReview };
}
