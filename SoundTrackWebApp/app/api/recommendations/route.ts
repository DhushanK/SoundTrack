import { NextResponse } from "next/server"
import { getRecommendationsByMood, convertSpotifyTrack } from "@/lib/spotify"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mood = searchParams.get("mood") || "calm"
    const genres = searchParams.get("genres")?.split(",") || ["ambient", "classical", "electronic"]

    const tracks = await getRecommendationsByMood(mood, genres)

    // Convert to app format with calculated match scores
    const recommendations = tracks.map((track, index) => {
      // Higher match score for earlier recommendations
      const matchScore = Math.max(70, 95 - index * 2)
      return convertSpotifyTrack(track, matchScore)
    })

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error("Error fetching recommendations:", error)
    return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 })
  }
}
