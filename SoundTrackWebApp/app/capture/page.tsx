"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, Square, Camera, Activity, Heart, Gauge, MapPin, Cloud } from "lucide-react"

type CaptureStatus = "idle" | "capturing" | "paused"

interface CaptureData {
  eeg: number
  ecg: number
  imu: number
  images: number
  duration: number
}

export default function CapturePage() {
  const [status, setStatus] = useState<CaptureStatus>("idle")
  const [data, setData] = useState<CaptureData>({
    eeg: 0,
    ecg: 0,
    imu: 0,
    images: 0,
    duration: 0,
  })

  // Simulate real-time data capture
  useEffect(() => {
    if (status !== "capturing") return

    const interval = setInterval(() => {
      setData((prev) => ({
        eeg: Math.min(100, prev.eeg + Math.random() * 5),
        ecg: Math.min(100, prev.ecg + Math.random() * 4),
        imu: Math.min(100, prev.imu + Math.random() * 6),
        images: prev.images + (Math.random() > 0.7 ? 1 : 0),
        duration: prev.duration + 1,
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [status])

  const handleStartStop = () => {
    if (status === "idle" || status === "paused") {
      setStatus("capturing")
    } else {
      setStatus("idle")
      // Reset data when stopping
      setData({
        eeg: 0,
        ecg: 0,
        imu: 0,
        images: 0,
        duration: 0,
      })
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 pt-24 pb-24 md:pt-32 md:pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Data Capture</h1>
            <p className="text-muted-foreground">
              Capture biomedical signals and environmental data to generate your personalized SoundTrack
            </p>
          </div>

          {/* Status Card */}
          <Card className="mb-6 border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Capture Session</CardTitle>
                  <CardDescription>
                    {status === "idle" && "Ready to start capturing"}
                    {status === "capturing" && "Recording in progress..."}
                    {status === "paused" && "Session paused"}
                  </CardDescription>
                </div>
                <Badge
                  variant={status === "capturing" ? "default" : "secondary"}
                  className={status === "capturing" ? "bg-primary animate-pulse" : ""}
                >
                  {status === "idle" && "Idle"}
                  {status === "capturing" && "Recording"}
                  {status === "paused" && "Paused"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Button
                  size="lg"
                  onClick={handleStartStop}
                  className="w-full sm:w-auto gap-2"
                  variant={status === "capturing" ? "destructive" : "default"}
                >
                  {status === "capturing" ? (
                    <>
                      <Square className="w-5 h-5" />
                      Stop Capture
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Start Capture
                    </>
                  )}
                </Button>
                <div className="flex items-center gap-2 text-2xl font-mono font-semibold text-foreground">
                  <span>{formatDuration(data.duration)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Biomedical Data */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">EEG Signal</CardTitle>
                    <CardDescription className="text-xs">Brain Activity</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress value={data.eeg} className="h-2" />
                  <p className="text-sm text-muted-foreground">{data.eeg.toFixed(1)}% captured</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">ECG Signal</CardTitle>
                    <CardDescription className="text-xs">Heart Rate</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress value={data.ecg} className="h-2" />
                  <p className="text-sm text-muted-foreground">{data.ecg.toFixed(1)}% captured</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Gauge className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-base">IMU Data</CardTitle>
                    <CardDescription className="text-xs">Movement</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress value={data.imu} className="h-2" />
                  <p className="text-sm text-muted-foreground">{data.imu.toFixed(1)}% captured</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Environmental Data */}
          <Card>
            <CardHeader>
              <CardTitle>Environmental Data</CardTitle>
              <CardDescription>Images and contextual information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Images</p>
                    <p className="text-2xl font-bold text-foreground">{data.images}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Location</p>
                    <p className="text-sm text-muted-foreground">Tracking</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Cloud className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Weather</p>
                    <p className="text-sm text-muted-foreground">Monitoring</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          {status === "idle" && data.duration > 0 && (
            <Card className="mt-6 border-2 border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle>Session Complete</CardTitle>
                <CardDescription>Your data has been captured successfully</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full sm:w-auto">
                  <a href="/mood">Analyze Mood →</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
