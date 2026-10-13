"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, Loader2, Play } from "lucide-react"
import { getMoodColors } from "@/lib/mood-colors"
import { useData } from "@/contexts/DataContext"

export default function PlaylistPage() {
  const { mediaData, isLoading } = useData()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-20 pb-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Your Playlist</h1>
            <p className="text-muted-foreground">Songs matched to your mood and activities</p>
          </div>
          <div className="flex gap-3">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Play className="w-5 h-5 mr-2" />
              Play All
            </Button>
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Download className="w-5 h-5 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {mediaData.map((item) => {
            const timestamp = new Date(item.created_at).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              timeZone: "America/New_York",
            })

            const moodColors = getMoodColors(item.user_mood)

            return (
              <Card key={item.id} className="p-6 bg-card border-border">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-primary">{timestamp}</span>
                      <span className={`text-sm px-3 py-1.5 rounded-full ${moodColors.bg} ${moodColors.text} border ${moodColors.border} font-semibold`}>
                        {item.user_mood}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-foreground mb-2">
                      {item.song} • {item.song_artist}
                    </h3>
                    <p className="text-sm text-muted-foreground">{item.summary}</p>
                  </div>
                </div>
                <div className="relative w-full h-20 rounded-lg overflow-hidden">
                  <iframe
                    src={item.embed}
                    width="100%"
                    height="80"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="rounded-lg"
                  />
                </div>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
