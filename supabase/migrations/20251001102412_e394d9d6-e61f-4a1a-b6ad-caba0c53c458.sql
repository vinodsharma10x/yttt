-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_name TEXT,
  channel_niche TEXT,
  upload_schedule TEXT,
  content_pillars TEXT[],
  brand_voice TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create audience_profiles table (multiple ICPs per user)
CREATE TABLE public.audience_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile_name TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  
  -- Demographics
  age_range TEXT,
  location TEXT,
  profession TEXT,
  income_level TEXT,
  
  -- Psychographics
  pain_points TEXT[],
  goals TEXT[],
  values TEXT[],
  content_consumption_habits TEXT,
  
  -- Behavioral
  time_availability TEXT,
  preferred_platforms TEXT[],
  buying_patterns TEXT,
  
  -- Transformation
  current_state TEXT,
  desired_state TEXT,
  solution_approach TEXT,
  
  -- Positioning
  unique_angle TEXT,
  proof_points TEXT[],
  value_proposition TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create channel_settings table
CREATE TABLE public.channel_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  video_formats TEXT[],
  target_video_length TEXT,
  publishing_frequency TEXT,
  performance_goals JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audience_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for audience_profiles
CREATE POLICY "Users can view their own audience profiles"
  ON public.audience_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audience profiles"
  ON public.audience_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own audience profiles"
  ON public.audience_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own audience profiles"
  ON public.audience_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for channel_settings
CREATE POLICY "Users can view their own channel settings"
  ON public.channel_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own channel settings"
  ON public.channel_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own channel settings"
  ON public.channel_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_audience_profiles
  BEFORE UPDATE ON public.audience_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_channel_settings
  BEFORE UPDATE ON public.channel_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();