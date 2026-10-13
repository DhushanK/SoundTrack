"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { ClipboardList, Film, Music, Clock, Activity, ArrowRight, Sparkles } from "lucide-react"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background gradient-mesh relative overflow-hidden">
      <Navigation />

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/4 w-96 h-96 rounded-full bg-primary/20 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-1/4 w-[32rem] h-[32rem] rounded-full bg-accent/15 blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-1/3 left-1/3 w-[28rem] h-[28rem] rounded-full bg-secondary/15 blur-3xl animate-pulse delay-500" />
      </div>

      <main className="container relative mx-auto px-4 pt-20 pb-12">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-20 mt-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Your Personal Music Journey</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance leading-tight">
            <span className="text-gradient">SoundTrack</span>
            <br />
            <span className="text-foreground">to Your Life</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 text-pretty max-w-2xl mx-auto">
            Generate personalized soundtracks based on your daily activities, mood, and biometric data
          </p>
          <Button size="lg" className="gradient-primary glow-primary hover:scale-105 transition-transform text-white font-semibold px-8 h-12" onClick={() => router.push("/questionnaire")}>
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          <Card
            className="group p-8 gradient-card border-border/50 hover:card-glow-hover transition-all duration-300 cursor-pointer backdrop-blur-sm hover:scale-[1.02]"
            onClick={() => router.push("/questionnaire")}
          >
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-5 group-hover:glow-primary transition-all">
              <ClipboardList className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-gradient transition-all">Calibration</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Answer questions about your day, activities, and how you're feeling
            </p>
          </Card>

          <Card
            className="group p-8 gradient-card border-border/50 hover:card-glow-hover transition-all duration-300 cursor-pointer backdrop-blur-sm hover:scale-[1.02]"
            onClick={() => router.push("/video")}
          >
            <div className="w-14 h-14 rounded-2xl gradient-secondary flex items-center justify-center mb-5 group-hover:glow-secondary transition-all">
              <Film className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-gradient transition-all">Video Playground</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Create and edit videos with an intuitive timeline interface</p>
          </Card>

          <Card
            className="group p-8 gradient-card border-border/50 hover:card-glow-hover transition-all duration-300 cursor-pointer backdrop-blur-sm hover:scale-[1.02]"
            onClick={() => router.push("/playlist")}
          >
            <div className="w-14 h-14 rounded-2xl gradient-accent flex items-center justify-center mb-5 group-hover:glow-accent transition-all">
              <Music className="w-7 h-7 text-background" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-gradient-alt transition-all">Your Playlist</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Discover songs matched to your mood and daily activities</p>
          </Card>

          <Card
            className="group p-8 gradient-card border-border/50 hover:card-glow-hover transition-all duration-300 cursor-pointer backdrop-blur-sm hover:scale-[1.02]"
            onClick={() => router.push("/timeline")}
          >
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-5 group-hover:glow-primary transition-all">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-gradient transition-all">Daily Timeline</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">View your day hour by hour with songs and summaries</p>
          </Card>

          <Card
            className="group p-8 gradient-card border-border/50 hover:card-glow-hover transition-all duration-300 cursor-pointer backdrop-blur-sm hover:scale-[1.02]"
            onClick={() => router.push("/biometrics")}
          >
            <div className="w-14 h-14 rounded-2xl gradient-secondary flex items-center justify-center mb-5 group-hover:glow-secondary transition-all">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-gradient transition-all">Biometrics</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Track your heart rate and mood data throughout the day</p>
          </Card>
        </div>
      </main>
    </div>
  )
}
