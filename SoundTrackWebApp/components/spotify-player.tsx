"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

interface SpotifyPlayerProps {
  trackId: string
  trackName: string
  artistName: string
  spotifyUrl: string
}

export function SpotifyPlayer({ trackId, trackName, artistName, spotifyUrl }: SpotifyPlayerProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Spotify Embed */}
          <div className="aspect-[4/1] rounded-lg overflow-hidden">
            <iframe
              src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
              width="100%"
              height="100%"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title={`${trackName} by ${artistName}`}
            />
          </div>

          {/* Open in Spotify */}
          <Button asChild variant="outline" className="w-full gap-2 bg-transparent">
            <a href={spotifyUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
              Open in Spotify
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
