"use client"

import { useEffect, useState, useRef } from "react"
import { useLatestMedia } from "@/hooks/use-latest-media"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Music, X, Volume2, VolumeX } from "lucide-react"

export function RealtimePlayer() {
  const { latestMedia, error } = useLatestMedia()
  const [isVisible, setIsVisible] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [hasPlayed, setHasPlayed] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // When new media arrives and it's different from what we've played
    if (latestMedia && latestMedia.id !== hasPlayed && latestMedia.embed) {
      setIsVisible(true)
      setHasPlayed(latestMedia.id)
      setIsMuted(false)
    }
  }, [latestMedia, hasPlayed])

  const handleClose = () => {
    setIsVisible(false)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  if (error) {
    console.error("Realtime player error:", error)
    return null
  }

  if (!isVisible || !latestMedia) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 animate-in slide-in-from-bottom-5">
      <Card className="bg-card border-border shadow-2xl relative">
        <div className="p-4">
          {/* Fixed position buttons */}
          <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="h-8 w-8 bg-background/80 hover:bg-background"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8 bg-background/80 hover:bg-background"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 mb-3 pr-20">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Music className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{latestMedia.song}</h3>
              <p className="text-sm text-muted-foreground truncate">{latestMedia.song_artist}</p>
            </div>
          </div>

          {latestMedia.user_mood && (
            <div className="mb-3">
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                {latestMedia.user_mood}
              </span>
            </div>
          )}

          <div className="relative w-full">
            <iframe
              ref={iframeRef}
              src={`${latestMedia.embed}?autoplay=1${isMuted ? "&muted=1" : ""}`}
              width="100%"
              height="80"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-lg"
            />
          </div>

          {latestMedia.summary && (
            <p className="text-xs text-muted-foreground mt-3 line-clamp-2">
              {latestMedia.summary}
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
