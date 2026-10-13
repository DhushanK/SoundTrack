"use client"

import { useEffect, useState } from "react"
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface MediaDocument {
  id: string
  song: string
  song_artist: string
  embed: string
  created_at: string
  user_mood?: string
  summary?: string
}

export function useLatestMedia() {
  const [latestMedia, setLatestMedia] = useState<MediaDocument | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      // Query to get the most recent media document
      // Listen to documents ordered by created_at to catch updates
      const mediaQuery = query(
        collection(db, "media"),
        orderBy("created_at", "desc"),
        limit(1)
      )

      // Set up realtime listener - this triggers on both new docs AND updates to existing docs
      const unsubscribe = onSnapshot(
        mediaQuery,
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added" || change.type === "modified") {
              const data = change.doc.data()

              // Only update if song data exists (backend has processed it)
              if (data.song && data.song_artist && data.embed) {
                setLatestMedia({
                  id: change.doc.id,
                  song: data.song,
                  song_artist: data.song_artist,
                  embed: data.embed,
                  created_at: data.created_at || "",
                  user_mood: data.user_mood,
                  summary: data.summary,
                })
              }
            }
          })
        },
        (err) => {
          console.error("Error listening to media updates:", err)
          setError(err.message)
        }
      )

      // Cleanup listener on unmount
      return () => unsubscribe()
    } catch (err) {
      console.error("Error setting up media listener:", err)
      setError(err instanceof Error ? err.message : "Failed to setup listener")
    }
  }, [])

  return { latestMedia, error }
}
