import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminStats {
  totalUsers: number;
  activeDoctors: number;
  casesProcessed: number;
  casesToday: number;
  newUsersThisMonth: number;
  userGrowthPercent: number;
}

interface UserData {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  is_verified: boolean;
  created_at: string;
  roles: string[];
}

export function useAdminData() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeDoctors: 0,
    casesProcessed: 0,
    casesToday: 0,
    newUsersThisMonth: 0,
    userGrowthPercent: 0
  });
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

      const [profilesRes, casesRes, rolesRes, casesTodayRes, newUsersThisMonthRes, usersLastMonthRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact' }),
        supabase.from('medical_cases').select('*', { count: 'exact' }),
        supabase.from('user_roles').select('*'),
        supabase.from('medical_cases').select('id', { count: 'exact' }).gte('created_at', startOfToday),
        supabase.from('profiles').select('id', { count: 'exact' }).gte('created_at', startOfMonth),
        supabase.from('profiles').select('id', { count: 'exact' }).gte('created_at', startOfLastMonth).lte('created_at', endOfLastMonth)
      ]);

      const totalUsers = profilesRes.count || 0;
      const activeDoctors = profilesRes.data?.filter(p => p.user_type === 'doctor' && p.is_verified).length || 0;
      const casesProcessed = casesRes.count || 0;
      const casesToday = casesTodayRes.count || 0;
      const newUsersThisMonth = newUsersThisMonthRes.count || 0;
      const usersLastMonth = usersLastMonthRes.count || 0;
      
      // Calculate growth percentage
      const userGrowthPercent = usersLastMonth > 0 
        ? Math.round(((newUsersThisMonth - usersLastMonth) / usersLastMonth) * 100)
        : 0;

      setStats({ 
        totalUsers, 
        activeDoctors, 
        casesProcessed, 
        casesToday, 
        newUsersThisMonth,
        userGrowthPercent 
      });

      const userRolesMap = new Map<string, string[]>();
      rolesRes.data?.forEach(r => {
        const existing = userRolesMap.get(r.user_id) || [];
        userRolesMap.set(r.user_id, [...existing, r.role]);
      });

      const usersWithRoles = profilesRes.data?.map(p => ({
        ...p,
        roles: userRolesMap.get(p.user_id) || []
      })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch admin data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const verifyDoctor = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: true })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Doctor verified successfully'
      });
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to verify doctor',
        variant: 'destructive'
      });
    }
  };

  const assignRole = async (userId: string, role: 'admin' | 'doctor' | 'patient') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Role ${role} assigned successfully`
      });
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign role',
        variant: 'destructive'
      });
    }
  };

  return { stats, users, loading, refetch: fetchData, verifyDoctor, assignRole };
}
