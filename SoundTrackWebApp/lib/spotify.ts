// Spotify API integration utilities

interface SpotifyTrack {
  id: string
  name: string
  artists: { name: string }[]
  album: {
    name: string
    images: { url: string }[]
  }
  duration_ms: number
  external_urls: {
    spotify: string
  }
}

interface SpotifyRecommendationsParams {
  seed_genres?: string[]
  seed_artists?: string[]
  seed_tracks?: string[]
  target_valence?: number // 0-1 (happiness)
  target_energy?: number // 0-1 (intensity)
  target_danceability?: number // 0-1
  target_acousticness?: number // 0-1
  limit?: number
}

/**
 * Generate Spotify OAuth authorization URL
 */
export function getSpotifyAuthUrl(): string {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "your-client-id"
  const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || "http://localhost:3000/api/auth/spotify/callback"

  const scopes = [
    "user-read-private",
    "user-read-email",
    "playlist-modify-public",
    "playlist-modify-private",
    "user-library-read",
    "user-library-modify",
  ].join(" ")

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: scopes,
    show_dialog: "true",
  })

  return `https://accounts.spotify.com/authorize?${params.toString()}`
}

/**
 * Get Spotify access token using client credentials flow
 */
export async function getSpotifyAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials not configured")
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  })

  if (!response.ok) {
    throw new Error("Failed to get Spotify access token")
  }

  const data = await response.json()
  return data.access_token
}

/**
 * Get music recommendations based on mood
 */
export async function getRecommendationsByMood(
  mood: string,
  genres: string[] = ["ambient", "classical", "electronic"],
): Promise<SpotifyTrack[]> {
  const token = await getSpotifyAccessToken()

  // Map moods to Spotify audio features
  const moodParams: Record<string, Partial<SpotifyRecommendationsParams>> = {
    happy: { target_valence: 0.8, target_energy: 0.6 },
    calm: { target_valence: 0.5, target_energy: 0.3, target_acousticness: 0.7 },
    energetic: { target_valence: 0.7, target_energy: 0.9, target_danceability: 0.8 },
    focused: { target_valence: 0.5, target_energy: 0.5, target_acousticness: 0.6 },
    relaxed: { target_valence: 0.6, target_energy: 0.2, target_acousticness: 0.8 },
    neutral: { target_valence: 0.5, target_energy: 0.5 },
  }

  const params = moodParams[mood.toLowerCase()] || moodParams.neutral

  const queryParams = new URLSearchParams({
    seed_genres: genres.slice(0, 3).join(","),
    limit: "20",
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  })

  const response = await fetch(`https://api.spotify.com/v1/recommendations?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to get Spotify recommendations")
  }

  const data = await response.json()
  return data.tracks
}

/**
 * Search for tracks by query
 */
export async function searchTracks(query: string, limit = 10): Promise<SpotifyTrack[]> {
  const token = await getSpotifyAccessToken()

  const queryParams = new URLSearchParams({
    q: query,
    type: "track",
    limit: String(limit),
  })

  const response = await fetch(`https://api.spotify.com/v1/search?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to search Spotify tracks")
  }

  const data = await response.json()
  return data.tracks.items
}

/**
 * Get track details by ID
 */
export async function getTrack(trackId: string): Promise<SpotifyTrack> {
  const token = await getSpotifyAccessToken()

  const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to get Spotify track")
  }

  return response.json()
}

/**
 * Format duration from milliseconds to MM:SS
 */
export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

/**
 * Convert Spotify track to app format
 */
export function convertSpotifyTrack(track: SpotifyTrack, matchScore = 85) {
  return {
    id: track.id,
    title: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    album: track.album.name,
    duration: formatDuration(track.duration_ms),
    matchScore,
    mood: "Calm", // This would be determined by your mood analysis
    imageUrl: track.album.images[0]?.url || "/placeholder.svg",
    spotifyUrl: track.external_urls.spotify,
  }
}
