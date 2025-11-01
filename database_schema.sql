-- =====================================================
-- YouTube Title & Thumbnail Tool - Database Schema
-- =====================================================
-- This script contains all tables, RLS policies, functions, and triggers
-- for the YouTube Title & Thumbnail Tool application.

-- =====================================================
-- TABLES
-- =====================================================

-- Profiles Table
-- Stores user profile information and channel settings
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    channel_name text,
    channel_niche text,
    upload_schedule text,
    content_pillars text[],
    brand_voice text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- Audience Profiles Table
-- Stores detailed audience persona information
CREATE TABLE IF NOT EXISTS public.audience_profiles (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_name text NOT NULL,
    age_range text,
    location text,
    profession text,
    income_level text,
    pain_points text[],
    goals text[],
    values text[],
    content_consumption_habits text,
    time_availability text,
    preferred_platforms text[],
    buying_patterns text,
    current_state text,
    desired_state text,
    solution_approach text,
    unique_angle text,
    proof_points text[],
    value_proposition text,
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- Channel Settings Table
-- Stores channel-specific settings and performance goals
CREATE TABLE IF NOT EXISTS public.channel_settings (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    video_formats text[],
    target_video_length text,
    publishing_frequency text,
    performance_goals jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- YouTube Connections Table
-- Stores YouTube OAuth connection data and channel statistics
CREATE TABLE IF NOT EXISTS public.youtube_connections (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    channel_id text NOT NULL,
    channel_title text,
    access_token text NOT NULL,
    refresh_token text NOT NULL,
    token_expires_at timestamp with time zone NOT NULL,
    subscriber_count bigint,
    video_count bigint,
    view_count bigint,
    last_synced_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- YouTube Videos Table
-- Stores synced YouTube video data and analytics
CREATE TABLE IF NOT EXISTS public.youtube_videos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    video_id text NOT NULL,
    title text NOT NULL,
    description text,
    thumbnail_url text,
    published_at timestamp with time zone,
    view_count bigint,
    like_count bigint,
    comment_count bigint,
    tags text[],
    duration text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audience_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youtube_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youtube_videos ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES - Profiles Table
-- =====================================================

CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- =====================================================
-- RLS POLICIES - Audience Profiles Table
-- =====================================================

CREATE POLICY "Users can view their own audience profiles"
    ON public.audience_profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audience profiles"
    ON public.audience_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own audience profiles"
    ON public.audience_profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own audience profiles"
    ON public.audience_profiles
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES - Channel Settings Table
-- =====================================================

CREATE POLICY "Users can view their own channel settings"
    ON public.channel_settings
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own channel settings"
    ON public.channel_settings
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own channel settings"
    ON public.channel_settings
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES - YouTube Connections Table
-- =====================================================

CREATE POLICY "Users can view their own YouTube connection"
    ON public.youtube_connections
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own YouTube connection"
    ON public.youtube_connections
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own YouTube connection"
    ON public.youtube_connections
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own YouTube connection"
    ON public.youtube_connections
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES - YouTube Videos Table
-- =====================================================

CREATE POLICY "Users can view their own YouTube videos"
    ON public.youtube_videos
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own YouTube videos"
    ON public.youtube_videos
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own YouTube videos"
    ON public.youtube_videos
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own YouTube videos"
    ON public.youtube_videos
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: handle_new_user
-- Automatically creates a profile entry when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$;

-- Function: handle_updated_at
-- Automatically updates the updated_at timestamp on row updates
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Create profile on new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Triggers: Auto-update updated_at timestamps
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_audience_profiles_updated_at
    BEFORE UPDATE ON public.audience_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_channel_settings_updated_at
    BEFORE UPDATE ON public.channel_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_youtube_connections_updated_at
    BEFORE UPDATE ON public.youtube_connections
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- INDEXES (Optional - for performance optimization)
-- =====================================================

-- Index on user_id columns for faster lookups
CREATE INDEX IF NOT EXISTS idx_audience_profiles_user_id ON public.audience_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_channel_settings_user_id ON public.channel_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_youtube_connections_user_id ON public.youtube_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_user_id ON public.youtube_videos(user_id);

-- Index on video_id for faster video lookups
CREATE INDEX IF NOT EXISTS idx_youtube_videos_video_id ON public.youtube_videos(video_id);

-- Index on channel_id for faster channel lookups
CREATE INDEX IF NOT EXISTS idx_youtube_connections_channel_id ON public.youtube_connections(channel_id);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.profiles IS 'User profiles with channel branding information';
COMMENT ON TABLE public.audience_profiles IS 'Detailed audience persona profiles for targeted content creation';
COMMENT ON TABLE public.channel_settings IS 'Channel-specific settings and performance goals';
COMMENT ON TABLE public.youtube_connections IS 'OAuth connections to YouTube with channel statistics';
COMMENT ON TABLE public.youtube_videos IS 'Synced YouTube video data and analytics';

-- =====================================================
-- END OF SCHEMA
-- =====================================================
