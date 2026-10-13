# Soundtrack to Your Life

A multimedia application that generates personalized soundtracks based on multimodal data, including biomedical data (EEG, ECG, IMU) and environmental data (images, weather, location).

## Features

- **Data Capture**: Real-time capture of biomedical signals and environmental data
- **Mood Analysis**: AI-powered emotion detection from biomedical data
- **Music Selection**: Personalized song recommendations via Spotify API
- **Video Generation**: Create shortform videos with captured images and soundtrack
- **Settings**: Comprehensive customization options

## Setup

### Environment Variables

Create a `.env.local` file with the following variables:

\`\`\`env
# Spotify API Credentials
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
\`\`\`

### Getting Spotify Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Copy your Client ID and Client Secret
4. Add them to your `.env.local` file

### Installation

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Music API**: Spotify Web API
- **State Management**: SWR for data fetching
- **TypeScript**: Full type safety

## API Routes

- `GET /api/recommendations?mood={mood}&genres={genres}` - Get music recommendations
- `GET /api/search?q={query}` - Search for tracks

## Project Structure

\`\`\`
app/
├── page.tsx              # Home screen
├── capture/              # Data capture screen
├── mood/                 # Mood analysis screen
├── music/                # Music selection screen
├── video/                # Video generation screen
├── settings/             # Settings screen
└── api/                  # API routes
    ├── recommendations/  # Spotify recommendations
    └── search/           # Spotify search

components/
├── navigation.tsx        # Main navigation
└── spotify-player.tsx    # Spotify embed player

lib/
└── spotify.ts           # Spotify API utilities

hooks/
└── use-spotify-recommendations.ts  # SWR hooks for Spotify
\`\`\`

## Future Enhancements

- Real biomedical sensor integration
- Advanced mood detection algorithms
- Video rendering with FFmpeg
- User authentication and data persistence
- Social sharing features
- Playlist export to Spotify
