"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ChevronRight, Loader2 } from "lucide-react"

const questions = [
  "You want to lock-in on your homework.",
  "You got back your exam mark and it was lower than expected.",
  "You're hitting the gym.",
  "You just wrapped up a stressful job interview.",
  "You just received a job offer from a company you really like.",
]

export default function QuestionnairePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const totalSteps = 5

  const handleComplete = async () => {
    setIsSubmitting(true)
    try {
      // Format the answers as qa_pairs
      const qa_pairs = questions.map((question, index) => ({
        question,
        answer: answers[index + 1] || "",
      }))

      const response = await fetch("https://htv2025-production.up.railway.app/api/questionnaire/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qa_pairs }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit questionnaire")
      }

      // Redirect to timeline page on success
      router.push("/timeline")
    } catch (error) {
      console.error("Error submitting questionnaire:", error)
      alert("Failed to submit questionnaire. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background gradient-mesh">
      <Navigation />
      <main className="container mx-auto px-4 pt-20 pb-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Calibration</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Imagine you are in the following scenario. What kind of music would you want to listen to?
            </p>
            <div className="flex gap-2 mt-6 max-w-md mx-auto">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} className={`h-2 flex-1 rounded-full transition-all ${i < step ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Question {step} of {totalSteps}
            </p>
          </div>

          <Card className="p-8 bg-card/80 backdrop-blur border-border shadow-xl">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                    You want to lock-in on your homework.
                  </h2>
                  <RadioGroup value={answers[1]} onValueChange={(value) => setAnswers({ ...answers, 1: value })}>
                    <div
                      className="flex items-center space-x-4 p-5 rounded-xl bg-muted/30 hover:bg-primary/10 border-2 border-muted hover:border-primary/40 transition-all cursor-pointer shadow-sm hover:shadow-md"
                      onClick={() => setAnswers({ ...answers, 1: "lofi" })}
                    >
                      <RadioGroupItem value="lofi" id="lofi" className="w-6 h-6 border-2 border-white bg-white pointer-events-none" />
                      <Label htmlFor="lofi" className="flex-1 cursor-pointer text-base font-medium pointer-events-none">
                        🎧 Lo-fi beats or instrumental chillhop
                      </Label>
                    </div>
                    <div
                      className="flex items-center space-x-4 p-5 rounded-xl bg-muted/30 hover:bg-primary/10 border-2 border-muted hover:border-primary/40 transition-all cursor-pointer shadow-sm hover:shadow-md"
                      onClick={() => setAnswers({ ...answers, 1: "classical" })}
                    >
                      <RadioGroupItem value="classical" id="classical" className="w-6 h-6 border-2 border-white bg-white pointer-events-none" />
                      <Label htmlFor="classical" className="flex-1 cursor-pointer text-base font-medium pointer-events-none">
                        🎻 Classical or piano music
                      </Label>
                    </div>
                    <div
                      className="flex items-center space-x-4 p-5 rounded-xl bg-muted/30 hover:bg-primary/10 border-2 border-muted hover:border-primary/40 transition-all cursor-pointer shadow-sm hover:shadow-md"
                      onClick={() => setAnswers({ ...answers, 1: "ambient" })}
                    >
                      <RadioGroupItem value="ambient" id="ambient" className="w-6 h-6 border-2 border-white bg-white pointer-events-none" />
                      <Label htmlFor="ambient" className="flex-1 cursor-pointer text-base font-medium pointer-events-none">
                        🎶 Ambient or focus-enhancing electronic
                      </Label>
                    </div>
                    <div
                      className="flex items-center space-x-4 p-5 rounded-xl bg-muted/30 hover:bg-primary/10 border-2 border-muted hover:border-primary/40 transition-all cursor-pointer shadow-sm hover:shadow-md"
                      onClick={() => setAnswers({ ...answers, 1: "silence" })}
                    >
                      <RadioGroupItem value="silence" id="silence" className="w-6 h-6 border-2 border-white bg-white pointer-events-none" />
                      <Label htmlFor="silence" className="flex-1 cursor-pointer text-base font-medium pointer-events-none">
                        🔇 Silence or white noise (no music)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                    You got back your exam mark and it was lower than expected.
                  </h2>
                  <RadioGroup value={answers[2]} onValueChange={(value) => setAnswers({ ...answers, 2: value })}>
                    <div
                      className="flex items-center space-x-4 p-5 rounded-xl bg-muted/30 hover:bg-primary/10 border-2 border-muted hover:border-primary/40 transition-all cursor-pointer shadow-sm hover:shadow-md"
                      onClick={() => setAnswers({ ...answers, 2: "sad" })}
                    >
                      <RadioGroupItem value="sad" id="sad" className="w-6 h-6 border-2 border-white bg-white pointer-events-none" />
                      <Label htmlFor="sad" className="flex-1 cursor-pointer text-base font-medium pointer-events-none">
                        😔 Sad indie or acoustic to match the mood
                      </Label>
                    </div>
                    <div
                      className="flex items-center space-x-4 p-5 rounded-xl bg-muted/30 hover:bg-primary/10 border-2 border-muted hover:border-primary/40 transition-all cursor-pointer shadow-sm hover:shadow-md"
                      onClick={() => setAnswers({ ...answers, 2: "emo" })}
                    >
                      <RadioGroupItem value="emo" id="emo" className="w-6 h-6 border-2 border-white bg-white pointer-events-none" />
                      <Label htmlFor="emo" className="flex-1 cursor-pointer text-base font-medium pointer-events-none">
                        🎸 Emo rock or alternative to let it all out
                      </Label>
                    </div>
                    <div
                      className="flex items-center space-x-4 p-5 rounded-xl bg-muted/30 hover:bg-primary/10 border-2 border-muted hover:border-primary/40 transition-all cursor-pointer shadow-sm hover:shadow-md"
                      onClick={() => setAnswers({ ...answers, 2: "motivational" })}
                    >
                      <RadioGroupItem value="motivational" id="motivational" className="w-6 h-6 border-2 border-white bg-white pointer-events-none" />
                      <Label htmlFor="motivational" className="flex-1 cursor-pointer text-base font-medium pointer-events-none">
                        🎵 Motivational pop to pick yourself back up
                      </Label>
                    </div>
                    <div
                      className="flex items-center space-x-4 p-5 rounded-xl bg-muted/30 hover:bg-primary/10 border-2 border-muted hover:border-primary/40 transition-all cursor-pointer shadow-sm hover:shadow-md"
                      onClick={() => setAnswers({ ...answers, 2: "calming" })}
                    >
                      <RadioGroupItem value="calming" id="calming" className="w-6 h-6 border-2 border-white bg-white pointer-events-none" />
                      <Label htmlFor="calming" className="flex-1 cursor-pointer text-base font-medium pointer-events-none">
                        🧘♂️ Calming or meditative music to decompress
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6 text-center">You're hitting the gym.</h2>
                  <RadioGroup value={answers[3]} onValueChange={(value) => setAnswers({ ...answers, 3: value })}>
                    <div
                      className="flex items-center space-x-4 p-5 rounded-xl bg-muted/30 hover:bg-primary/10 border-2 border-muted hover:border-primary/40 transition-all cursor-pointer shadow-sm hover:shadow-md"
                      onClick={() => setAnswers({ ...answers, 3: "hiphop" })}
                    >
                      <RadioGroupItem value="hiphop" id="hiphop" className="w-6 h-6 border-2 border-white bg-white pointer-events-none" />
                      <Label htmlFor="hiphop" className="flex-1 cursor-pointer text-base font-medium pointer-events-none">
                        💪 High-energy hip-hop or rap
                      </Label>
                    </div>
                    <div
                      className="flex items-center space-x-4 p-5 rounded-xl bg-muted/30 hover:bg-primary/10 border-2 border-muted hover:border-primary/40 transition-all cursor-pointer shadow-sm hover:shadow-md"
                      onClick={() => setAnswers({ ...answers, 3: "edm" })}
                    >
                      <RadioGroupItem value="edm" id="edm" className="w-6 h-6 border-2 border-white bg-white pointer-events-none" />
                      <Label htmlFor="edm" className="flex-1 cursor-pointer text-base font-medium pointer-events-none">
                        ⚡ EDM or techno with a heavy beat
                      </Label>
                    </div>
                    <div
                      className="flex items-center space-x-4 p-5 rounded-xl bg-muted/30 hover:bg-primary/10 border-2 border-muted hover:border-primary/40 transition-all cursor-pointer shadow-sm hover:shadow-md"
                      onClick={() => setAnswers({ ...answers, 3: "rock" })}
                    >
                      <RadioGroupItem value="rock" id="rock" className="w-6 h-6 border-2 border-white bg-white pointer-events-none" />
                      <Label htmlFor="rock" className="flex-1 cursor-pointer text-base font-medium pointer-events-none">
                        🎸 Rock or metal to get pumped
                      </Label>
                    </div>
                    <div
                      className="flex items-center space-x-4 p-5 rounded-xl bg-muted/30 hover:bg-primary/10 border-2 border-muted hover:border-primary/40 transition-all cursor-pointer shadow-sm hover:shadow-md"
                      onClick={() => setAnswers({ ...answers, 3: "pop" })}
                    >
                      <RadioGroupItem value="pop" id="pop" className="w-6 h-6 border-2 border-white bg-white pointer-events-none" />
                      <Label htmlFor="pop" className="flex-1 cursor-pointer text-base font-medium pointer-events-none">
                        🎧 Upbeat pop or dance anthems
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                    You just wrapped up a stressful job interview.
                  </h2>
                  <RadioGroup value={answers[4]} onValueChange={(value) => setAnswers({ ...answers, 4: value })}>
                    <div
                      className="flex items-center space-x-4 p-5 rounded-xl bg-muted/30 hover:bg-primary/10 border-2 border-muted hover:border-primary/40 transition-all cursor-pointer shadow-sm hover:shadow-md"
                      onClick={() => setAnswers({ ...answers, 4: "chillhop" })}
                    >
                      <RadioGroupItem value="chillhop" id="chillhop" className="w-6 h-6 border-2 border-white bg-white pointer-events-none" />
                      <Label htmlFor="chillhop" className="flex-1 cursor-pointer text-base font-medium pointer-events-none">
                        🌿 Chillhop or jazz to wind down
                      </Label>
                    </div>
                    <div
                      className="flex items-center space-x-4 p-5 rounded-xl bg-muted/30 hover:bg-primary/10 border-2 border-muted hover:border-primary/40 transition-all cursor-pointer shadow-sm hover:shadow-md"
                      onClick={() => setAnswers({ ...answers, 4: "ambient-relax" })}
                    >
                      <RadioGroupItem value="ambient-relax" id="ambient-relax" className="w-6 h-6 border-2 border-white bg-white pointer-events-none" />
                      <Label htmlFor="ambient-relax" className="flex-1 cursor-pointer text-base font-medium pointer-events-none">
                        🧘♀️ Ambient or lo-fi to decompress
                      </Label>
                    </div>
                    <div
                      className="flex items-center space-x-4 p-5 rounded-xl bg-muted/30 hover:bg-primary/10 border-2 border-muted hover:border-primary/40 transition-all cursor-pointer shadow-sm hover:shadow-md"
                      onClick={() => setAnswers({ ...answers, 4: "soft-pop" })}
                    >
                      <RadioGroupItem value="soft-pop" id="soft-pop" className="w-6 h-6 border-2 border-white bg-white pointer-events-none" />
                      <Label htmlFor="soft-pop" className="flex-1 cursor-pointer text-base font-medium pointer-events-none">
                        🎶 Soft pop or indie to relax
                      </Label>
                    </div>
                    <div
                      className="flex items-center space-x-4 p-5 rounded-xl bg-muted/30 hover:bg-primary/10 border-2 border-muted hover:border-primary/40 transition-all cursor-pointer shadow-sm hover:shadow-md"
                      onClick={() => setAnswers({ ...answers, 4: "quiet" })}
                    >
                      <RadioGroupItem value="quiet" id="quiet" className="w-6 h-6 border-2 border-white bg-white pointer-events-none" />
                      <Label htmlFor="quiet" className="flex-1 cursor-pointer text-base font-medium pointer-events-none">
                        🔉 Quiet sounds to reflect
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                    You just received a job offer from a company you really like.
                  </h2>
                  <RadioGroup value={answers[5]} onValueChange={(value) => setAnswers({ ...answers, 5: value })}>
                    <div
                      className="flex items-center space-x-4 p-5 rounded-xl bg-muted/30 hover:bg-primary/10 border-2 border-muted hover:border-primary/40 transition-all cursor-pointer shadow-sm hover:shadow-md"
                      onClick={() => setAnswers({ ...answers, 5: "upbeat" })}
                    >
                      <RadioGroupItem value="upbeat" id="upbeat" className="w-6 h-6 border-2 border-white bg-white pointer-events-none" />
                      <Label htmlFor="upbeat" className="flex-1 cursor-pointer text-base font-medium pointer-events-none">
                        🎉 Upbeat pop or party anthems
                      </Label>
                    </div>
                    <div
                      className="flex items-center space-x-4 p-5 rounded-xl bg-muted/30 hover:bg-primary/10 border-2 border-muted hover:border-primary/40 transition-all cursor-pointer shadow-sm hover:shadow-md"
                      onClick={() => setAnswers({ ...answers, 5: "throwback" })}
                    >
                      <RadioGroupItem value="throwback" id="throwback" className="w-6 h-6 border-2 border-white bg-white pointer-events-none" />
                      <Label htmlFor="throwback" className="flex-1 cursor-pointer text-base font-medium pointer-events-none">
                        🕺 Throwback hits that make you dance
                      </Label>
                    </div>
                    <div
                      className="flex items-center space-x-4 p-5 rounded-xl bg-muted/30 hover:bg-primary/10 border-2 border-muted hover:border-primary/40 transition-all cursor-pointer shadow-sm hover:shadow-md"
                      onClick={() => setAnswers({ ...answers, 5: "happy-indie" })}
                    >
                      <RadioGroupItem value="happy-indie" id="happy-indie" className="w-6 h-6 border-2 border-white bg-white pointer-events-none" />
                      <Label htmlFor="happy-indie" className="flex-1 cursor-pointer text-base font-medium pointer-events-none">
                        🎶 Happy indie or feel-good folk
                      </Label>
                    </div>
                    <div
                      className="flex items-center space-x-4 p-5 rounded-xl bg-muted/30 hover:bg-primary/10 border-2 border-muted hover:border-primary/40 transition-all cursor-pointer shadow-sm hover:shadow-md"
                      onClick={() => setAnswers({ ...answers, 5: "intense" })}
                    >
                      <RadioGroupItem value="intense" id="intense" className="w-6 h-6 border-2 border-white bg-white pointer-events-none" />
                      <Label htmlFor="intense" className="flex-1 cursor-pointer text-base font-medium pointer-events-none">
                        🎧 Intense music as if you're preparing for a challenge
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              )}
              <Button
                className="ml-auto"
                onClick={() => {
                  if (step < totalSteps) {
                    setStep(step + 1)
                  } else {
                    handleComplete()
                  }
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    {step === totalSteps ? "Complete" : "Next"}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
