"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, Download, X, Loader2, Trash2, RefreshCw } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { getMoodColors } from "@/lib/mood-colors"
import { useData } from "@/contexts/DataContext"

interface ImageItem {
  id: string
  url: string
  timestamp: string
}

export default function VideoPage() {
  const { mediaData, isLoading, videoGeneration, setVideoGeneration, refetchData } = useData()
  const [timelineImages, setTimelineImages] = useState<ImageItem[]>([])
  const [previousVideos, setPreviousVideos] = useState<Array<{ id: string; url: string; date: string }>>([])
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    // Convert media data to timeline images
    const images: ImageItem[] = mediaData.map((item) => ({
      id: item.id,
      url: item.storage_url,
      timestamp: new Date(item.created_at).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "America/New_York",
      }),
    }))

    setTimelineImages(images)
  }, [mediaData])

  const removeFromTimeline = (id: string) => {
    setTimelineImages((prev) => prev.filter((img) => img.id !== id))
    setSelectedImages((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const toggleSelection = (id: string) => {
    setSelectedImages((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const deleteSelected = () => {
    setTimelineImages((prev) => prev.filter((img) => !selectedImages.has(img.id)))
    setSelectedImages(new Set())
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newImages = [...timelineImages]
    const draggedImage = newImages[draggedIndex]
    newImages.splice(draggedIndex, 1)
    newImages.splice(index, 0, draggedImage)

    setTimelineImages(newImages)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const generateVideo = async () => {
    setVideoGeneration({ state: "generating", progress: 0, videoUrl: null })

    try {
      // Extract media IDs from timelineImages
      const mediaIds = timelineImages.map((image) => image.id)

      // Call the video generation API
      const response = await fetch("https://htv2025-production.up.railway.app/api/video/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          media_ids: mediaIds,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate video")
      }

      const data = await response.json()

      // Simulate progress for better UX
      const interval = setInterval(() => {
        setVideoGeneration((prev) => {
          if (prev.progress >= 100) {
            clearInterval(interval)
            const videoUrl = data.video_url || data.url || "/video-thumb-today.jpg"
            setPreviousVideos((prev) => [
              {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                url: videoUrl,
                date: new Date().toLocaleDateString(),
              },
              ...prev,
            ])
            return { state: "complete", progress: 100, videoUrl }
          }
          return { ...prev, progress: prev.progress + 5 }
        })
      }, 200)
    } catch (error) {
      console.error("Error generating video:", error)
      setVideoGeneration({ state: "idle", progress: 0, videoUrl: null })
    }
  }

  const resetVideo = () => {
    setVideoGeneration({ state: "idle", progress: 0, videoUrl: null })
    setSelectedImages(new Set())
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetchData()
    setIsRefreshing(false)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <main className="flex-1 flex flex-col pt-14">
        {videoGeneration.state === "generating" && (
          <div className="flex-1 flex items-center justify-center p-8">
            <Card className="p-12 bg-card border-border max-w-md w-full">
              <div className="text-center">
                <Loader2 className="w-20 h-20 text-primary animate-spin mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-foreground mb-3">Generating Video</h2>
                <p className="text-muted-foreground mb-8">Processing your SoundTrack...</p>
                <Progress value={videoGeneration.progress} className="mb-3 h-3" />
                <p className="text-lg font-semibold text-primary">{videoGeneration.progress}%</p>
              </div>
            </Card>
          </div>
        )}

        {videoGeneration.state === "complete" && videoGeneration.videoUrl && (
          <div className="flex-1 p-8">
            <div className="max-w-5xl mx-auto">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-4xl font-bold text-foreground">Video Ready</h2>
                <div className="flex gap-3">
                  <Button onClick={resetVideo} variant="outline" size="lg">
                    Create New
                  </Button>
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Download className="w-5 h-5 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              <Card className="p-6 bg-card border-border mb-12">
                <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                  <video
                    src={videoGeneration.videoUrl || ""}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </Card>
            </div>
          </div>
        )}

        {videoGeneration.state === "idle" && (
          <>
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex items-start justify-between">
                  <div>
                    <h2 className="text-4xl font-bold text-foreground mb-2">Video Playground</h2>
                    <p className="text-muted-foreground text-lg">Remove any images you don't want in your video</p>
                  </div>
                  <Button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    variant="outline"
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
                    Refresh Media
                  </Button>
                </div>

                <div className="grid grid-cols-5 gap-6">
                  {timelineImages.map((image) => {
                    const mediaItem = mediaData.find((item) => item.id === image.id)
                    const truncatedSummary =
                      mediaItem && mediaItem.summary.length > 100
                        ? mediaItem.summary.substring(0, 100) + "..."
                        : mediaItem?.summary || ""

                    const moodColors = mediaItem ? getMoodColors(mediaItem.user_mood) : null

                    return (
                      <div
                        key={image.id}
                        className="relative aspect-square rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-colors group"
                      >
                        <img
                          src={image.url || "/placeholder.svg"}
                          alt={image.timestamp}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeFromTimeline(image.id)}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:scale-110 z-10"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        {/* Hover overlay with emotion and summary */}
                        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-center">
                          {mediaItem && moodColors && (
                            <>
                              <span className={`text-xs px-2 py-1 rounded-full ${moodColors.bg} ${moodColors.text} border ${moodColors.border} font-semibold inline-block mb-3 w-fit`}>
                                {mediaItem.user_mood}
                              </span>
                              <p className="text-xs text-white leading-relaxed">{truncatedSummary}</p>
                            </>
                          )}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                          <p className="text-sm font-medium text-white">{image.timestamp}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="border-t-2 border-border bg-card">
              <div className="container mx-auto px-8 py-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Timeline</h2>
                    <p className="text-sm text-muted-foreground">
                      {timelineImages.length} {timelineImages.length === 1 ? "image" : "images"} total
                      {selectedImages.size > 0 && ` • ${selectedImages.size} selected`}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    {selectedImages.size > 0 && (
                      <Button
                        onClick={deleteSelected}
                        variant="destructive"
                        size="lg"
                      >
                        <Trash2 className="w-5 h-5 mr-2" />
                        Delete Selected
                      </Button>
                    )}
                    <Button
                      onClick={generateVideo}
                      disabled={timelineImages.length === 0}
                      size="lg"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Generate Video
                    </Button>
                  </div>
                </div>

                <div className="relative bg-muted/50 rounded-lg p-4 overflow-x-auto min-h-[120px] border border-border">
                  {timelineImages.length === 0 ? (
                    <div className="flex items-center justify-center h-24 text-muted-foreground">
                      All images removed. Add some back to generate a video.
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      {timelineImages.map((image, index) => {
                        const isSelected = selectedImages.has(image.id)
                        return (
                          <div
                            key={`${image.id}-${index}`}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            onClick={() => toggleSelection(image.id)}
                            className={`relative h-24 w-36 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer select-none ${
                              isSelected
                                ? "border-primary shadow-lg shadow-primary/30 scale-105"
                                : "border-primary/50 hover:border-primary"
                            } ${draggedIndex === index ? "opacity-50" : ""}`}
                          >
                            <img
                              src={image.url || "/placeholder.svg"}
                              alt={image.timestamp}
                              className="w-full h-full object-cover pointer-events-none"
                              draggable={false}
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                  <svg
                                    className="w-4 h-4 text-white"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path d="M5 13l4 4L19 7"></path>
                                  </svg>
                                </div>
                              </div>
                            )}
                            <div className="absolute bottom-2 left-2 right-2">
                              <div className="text-xs font-semibold text-white bg-black/70 px-2 py-1 rounded">
                                {image.timestamp}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
