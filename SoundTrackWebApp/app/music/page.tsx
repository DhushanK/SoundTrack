"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, SkipForward, Heart, Save, Clock, Music2, TrendingUp } from "lucide-react"

interface Song {
  id: string
  title: string
  artist: string
  album: string
  duration: string
  matchScore: number
  mood: string
  imageUrl: string
}

interface Playlist {
  id: string
  name: string
  date: string
  mood: string
  songCount: number
}

export default function MusicPage() {
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set())

  const recommendedSongs: Song[] = [
    {
      id: "1",
      title: "Weightless",
      artist: "Marconi Union",
      album: "Weightless",
      duration: "8:09",
      matchScore: 95,
      mood: "Calm",
      imageUrl: "/calm-music-album.jpg",
    },
    {
      id: "2",
      title: "Clair de Lune",
      artist: "Claude Debussy",
      album: "Suite Bergamasque",
      duration: "5:03",
      matchScore: 92,
      mood: "Calm",
      imageUrl: "/classical-piano-album.jpg",
    },
    {
      id: "3",
      title: "Breathe",
      artist: "Telepopmusik",
      album: "Genetic World",
      duration: "4:42",
      matchScore: 88,
      mood: "Relaxed",
      imageUrl: "/electronic-chill-album.jpg",
    },
    {
      id: "4",
      title: "Sunset Lover",
      artist: "Petit Biscuit",
      album: "Petit Biscuit",
      duration: "3:44",
      matchScore: 85,
      mood: "Calm",
      imageUrl: "/sunset-music-album.jpg",
    },
    {
      id: "5",
      title: "River Flows in You",
      artist: "Yiruma",
      album: "First Love",
      duration: "3:37",
      matchScore: 83,
      mood: "Peaceful",
      imageUrl: "/piano-peaceful-album.jpg",
    },
  ]

  const savedPlaylists: Playlist[] = [
    { id: "1", name: "Morning Calm", date: "2025-01-08", mood: "Calm", songCount: 12 },
    { id: "2", name: "Afternoon Energy", date: "2025-01-07", mood: "Energetic", songCount: 15 },
    { id: "3", name: "Evening Relaxation", date: "2025-01-06", mood: "Relaxed", songCount: 10 },
  ]

  const handlePlayPause = (song: Song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying)
    } else {
      setCurrentSong(song)
      setIsPlaying(true)
    }
  }

  const toggleLike = (songId: string) => {
    setLikedSongs((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(songId)) {
        newSet.delete(songId)
      } else {
        newSet.add(songId)
      }
      return newSet
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 pt-24 pb-32 md:pt-32 md:pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Your SoundTrack</h1>
            <p className="text-muted-foreground">
              Personalized music recommendations based on your mood and preferences
            </p>
          </div>

          <Tabs defaultValue="recommended" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="recommended">Recommended</TabsTrigger>
              <TabsTrigger value="playlists">My Playlists</TabsTrigger>
            </TabsList>

            {/* Recommended Tab */}
            <TabsContent value="recommended" className="space-y-6">
              {/* Current Mood Match */}
              <Card className="border-2 border-primary/50 bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <CardTitle>Mood Match</CardTitle>
                  </div>
                  <CardDescription>Songs perfectly matched to your current calm state</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Badge className="bg-primary text-primary-foreground">Calm</Badge>
                    <span className="text-sm text-muted-foreground">{recommendedSongs.length} songs recommended</span>
                  </div>
                </CardContent>
              </Card>

              {/* Song List */}
              <div className="space-y-3">
                {recommendedSongs.map((song) => (
                  <Card key={song.id} className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Album Art */}
                        <div className="relative flex-shrink-0">
                          <img
                            src={song.imageUrl || "/placeholder.svg"}
                            alt={song.album}
                            className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover"
                          />
                          {currentSong?.id === song.id && isPlaying && (
                            <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                              <Music2 className="w-6 h-6 text-white animate-pulse" />
                            </div>
                          )}
                        </div>

                        {/* Song Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{song.title}</h3>
                          <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {song.matchScore}% match
                            </Badge>
                            <span className="text-xs text-muted-foreground">{song.duration}</span>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => toggleLike(song.id)}
                            className={likedSongs.has(song.id) ? "text-red-500" : ""}
                          >
                            <Heart className={`w-5 h-5 ${likedSongs.has(song.id) ? "fill-current" : ""}`} />
                          </Button>
                          <Button
                            size="icon"
                            variant={currentSong?.id === song.id && isPlaying ? "default" : "outline"}
                            onClick={() => handlePlayPause(song)}
                          >
                            {currentSong?.id === song.id && isPlaying ? (
                              <Pause className="w-5 h-5" />
                            ) : (
                              <Play className="w-5 h-5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Save Playlist */}
              <Card className="border-2 border-secondary/50 bg-secondary/5">
                <CardHeader>
                  <CardTitle>Save This Playlist</CardTitle>
                  <CardDescription>Keep these recommendations for later</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full sm:w-auto gap-2">
                    <Save className="w-4 h-4" />
                    Save Playlist
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Playlists Tab */}
            <TabsContent value="playlists" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Saved Playlists</CardTitle>
                  <CardDescription>Your previously generated soundtracks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {savedPlaylists.map((playlist) => (
                      <div
                        key={playlist.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Music2 className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{playlist.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{playlist.date}</span>
                              <span>•</span>
                              <span>{playlist.songCount} songs</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{playlist.mood}</Badge>
                          <Button size="icon" variant="outline">
                            <Play className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Now Playing Bar */}
      {currentSong && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-40">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center gap-4">
              <img
                src={currentSong.imageUrl || "/placeholder.svg"}
                alt={currentSong.album}
                className="w-12 h-12 rounded-lg"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{currentSong.title}</p>
                <p className="text-sm text-muted-foreground truncate">{currentSong.artist}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" onClick={() => toggleLike(currentSong.id)}>
                  <Heart className={`w-5 h-5 ${likedSongs.has(currentSong.id) ? "fill-current text-red-500" : ""}`} />
                </Button>
                <Button size="icon" variant="outline" onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                <Button size="icon" variant="ghost">
                  <SkipForward className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
