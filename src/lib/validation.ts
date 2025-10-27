import { z } from 'zod';

// Medical case validation
export const medicalCaseSchema = z.object({
  case_title: z.string()
    .trim()
    .min(5, { message: 'Case title must be at least 5 characters' })
    .max(200, { message: 'Case title must be less than 200 characters' }),
  symptoms: z.string()
    .trim()
    .max(5000, { message: 'Symptoms must be less than 5000 characters' })
    .optional(),
  image_urls: z.array(z.string().url()).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  user_location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    address: z.string().optional()
  }).optional()
});

export type MedicalCaseInput = z.infer<typeof medicalCaseSchema>;

// Consultation validation
export const consultationSchema = z.object({
  doctor_id: z.string().uuid(),
  scheduled_at: z.string().datetime(),
  duration_minutes: z.number().int().min(15).max(180).optional(),
  consultation_type: z.enum(['video', 'phone', 'in-person']).optional(),
  notes: z.string().max(2000).optional()
});

export type ConsultationInput = z.infer<typeof consultationSchema>;

// Profile update validation
export const profileUpdateSchema = z.object({
  first_name: z.string().trim().min(1).max(100).optional(),
  last_name: z.string().trim().min(1).max(100).optional(),
  phone: z.string().trim().max(20).optional(),
  bio: z.string().trim().max(1000).optional(),
  specialties: z.array(z.string()).optional(),
  years_experience: z.number().int().min(0).max(70).optional(),
  license_number: z.string().trim().max(50).optional()
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

// Location validation
export const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional()
});

export type LocationInput = z.infer<typeof locationSchema>;
