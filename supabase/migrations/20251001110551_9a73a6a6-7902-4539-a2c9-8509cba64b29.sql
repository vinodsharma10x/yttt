-- Create table for YouTube connections
CREATE TABLE public.youtube_connections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  token_expires_at timestamp with time zone NOT NULL,
  channel_id text NOT NULL,
  channel_title text,
  subscriber_count bigint,
  video_count bigint,
  view_count bigint,
  last_synced_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create table for storing YouTube video analytics
CREATE TABLE public.youtube_videos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id text NOT NULL,
  title text NOT NULL,
  description text,
  published_at timestamp with time zone,
  view_count bigint,
  like_count bigint,
  comment_count bigint,
  tags text[],
  duration text,
  thumbnail_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, video_id)
);

-- Enable RLS
ALTER TABLE public.youtube_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youtube_videos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for youtube_connections
CREATE POLICY "Users can view their own YouTube connection"
  ON public.youtube_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own YouTube connection"
  ON public.youtube_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own YouTube connection"
  ON public.youtube_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own YouTube connection"
  ON public.youtube_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for youtube_videos
CREATE POLICY "Users can view their own YouTube videos"
  ON public.youtube_videos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own YouTube videos"
  ON public.youtube_videos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own YouTube videos"
  ON public.youtube_videos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own YouTube videos"
  ON public.youtube_videos FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_youtube_connections_updated_at
  BEFORE UPDATE ON public.youtube_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();