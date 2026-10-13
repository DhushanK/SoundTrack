import { NextResponse } from "next/server"
import { searchTracks, convertSpotifyTrack } from "@/lib/spotify"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json({ error: "Query parameter required" }, { status: 400 })
    }

    const tracks = await searchTracks(query, 20)

    const results = tracks.map((track) => convertSpotifyTrack(track))

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Error searching tracks:", error)
    return NextResponse.json({ error: "Failed to search tracks" }, { status: 500 })
  }
}
