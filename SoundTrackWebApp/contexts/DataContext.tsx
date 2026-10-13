"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface MediaItem {
  id: string
  type: string
  storage_url: string
  thumb_url: string | null
  summary: string
  mood: string
  song: string
  song_artist: string
  embed: string
  user_mood: string
  created_at: string
  ts: string
}

export interface BiometricData {
  id: string
  timestamp: string
  heart_rate: number
  steps: number
  calories: number
  sleep_hours: number
}

type GenerationState = "idle" | "generating" | "complete"

interface VideoGenerationState {
  state: GenerationState
  progress: number
  videoUrl: string | null
}

interface DataContextType {
  mediaData: MediaItem[]
  biometricData: BiometricData[]
  isLoading: boolean
  error: string | null
  refetchData: () => Promise<void>
  videoGeneration: VideoGenerationState
  setVideoGeneration: (state: VideoGenerationState) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [mediaData, setMediaData] = useState<MediaItem[]>([])
  const [biometricData, setBiometricData] = useState<BiometricData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [videoGeneration, setVideoGeneration] = useState<VideoGenerationState>({
    state: "idle",
    progress: 0,
    videoUrl: null,
  })

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch media and biometrics in parallel
      const [mediaResponse, biometricResponse] = await Promise.all([
        fetch("https://htv2025-production.up.railway.app/api/media/ordered/created-at"),
        fetch("https://htv2025-production.up.railway.app/api/biometric/").catch(() => null),
      ])

      if (!mediaResponse.ok) {
        throw new Error("Failed to fetch media data")
      }

      const media: MediaItem[] = await mediaResponse.json()
      setMediaData(media)

      // Biometric data is optional
      if (biometricResponse && biometricResponse.ok) {
        const biometric: BiometricData[] = await biometricResponse.json()
        console.log('Raw biometric data from API:', biometric)
        setBiometricData(biometric)
      }
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const refetchData = async () => {
    await fetchData()
  }

  return (
    <DataContext.Provider
      value={{ mediaData, biometricData, isLoading, error, refetchData, videoGeneration, setVideoGeneration }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
