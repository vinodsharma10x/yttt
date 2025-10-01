-- Add unique constraint on video_id for proper upsert functionality
ALTER TABLE youtube_videos ADD CONSTRAINT youtube_videos_video_id_key UNIQUE (video_id);