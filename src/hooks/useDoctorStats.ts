import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface DoctorStats {
  totalCases: number;
  approvedCases: number;
  totalConsultations: number;
  averageRating: number;
  casesThisWeek: number;
  consultationsToday: number;
}

export function useDoctorStats() {
  const [stats, setStats] = useState<DoctorStats>({
    totalCases: 0,
    approvedCases: 0,
    totalConsultations: 0,
    averageRating: 0,
    casesThisWeek: 0,
    consultationsToday: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const now = new Date();
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

      // Get consultations for this doctor
      const { data: consultations } = await supabase
        .from('consultations')
        .select('*')
        .eq('doctor_id', user.id);

      // Get cases assigned through consultations
      const caseIds = consultations?.map(c => c.case_id) || [];
      
      const [casesRes, casesThisWeekRes, consultationsTodayRes] = await Promise.all([
        caseIds.length > 0 
          ? supabase.from('medical_cases').select('*').in('id', caseIds)
          : Promise.resolve({ data: [], error: null }),
        caseIds.length > 0
          ? supabase.from('medical_cases').select('id', { count: 'exact' }).in('id', caseIds).gte('created_at', startOfWeek)
          : Promise.resolve({ count: 0 }),
        supabase.from('consultations').select('id', { count: 'exact' }).eq('doctor_id', user.id).gte('created_at', startOfToday)
      ]);

      const totalCases = casesRes.data?.length || 0;
      const approvedCases = casesRes.data?.filter(c => c.status === 'doctor_approved').length || 0;
      const casesThisWeek = casesThisWeekRes.count || 0;
      
      // Calculate average rating from consultations
      const ratingsWithValues = consultations?.filter(c => c.rating != null) || [];
      const averageRating = ratingsWithValues.length > 0
        ? ratingsWithValues.reduce((sum, c) => sum + (c.rating || 0), 0) / ratingsWithValues.length
        : 4.8; // Default rating if no ratings yet

      const consultationsToday = consultationsTodayRes.count || 0;

      setStats({
        totalCases,
        approvedCases,
        totalConsultations: consultations?.length || 0,
        averageRating: Math.round(averageRating * 10) / 10,
        casesThisWeek,
        consultationsToday
      });
    } catch (error) {
      console.error('Error fetching doctor stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch statistics',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, refetch: fetchStats };
}
