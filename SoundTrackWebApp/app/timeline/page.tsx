"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Music, Loader2, Play } from "lucide-react"
import { Input } from "@/components/ui/input"
import { getMoodColors } from "@/lib/mood-colors"
import { useData } from "@/contexts/DataContext"

export default function TimelinePage() {
  const { mediaData, isLoading } = useData()
  const [startDateTime, setStartDateTime] = useState("")
  const [endDateTime, setEndDateTime] = useState("")
  const [playingId, setPlayingId] = useState<string | null>(null)

  useEffect(() => {
    // Set default start and end dates: Oct 3 12AM to Oct 6 12AM EST
    const startDate = new Date('2025-10-03T00:00:00-04:00') // Oct 3, 2025 12:00 AM EST
    const endDate = new Date('2025-10-06T00:00:00-04:00')   // Oct 6, 2025 12:00 AM EST

    setStartDateTime(startDate.toISOString().slice(0, 16))
    setEndDateTime(endDate.toISOString().slice(0, 16))
  }, [])

  const filteredData = mediaData.filter((item) => {
    if (!startDateTime || !endDateTime) return true

    const itemDate = new Date(item.created_at)
    const start = new Date(startDateTime)
    const end = new Date(endDateTime)

    return itemDate >= start && itemDate <= end
  })

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
      <main className="container mx-auto px-4 pt-20 pb-12">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-foreground mb-3">Timeline</h1>
          <p className="text-muted-foreground text-lg">Your moments in music and memories</p>
        </div>

        <Card className="p-6 bg-card border-border mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="start-datetime" className="text-sm mb-3 block font-semibold">
                Start Date & Time
              </Label>
              <Input
                id="start-datetime"
                type="datetime-local"
                value={startDateTime}
                onChange={(e) => setStartDateTime(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="end-datetime" className="text-sm mb-3 block font-semibold">
                End Date & Time
              </Label>
              <Input
                id="end-datetime"
                type="datetime-local"
                value={endDateTime}
                onChange={(e) => setEndDateTime(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </Card>

        <div className="relative max-w-6xl mx-auto">
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-primary/30 -translate-x-1/2" />

          <div className="space-y-16">
            {filteredData.map((item, index) => {
              const isLeft = index % 2 === 0
              const timestamp = new Date(item.created_at).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                timeZone: "America/New_York",
              })

              // Truncate summary to 150 characters
              const truncatedSummary =
                item.summary.length > 150 ? item.summary.substring(0, 150) + "..." : item.summary

              const moodColors = getMoodColors(item.user_mood)

              return (
                <div key={item.id} className="relative">
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 flex flex-col items-center z-10">
                    <div className="w-5 h-5 rounded-full bg-primary border-4 border-background shadow-lg shadow-primary/50" />
                    <span className="text-base font-bold text-foreground mt-3 bg-card px-4 py-2 rounded-lg border border-border">
                      {timestamp}
                    </span>
                  </div>

                  <div className={`flex ${isLeft ? "justify-start pr-[56%]" : "justify-end pl-[56%]"}`}>
                    <Card className="p-6 bg-card border-border w-full hover:border-primary/50 transition-colors">
                      <div className="flex gap-5 mb-4">
                        <div className="w-28 h-28 rounded-lg overflow-hidden flex-shrink-0 border-2 border-primary/20">
                          <img
                            src={item.storage_url || "/placeholder.svg"}
                            alt={item.song}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <span className={`text-xs px-3 py-1 rounded-full ${moodColors.bg} ${moodColors.text} border ${moodColors.border} font-semibold inline-block mb-2`}>
                                {item.user_mood}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              className="bg-primary text-primary-foreground hover:bg-primary/90"
                              onClick={() => setPlayingId(playingId === item.id ? null : item.id)}
                            >
                              <Play className="w-4 h-4 mr-1" />
                              {playingId === item.id ? "Hide" : "Play"}
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{truncatedSummary}</p>
                          <div className="flex items-center gap-3 text-sm">
                            <Music className="w-5 h-5 text-primary flex-shrink-0" />
                            <span className="text-foreground font-medium">
                              {item.song} • {item.song_artist}
                            </span>
                          </div>
                        </div>
                      </div>
                      {playingId === item.id && (
                        <div className="w-full">
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
                      )}
                    </Card>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
