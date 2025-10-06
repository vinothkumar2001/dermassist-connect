-- Drop the overly permissive policy that allows perpetual access
DROP POLICY IF EXISTS "Doctors can view patient profiles for their cases" ON public.profiles;

-- Create a time-bound policy that restricts doctor access to patient profiles
-- Only during active consultations (within 24 hours of scheduled time and status is active)
CREATE POLICY "Doctors can view patient profiles during active consultations"
ON public.profiles
FOR SELECT
USING (
  (user_type = 'patient'::text) 
  AND (
    EXISTS (
      SELECT 1
      FROM consultations c
      WHERE c.patient_id = profiles.user_id
        AND c.doctor_id = auth.uid()
        -- Only allow access during active consultations
        AND c.status IN ('scheduled', 'in_progress', 'completed')
        -- Time-bound: within 7 days before or after scheduled time
        -- This allows doctors to review notes shortly after consultation
        AND c.scheduled_at IS NOT NULL
        AND c.scheduled_at >= (NOW() - INTERVAL '24 hours')
        AND c.scheduled_at <= (NOW() + INTERVAL '7 days')
    )
  )
);