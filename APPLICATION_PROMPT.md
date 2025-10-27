# YouTube Title & Thumbnail Generator - Comprehensive Application Prompt

## Application Overview
Build a full-stack web application that helps YouTube creators generate AI-powered video titles and professional thumbnails optimized for maximum click-through rates. The app uses AI to analyze channel data, audience profiles, and content strategy to create personalized suggestions.

## Tech Stack Requirements
- **Frontend**: React 18+ with TypeScript, Vite
- **Styling**: Tailwind CSS with custom design system (HSL color tokens)
- **Backend**: Supabase (Lovable Cloud)
- **AI Integration**: Lovable AI (Gemini 2.5 Flash model)
- **Authentication**: Supabase Auth with email/password
- **External API**: YouTube Data API v3 for channel integration
- **Canvas**: HTML5 Canvas for thumbnail editing

## Core Features

### 1. Authentication System
- Email/password signup and login
- Auto-confirm email signups (no email verification)
- Protected routes requiring authentication
- User session management
- Profile creation on signup

### 2. YouTube Channel Integration
- OAuth 2.0 integration with YouTube
- Connect multiple YouTube channels
- Sync channel data (name, description, subscriber count)
- Fetch video analytics (views, likes, comments, CTR)
- Store video data locally for analysis
- Display channel overview with key metrics

### 3. User Profile & Settings

#### Audience Profiles (ICP - Ideal Customer Profile)
- Create multiple audience profiles
- Fields: Name, Age Range, Interests, Pain Points, Goals, Content Preferences
- Select active profile for AI generation
- CRUD operations for profiles

#### Channel Settings
- Channel Niche (e.g., Tech Reviews, Gaming, Education)
- Content Pillars (main topics/themes)
- Brand Voice (tone: professional, casual, humorous, etc.)
- Video Formats (tutorials, vlogs, reviews)
- Publishing Frequency
- Performance Goals (CTR, views, engagement)
- All settings feed into AI prompts for personalization

### 4. AI-Powered Title Generator

**Step 1: Video Details & Title Generation**
- Video description textarea
- Target keywords input
- Emotion/tone selector (Excitement, Curiosity, Urgency, Educational, Inspirational)
- Display active ICP being used
- "Generate AI Titles" button calls AI with full context:
  - Video description
  - Keywords
  - Emotion
  - ICP data
  - Channel niche
  - Brand voice
  - Content pillars
- Display 5 AI-generated title options
- Click to select title (visual checkmark indicator)
- Character count display (YouTube limit: 100 chars)
- Warning if title exceeds limit
- "Next: Create Thumbnail" button unlocks after selection

**AI Context for Title Generation:**
```
Channel Niche: {channelNiche}
Brand Voice: {brandVoice}
Content Pillars: {contentPillars.join(', ')}
Target Audience: {icp}
Video Topic: {description}
Keywords: {keywords}
Desired Emotion: {emotion}

Generate 5 compelling YouTube video titles that:
- Match the brand voice and channel niche
- Appeal to the target audience
- Include relevant keywords naturally
- Evoke {emotion}
- Are under 100 characters
- Use proven YouTube title formulas
```

### 5. AI-Powered Thumbnail Generator

**3-Step Workflow with Live Preview:**

#### Step 1: Video Details & Title Generation (see above)

#### Step 2: Thumbnail Text Generation
- Enabled only after title selection
- Display selected title at top for context
- "Generate Thumbnail Text" button
- AI generates:
  - Main headline (3-5 words, bold, attention-grabbing)
  - Subtitle/supporting text (optional)
- Uses same context as title generation
- Selection applies text to canvas preview
- "Next: Design Background" button unlocks

**AI Context for Thumbnail Text:**
```
Selected Video Title: {selectedTitle}
Video Description: {description}
Channel Niche: {channelNiche}
Brand Voice: {brandVoice}
Target Emotion: {emotion}

Generate impactful thumbnail text that:
- Complements the title
- Is 3-5 words maximum for main text
- Uses power words that drive clicks
- Matches brand voice
- Create curiosity or urgency
```

