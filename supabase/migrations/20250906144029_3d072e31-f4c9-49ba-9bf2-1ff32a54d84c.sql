-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  user_type TEXT CHECK (user_type IN ('patient', 'doctor', 'admin')) DEFAULT 'patient',
  avatar_url TEXT,
  bio TEXT,
  specialties TEXT[] DEFAULT '{}', -- For doctors
  license_number TEXT, -- For doctors
  years_experience INTEGER, -- For doctors
  location JSONB, -- {city, state, country, coordinates}
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medical cases table
CREATE TABLE public.medical_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  case_title TEXT NOT NULL,
  symptoms TEXT,
  image_urls TEXT[] DEFAULT '{}',
  ai_diagnosis JSONB, -- {condition, confidence, severity, description, recommendations}
  doctor_diagnosis JSONB, -- {condition, notes, treatment_plan, follow_up}
  status TEXT CHECK (status IN ('pending', 'ai_analyzed', 'doctor_reviewed', 'treated', 'closed')) DEFAULT 'pending',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  is_emergency BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create consultations table
CREATE TABLE public.consultations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.medical_cases(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  consultation_type TEXT CHECK (consultation_type IN ('video', 'chat', 'phone', 'in_person')) DEFAULT 'video',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER DEFAULT 30,
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',
  meeting_url TEXT,
  notes TEXT,
  prescription JSONB,
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  cost DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table for doctor-patient communication
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.medical_cases(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'image', 'file', 'voice')) DEFAULT 'text',
  file_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('case_update', 'consultation_reminder', 'message', 'system')) DEFAULT 'system',
  related_id UUID, -- Can reference case_id, consultation_id, etc.
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Doctors can view patient profiles for their cases" ON public.profiles
FOR SELECT USING (
  user_type = 'patient' AND 
  EXISTS (
    SELECT 1 FROM public.consultations c 
    WHERE c.patient_id = user_id AND c.doctor_id = auth.uid()
  )
);

-- Create policies for medical cases
CREATE POLICY "Patients can manage their own cases" ON public.medical_cases
FOR ALL USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view cases assigned to them" ON public.medical_cases
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.consultations c 
    WHERE c.case_id = id AND c.doctor_id = auth.uid()
  )
);

CREATE POLICY "Doctors can update cases assigned to them" ON public.medical_cases
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.consultations c 
    WHERE c.case_id = id AND c.doctor_id = auth.uid()
  )
);

-- Create policies for consultations
CREATE POLICY "Users can view their own consultations" ON public.consultations
FOR SELECT USING (doctor_id = auth.uid() OR patient_id = auth.uid());

CREATE POLICY "Doctors can update their consultations" ON public.consultations
FOR UPDATE USING (doctor_id = auth.uid());

CREATE POLICY "Patients can create consultations" ON public.consultations
FOR INSERT WITH CHECK (patient_id = auth.uid());

-- Create policies for messages
CREATE POLICY "Users can view their own messages" ON public.messages
FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages" ON public.messages
FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their sent messages" ON public.messages
FOR UPDATE USING (sender_id = auth.uid());

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
FOR UPDATE USING (user_id = auth.uid());

-- Create storage buckets for medical images
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('medical-images', 'medical-images', false),
  ('profile-avatars', 'profile-avatars', true);

-- Create storage policies for medical images
CREATE POLICY "Users can upload their own medical images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'medical-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own medical images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'medical-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Doctors can view medical images for their consultations" ON storage.objects
FOR SELECT USING (
  bucket_id = 'medical-images' AND
  EXISTS (
    SELECT 1 FROM public.consultations c
    JOIN public.medical_cases mc ON mc.id = c.case_id
    WHERE c.doctor_id = auth.uid() 
    AND (storage.foldername(name))[1] = mc.patient_id::text
  )
);

-- Create storage policies for profile avatars
CREATE POLICY "Public avatar access" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-avatars');

CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_cases_updated_at BEFORE UPDATE ON public.medical_cases
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON public.consultations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX idx_medical_cases_patient_id ON public.medical_cases(patient_id);
CREATE INDEX idx_medical_cases_status ON public.medical_cases(status);
CREATE INDEX idx_consultations_doctor_id ON public.consultations(doctor_id);
CREATE INDEX idx_consultations_patient_id ON public.consultations(patient_id);
CREATE INDEX idx_consultations_scheduled_at ON public.consultations(scheduled_at);
CREATE INDEX idx_messages_consultation_id ON public.messages(consultation_id);
CREATE INDEX idx_messages_case_id ON public.messages(case_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);