# YouTube Thumbnail & Title Tool (YTTT)

A modern web application for creating compelling YouTube thumbnails and optimizing video titles to maximize engagement and views.

## Features

- 🎨 **Thumbnail Generator**: Create eye-catching YouTube thumbnails with customizable backgrounds, text, and layouts
- 📝 **Title Optimization**: Generate engaging video titles optimized for YouTube's algorithm
- 📊 **Analytics Dashboard**: Track your video performance and analytics
- 👤 **Audience Profiles**: Create and manage different audience segments for targeted content
- 🔗 **YouTube Integration**: Connect your YouTube channel for seamless workflow
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices

## Quick Start

### Prerequisites

- Node.js 18+ and npm (install with [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- A Supabase account and project

### Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update the `.env` file with your Supabase credentials:
   - Go to your [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project or create a new one
   - Go to Settings > API
   - Copy the Project URL, Project ID, and anon/public key

### Installation & Development


### Local Development

```bash
# Clone the repository
git clone https://github.com/vinodsharma10x/yttt.git

# Navigate to the project directory
cd yttt

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

You can work locally using your own IDE by cloning this repo and pushing changes.

Follow the installation steps above for local development.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Tech Stack

This project is built with:

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and builds
- **Styling**: Tailwind CSS for utility-first styling
- **UI Components**: shadcn/ui for beautiful, accessible components
- **Backend**: Supabase for database, authentication, and edge functions
- **Deployment**: Vercel for hosting and CI/CD

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components (shadcn/ui)
│   ├── thumbnail/      # Thumbnail generation components
│   ├── profile/        # User profile and channel management
│   └── dashboard/      # Analytics and dashboard components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── integrations/       # Third-party integrations (Supabase)
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and commit: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Environment Variables

The following environment variables are required:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase anonymous public key
- `VITE_SUPABASE_PROJECT_ID`: Your Supabase project ID

See `.env.example` for the complete list and format.

## Deployment

The application can be deployed to any static hosting service:

1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Set up environment variables in your hosting platform

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub or contact the development team.