#### Step 3: Background & Final Design
Two options for background:

**Option A: Upload Image**
- Standard file upload (accepts JPG, PNG)
- Preview uploaded image on canvas

**Option B: Generate AI Background**
- Prompt user for background style/theme
- Example prompts:
  - "Futuristic tech background with neon accents"
  - "Professional studio setup with bokeh effect"
  - "Energetic gaming theme with bright colors"
- Call Lovable AI image generation (Gemini 2.5 Flash Image)
- Generate 1280x720 image
- Apply directly to canvas
- Option to regenerate with new prompt

**Design Controls:**
- Main text size slider (48-120px)
- Subtitle text size slider (24-72px)
- Text positioning (currently center, could expand)
- Download thumbnail button (PNG, 1280x720)

**Canvas Rendering:**
- 1280x720 resolution (YouTube standard)
- Background image/gradient
- Semi-transparent overlay for text readability
- Main text: white with black stroke, rounded rectangle background
- Subtitle: black text with white stroke, yellow/accent background
- Real-time updates as user adjusts

### 6. YouTube-Style Live Preview
**Always visible on right side during all 3 steps:**
- 16:9 aspect ratio thumbnail preview
- Display selected title below thumbnail (truncated at 100 chars)
- Character count indicator (changes color if over limit)
- Channel avatar (first letter of channel name in circle)
- Channel name
- Timestamp ("Just now")
- Format info: "Live preview • 1280x720 • 16:9 format"
- Updates in real-time as user types or changes settings

### 7. Analytics Dashboard
- Overview cards:
  - Total Videos
  - Average Views
  - Average CTR
  - Average Engagement Rate
- Top performing videos table:
  - Thumbnail preview
  - Title
  - Views
  - Likes
  - CTR
  - Published date
- Charts:
  - Video performance over time
  - CTR trends
  - Engagement metrics
- Filter by date range
- Search/filter videos

## Database Schema

### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  channel_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### audience_profiles
```sql
CREATE TABLE audience_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  name TEXT NOT NULL,
  age_range TEXT,
  interests TEXT[],
  pain_points TEXT[],
  goals TEXT[],
  content_preferences TEXT[],
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### channel_settings
```sql
CREATE TABLE channel_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL UNIQUE,
  channel_niche TEXT,
  content_pillars TEXT[],
  brand_voice TEXT,
  video_formats TEXT[],
  publishing_frequency TEXT,
  performance_goals TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### youtube_channels
```sql
CREATE TABLE youtube_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  channel_id TEXT NOT NULL UNIQUE,
  channel_name TEXT,
  description TEXT,
  subscriber_count INTEGER,
  video_count INTEGER,
  view_count BIGINT,
  thumbnail_url TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### youtube_videos
```sql
CREATE TABLE youtube_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES youtube_channels(id) NOT NULL,
  video_id TEXT NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  published_at TIMESTAMPTZ,
  view_count INTEGER,
  like_count INTEGER,
  comment_count INTEGER,
  ctr DECIMAL,
  average_view_duration INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**RLS Policies**: Enable Row Level Security on all tables. Users can only access their own data.

## Edge Functions

### 1. generate-titles
**Input:**
```typescript
{
  description: string;
  keywords: string;
  emotion: string;
  icp: string;
  channelNiche: string;
  brandVoice: string;
  contentPillars: string[];
}
```

**Output:**
```typescript
{
  titles: string[]; // Array of 5 titles
}
```

**Implementation**: Call Lovable AI (google/gemini-2.5-flash) with system prompt including all context. Extract structured output using tool calling.

### 2. generate-thumbnail-text
**Input:**
```typescript
{
  title: string;
  description: string;
  emotion: string;
  icp: string;
  channelNiche: string;
  brandVoice: string;
}
```

**Output:**
```typescript
{
  mainText: string;
  subtitle: string;
}
```

### 3. generate-background
**Input:**
```typescript
{
  prompt: string; // User's description of desired background
}
```

**Output:**
```typescript
{
  imageUrl: string; // Base64 data URL
}
```

**Implementation**: Use Lovable AI image generation with modalities: ["image", "text"]

