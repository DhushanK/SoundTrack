export const moodColors: Record<string, { bg: string; text: string; border: string }> = {
  anxious: {
    bg: "bg-orange-500/20",
    text: "text-orange-600",
    border: "border-orange-500/40",
  },
  tired: {
    bg: "bg-purple-500/20",
    text: "text-purple-600",
    border: "border-purple-500/40",
  },
  calm: {
    bg: "bg-blue-500/20",
    text: "text-blue-600",
    border: "border-blue-500/40",
  },
  focused: {
    bg: "bg-green-500/20",
    text: "text-green-600",
    border: "border-green-500/40",
  },
  happy: {
    bg: "bg-yellow-500/20",
    text: "text-yellow-600",
    border: "border-yellow-500/40",
  },
  sad: {
    bg: "bg-indigo-500/20",
    text: "text-indigo-600",
    border: "border-indigo-500/40",
  },
  energetic: {
    bg: "bg-red-500/20",
    text: "text-red-600",
    border: "border-red-500/40",
  },
  relaxed: {
    bg: "bg-teal-500/20",
    text: "text-teal-600",
    border: "border-teal-500/40",
  },
}

export function getMoodColors(mood: string) {
  const normalizedMood = mood.toLowerCase().trim()
  return moodColors[normalizedMood] || {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/20",
  }
}
