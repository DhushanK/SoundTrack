"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ClipboardList, Film, Music, Clock, Activity, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { getSpotifyAuthUrl } from "@/lib/spotify"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/questionnaire", label: "Calibration", icon: ClipboardList },
  { href: "/video", label: "Video Playground", icon: Film },
  { href: "/playlist", label: "Playlist", icon: Music },
  { href: "/timeline", label: "Timeline", icon: Clock },
  { href: "/biometrics", label: "Biometrics", icon: Activity },
]

export function Navigation() {
  const pathname = usePathname()

  const handleSpotifyLogin = () => {
    const authUrl = getSpotifyAuthUrl()
    window.open(authUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/60 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow-primary group-hover:scale-110 transition-transform">
              <Music className="w-6 h-6 text-white" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-bold text-xl text-gradient">SoundTrack</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm font-semibold relative overflow-hidden group",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20" />
                    )}
                    <Icon className={cn("w-4 h-4 relative z-10", isActive && "text-primary")} />
                    <span className="hidden lg:inline relative z-10">{item.label}</span>
                    {!isActive && (
                      <div className="absolute inset-0 bg-muted/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </Link>
                )
              })}
            </div>
            <Button
              onClick={handleSpotifyLogin}
              className="bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              Sign in with Spotify
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