### 4. youtube-get-auth-url
Generate YouTube OAuth URL with proper scopes and redirect URI.

### 5. youtube-complete-auth
Handle OAuth callback, exchange code for tokens, fetch channel data, store in database.

### 6. youtube-sync
Fetch latest videos from YouTube API, calculate metrics, store in database. Include CTR calculation.

## User Interface Requirements

### Design System
- Use semantic HSL color tokens in index.css
- Define in tailwind.config.ts:
  - Primary, secondary, accent colors
  - Background, foreground, muted colors
  - Border, input colors
  - Destructive (error) colors
  - Chart colors
- Support light/dark mode
- Gradient backgrounds using CSS variables
- Consistent spacing, typography, shadows

### Component Library
Use shadcn/ui components:
- Button (variants: default, outline, ghost, destructive)
- Card
- Input, Textarea, Select
- Dialog/Modal
- Tabs
- Table
- Badge
- Toast notifications (sonner)
- Slider
- Separator
- Accordion

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Thumbnail generator: stacked on mobile, side-by-side on desktop
- Dashboard: single column on mobile, grid on desktop

### Navigation
- Header with logo/title
- "Dashboard" button (top right) when on generator page
- "Generate Thumbnail" button when on dashboard
- Logout functionality
- Active route indication

### Loading States
- Skeleton loaders for data fetching
- Loading spinners for AI generation
- Disable buttons during async operations
- Toast notifications for success/error

### Error Handling
- Display user-friendly error messages
- Handle API failures gracefully
- Validation errors for forms
- 404 page for invalid routes

## User Flow

1. **Landing Page** → Sign Up/Login
2. **Dashboard** (first time):
   - Prompt to connect YouTube channel
   - Guide to set up audience profile
   - Guide to configure channel settings
3. **Connect YouTube**:
   - Click "Connect YouTube"
   - OAuth flow → Redirect to YouTube
   - Authorize app
   - Return to dashboard
   - Sync channel data and videos
4. **Create Audience Profile**:
   - Navigate to Profile → Audience Profiles
   - Click "New Profile"
   - Fill in details
   - Set as active
5. **Configure Channel Settings**:
   - Navigate to Profile → Channel Settings
   - Fill in niche, pillars, voice, etc.
6. **Generate Thumbnail**:
   - Click "Generate Thumbnail" from dashboard
   - **Step 1**: Enter video description, keywords, emotion → Generate titles → Select title
   - **Step 2**: Generate thumbnail text → Select text
   - **Step 3**: Upload/generate background → Adjust text sizes → Download
7. **View Analytics**:
   - Dashboard shows synced video performance
   - Analyze what works
   - Use insights for future content

## Additional Requirements

### Performance
- Lazy load components
- Optimize images
- Minimize bundle size
- Fast AI response times (< 5 seconds)

### Security
- Encrypted API keys (Supabase secrets)
- RLS policies on all tables
- Secure OAuth flow
- Input sanitization

### Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Color contrast ratios (WCAG AA)

### SEO
- Meta tags on all pages
- Descriptive titles
- Open Graph tags
- Sitemap

## Future Enhancements (Optional)
- A/B testing multiple thumbnails
- Save thumbnail designs for later
- Thumbnail templates library
- Face detection for positioning
- Font selection
- Color scheme suggestions
- Collaboration features
- Performance tracking for generated titles/thumbnails
- Bulk generation
- Video series support
- Export to YouTube directly

## Secrets Required
- `YOUTUBE_CLIENT_ID` - From Google Cloud Console
- `YOUTUBE_CLIENT_SECRET` - From Google Cloud Console
- `LOVABLE_API_KEY` - Auto-provided by Lovable Cloud

## Implementation Notes
- Start with authentication and database setup
- Implement YouTube OAuth integration
- Build profile and settings pages
- Create AI edge functions
- Build step-by-step thumbnail generator
- Add dashboard and analytics
- Polish UI/UX
- Test all flows thoroughly

This application combines AI, canvas manipulation, external API integration, and data analysis to provide a comprehensive tool for YouTube creators.