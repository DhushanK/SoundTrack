"use client"

type MoodState = "analyzing" | 'comple```tsx file="app/mood/page.tsx'
;("use client")

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, Heart, Zap, Smile, Meh, Sparkles } from "lucide-react"

type MoodState = "analyzing" | "complete"
type EmotionType = "happy" | "calm" | "energetic" | "focused" | "relaxed" | "neutral"

interface EmotionScore {
  emotion: EmotionType
  score: number
  color: string
}

interface BiomarkerData {
  label: string
  value: number
  unit: string
  status: "normal" | "elevated" | "low"
}

export default function MoodPage() {
  const [moodState, setMoodState] = useState<MoodState>("analyzing")
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [detectedMood, setDetectedMood] = useState<EmotionType>("neutral")

  const emotionScores: EmotionScore[] = [
    { emotion: "happy", score: 72, color: "bg-yellow-500" },
    { emotion: "calm", score: 85, color: "bg-blue-500" },
    { emotion: "energetic", score: 45, color: "bg-orange-500" },
    { emotion: "focused", score: 68, color: "bg-purple-500" },
    { emotion: "relaxed", score: 78, color: "bg-green-500" },
    { emotion: "neutral", score: 30, color: "bg-gray-500" },
  ]

  const biomarkers: BiomarkerData[] = [
    { label: "Heart Rate Variability", value: 65, unit: "ms", status: "normal" },
    { label: "Alpha Wave Activity", value: 82, unit: "%", status: "elevated" },
    { label: "Beta Wave Activity", value: 45, unit: "%", status: "normal" },
    { label: "Movement Intensity", value: 38, unit: "units", status: "low" },
  ]

  // Simulate analysis process
  useEffect(() => {
    if (moodState === "analyzing") {
      const interval = setInterval(() => {
        setAnalysisProgress((prev) => {
          if (prev >= 100) {
            setMoodState("complete")
            setDetectedMood("calm")
            clearInterval(interval)
            return 100
          }
          return prev + 2
        })
      }, 50)

      return () => clearInterval(interval)
    }
  }, [moodState])

  const getMoodIcon = (mood: EmotionType) => {
    switch (mood) {
      case "happy":
        return <Smile className="w-8 h-8" />
      case "calm":
      case "relaxed":
        return <Heart className="w-8 h-8" />
      case "energetic":
        return <Zap className="w-8 h-8" />
      case "focused":
        return <Brain className="w-8 h-8" />
      default:
        return <Meh className="w-8 h-8" />
    }
  }

  const getMoodDescription = (mood: EmotionType) => {
    const descriptions = {
      happy: "Your biomedical data indicates a positive and uplifted emotional state",
      calm: "Your signals show a peaceful and tranquil state of mind",
      energetic: "High activity levels detected, you're feeling dynamic and active",
      focused: "Strong concentration patterns detected in your brain activity",
      relaxed: "Your body is in a restful and comfortable state",
      neutral: "Balanced emotional state with no strong indicators",
    }
    return descriptions[mood]
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 pt-24 pb-24 md:pt-32 md:pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Mood Analysis</h1>
            <p className="text-muted-foreground">AI-powered emotion detection from your biomedical data</p>
          </div>

          {/* Analysis Progress */}
          {moodState === "analyzing" && (
            <Card className="mb-6 border-2 border-primary/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                  <CardTitle>Analyzing Your Data</CardTitle>
                </div>
                <CardDescription>Processing biomedical signals and environmental context...</CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={analysisProgress} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2">{analysisProgress}% complete</p>
              </CardContent>
            </Card>
          )}

          {/* Detected Mood */}
          {moodState === "complete" && (
            <>
              <Card className="mb-6 border-2 border-primary/50 bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardHeader>
                  <CardTitle>Detected Mood</CardTitle>
                  <CardDescription>Based on your biomedical and environmental data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      {getMoodIcon(detectedMood)}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-2xl font-bold text-foreground capitalize mb-2">{detectedMood}</h3>
                      <p className="text-muted-foreground">{getMoodDescription(detectedMood)}</p>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">
                      {emotionScores.find((e) => e.emotion === detectedMood)?.score}% Confidence
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Emotion Breakdown */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Emotion Breakdown</CardTitle>
                  <CardDescription>Detailed analysis of all detected emotions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {emotionScores
                      .sort((a, b) => b.score - a.score)
                      .map((emotion) => (
                        <div key={emotion.emotion} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground capitalize">{emotion.emotion}</span>
                            <span className="text-sm text-muted-foreground">{emotion.score}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full ${emotion.color}`} style={{ width: `${emotion.score}%` }} />
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Biomarker Data */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Biomarker Analysis</CardTitle>
                  <CardDescription>Processed signals from your biomedical data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {biomarkers.map((marker) => (
                      <div key={marker.label} className="p-4 rounded-lg border border-border bg-card">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm font-medium text-foreground">{marker.label}</p>
                          <Badge
                            variant={marker.status === "normal" ? "secondary" : "default"}
                            className={
                              marker.status === "elevated"
                                ? "bg-orange-500 text-white"
                                : marker.status === "low"
                                  ? "bg-blue-500 text-white"
                                  : ""
                            }
                          >
                            {marker.status}
                          </Badge>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-foreground">{marker.value}</span>
                          <span className="text-sm text-muted-foreground">{marker.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card className="border-2 border-secondary/50 bg-secondary/5">
                <CardHeader>
                  <CardTitle>Ready for Music</CardTitle>
                  <CardDescription>Get personalized song recommendations based on your mood</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full sm:w-auto">
                    <a href="/music">Generate Playlist →</a>
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
