"use client"
import useSWR from "swr"

interface Song {
  id: string
  title: string
  artist: string
  album: string
  duration: string
  matchScore: number
  mood: string
  imageUrl: string
  spotifyUrl?: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useSpotifyRecommendations(mood: string, genres?: string[]) {
  const genresParam = genres?.join(",") || "ambient,classical,electronic"
  const { data, error, isLoading } = useSWR(`/api/recommendations?mood=${mood}&genres=${genresParam}`, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  return {
    recommendations: data?.recommendations as Song[] | undefined,
    isLoading,
    error,
  }
}

export function useSpotifySearch(query: string) {
  const { data, error, isLoading } = useSWR(query ? `/api/search?q=${encodeURIComponent(query)}` : null, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  return {
    results: data?.results as Song[] | undefined,
    isLoading,
    error,
  }
}
