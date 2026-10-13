import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { DataProvider } from "@/contexts/DataContext"
import { RealtimePlayer } from "@/components/realtime-player"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "SoundTrack to Your Life",
  description: "Generate personalized soundtracks based on your biomedical and environmental data",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${spaceGrotesk.variable} ${inter.variable}`}>
        <DataProvider>
          <Suspense fallback={<div>Loading...</div>}>
            {children}
            <RealtimePlayer />
            <Analytics />
          </Suspense>
        </DataProvider>
      </body>
    </html>
  )
}
