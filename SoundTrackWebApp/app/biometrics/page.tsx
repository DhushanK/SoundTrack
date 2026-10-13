"use client"

import { Navigation } from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { Activity, Brain, Zap, Loader2, AlertCircle, Moon, Waves, Target, AlertTriangle } from "lucide-react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useBiometricData } from "@/hooks/use-biometric-data"
import { useData } from "@/contexts/DataContext"

const eegData = [
  { time: "6:00", alpha: 8.2, beta: 15.3, theta: 5.1, delta: 2.3 },
  { time: "7:00", alpha: 9.1, beta: 16.2, theta: 4.8, delta: 2.1 },
  { time: "8:00", alpha: 10.5, beta: 18.1, theta: 4.2, delta: 1.9 },
  { time: "9:00", alpha: 11.2, beta: 20.5, theta: 3.8, delta: 1.7 },
  { time: "10:00", alpha: 10.8, beta: 19.8, theta: 4.0, delta: 1.8 },
  { time: "11:00", alpha: 9.5, beta: 17.2, theta: 4.5, delta: 2.0 },
  { time: "12:00", alpha: 8.8, beta: 15.8, theta: 5.0, delta: 2.2 },
  { time: "13:00", alpha: 9.2, beta: 16.5, theta: 4.7, delta: 2.1 },
  { time: "14:00", alpha: 10.1, beta: 18.9, theta: 4.1, delta: 1.9 },
  { time: "15:00", alpha: 11.0, beta: 20.2, theta: 3.9, delta: 1.8 },
  { time: "16:00", alpha: 10.3, beta: 18.5, theta: 4.3, delta: 1.9 },
  { time: "17:00", alpha: 9.0, beta: 16.0, theta: 4.8, delta: 2.1 },
  { time: "18:00", alpha: 8.5, beta: 14.5, theta: 5.2, delta: 2.3 },
  { time: "19:00", alpha: 7.8, beta: 13.2, theta: 5.5, delta: 2.5 },
  { time: "20:00", alpha: 7.2, beta: 12.0, theta: 5.8, delta: 2.7 },
  { time: "21:00", alpha: 6.5, beta: 10.5, theta: 6.2, delta: 3.0 },
]

const ecgData = [
  { time: "6:00", bpm: 65, hrv: 45 },
  { time: "7:00", bpm: 72, hrv: 42 },
  { time: "8:00", bpm: 68, hrv: 48 },
  { time: "9:00", bpm: 70, hrv: 46 },
  { time: "10:00", bpm: 75, hrv: 40 },
  { time: "11:00", bpm: 73, hrv: 43 },
  { time: "12:00", bpm: 68, hrv: 47 },
  { time: "13:00", bpm: 71, hrv: 45 },
  { time: "14:00", bpm: 76, hrv: 39 },
  { time: "15:00", bpm: 74, hrv: 41 },
  { time: "16:00", bpm: 72, hrv: 44 },
  { time: "17:00", bpm: 69, hrv: 46 },
  { time: "18:00", bpm: 66, hrv: 49 },
  { time: "19:00", bpm: 64, hrv: 51 },
  { time: "20:00", bpm: 62, hrv: 53 },
  { time: "21:00", bpm: 60, hrv: 55 },
]

const focusData = [
  { time: "6:00", focus: 45 },
  { time: "7:00", focus: 52 },
  { time: "8:00", focus: 65 },
  { time: "9:00", focus: 78 },
  { time: "10:00", focus: 82 },
  { time: "11:00", focus: 75 },
  { time: "12:00", focus: 60 },
  { time: "13:00", focus: 55 },
  { time: "14:00", focus: 70 },
  { time: "15:00", focus: 80 },
  { time: "16:00", focus: 72 },
  { time: "17:00", focus: 58 },
  { time: "18:00", focus: 45 },
  { time: "19:00", focus: 38 },
  { time: "20:00", focus: 30 },
  { time: "21:00", focus: 25 },
]

const happinessData = [
  { time: "6:00", happiness: 60 },
  { time: "7:00", happiness: 65 },
  { time: "8:00", happiness: 70 },
  { time: "9:00", happiness: 75 },
  { time: "10:00", happiness: 72 },
  { time: "11:00", happiness: 68 },
  { time: "12:00", happiness: 78 },
  { time: "13:00", happiness: 74 },
  { time: "14:00", happiness: 70 },
  { time: "15:00", happiness: 82 },
  { time: "16:00", happiness: 80 },
  { time: "17:00", happiness: 75 },
  { time: "18:00", happiness: 85 },
  { time: "19:00", happiness: 88 },
  { time: "20:00", happiness: 90 },
  { time: "21:00", happiness: 92 },
]

export default function BiometricsPage() {
  const { data, loading, error } = useBiometricData()
  const { mediaData } = useData()

  // Use API data if available, otherwise fall back to mock data
  // Limit all data to last 50 points for better performance and readability
  const currentEegData = (data?.eegData || eegData).slice(-50)
  const currentEcgData = (data?.ecgData || ecgData).slice(-50)
  const currentFocusData = (data?.focusData || focusData).slice(-50)
  const currentHappinessData = (data?.happinessData || happinessData).slice(-50)
  const currentChannelVoltageData = (data?.channelVoltageData || []).slice(-50)
  // Use API data if available, otherwise show empty arrays (charts will be empty)
  const currentFrequencyBandData = (data?.frequencyBandData || []).slice(-50)
  const currentFrequencyRatioData = (data?.frequencyRatioData || []).slice(-50)

  // Process mood data for pie chart
  const moodCounts = mediaData.reduce((acc, item) => {
    const mood = item.user_mood
    acc[mood] = (acc[mood] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const pieChartData = Object.entries(moodCounts).map(([mood, count]) => ({
    name: mood,
    value: count,
    percentage: ((count / mediaData.length) * 100).toFixed(1)
  }))

  // Colors for different moods
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316']
  
  // Log data availability for debugging
  console.log('Chart data availability:', {
    hasFrequencyBandData: currentFrequencyBandData.length > 0,
    hasFrequencyRatioData: currentFrequencyRatioData.length > 0,
    frequencyBandCount: currentFrequencyBandData.length,
    frequencyRatioCount: currentFrequencyRatioData.length
  })


  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 pt-20 pb-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-muted-foreground">Loading biometric data...</span>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 pt-20 pb-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-6 h-6" />
              <span>Error loading biometric data: {error}</span>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-20 pb-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Biometrics</h1>
          <p className="text-muted-foreground">Your health data throughout the day</p>
        </div>

        {/* Mood Levels */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Mood Levels</h2>
          <p className="text-muted-foreground mb-6">Real-time analysis of your emotional and mental states</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-2 mb-4">
              <Moon className="w-5 h-5 text-red-400" />
              <h2 className="text-xl font-semibold text-foreground">Fatigue Level</h2>
            </div>

            {currentFrequencyRatioData.length > 0 ? (
              <ChartContainer
                config={{
                  thetaBetaRatio: {
                    label: "Fatigue Level",
                    color: "rgb(248, 113, 113)",
                  },
                }}
                className="h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentFrequencyRatioData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="thetaBetaRatio"
                      stroke="var(--color-thetaBetaRatio)"
                      strokeWidth={3}
                      dot={{ fill: "var(--color-thetaBetaRatio)", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="text-sm">No fatigue level data available</div>
                  <div className="text-xs mt-1">Data will appear when frequency analysis is performed</div>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-2 mb-4">
              <Waves className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold text-foreground">Calmness Level</h2>
            </div>

            {currentFrequencyRatioData.length > 0 ? (
              <ChartContainer
                config={{
                  alphaBetaRatio: {
                    label: "Calmness Level",
                    color: "rgb(96, 165, 250)",
                  },
                }}
                className="h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentFrequencyRatioData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="alphaBetaRatio"
                      stroke="var(--color-alphaBetaRatio)"
                      strokeWidth={3}
                      dot={{ fill: "var(--color-alphaBetaRatio)", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="text-sm">No calmness level data available</div>
                  <div className="text-xs mt-1">Data will appear when frequency analysis is performed</div>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-semibold text-foreground">Focus Level</h2>
            </div>

            {currentFrequencyRatioData.length > 0 ? (
              <ChartContainer
                config={{
                  betaThetaRatio: {
                    label: "Focus Level",
                    color: "rgb(74, 222, 128)",
                  },
                }}
                className="h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentFrequencyRatioData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="betaThetaRatio"
                      stroke="var(--color-betaThetaRatio)"
                      strokeWidth={3}
                      dot={{ fill: "var(--color-betaThetaRatio)", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="text-sm">No focus level data available</div>
                  <div className="text-xs mt-1">Data will appear when frequency analysis is performed</div>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-foreground">Anxiety Level</h2>
            </div>

            {currentFrequencyRatioData.length > 0 ? (
              <ChartContainer
                config={{
                  betaAlphaRatio: {
                    label: "Anxiety Level",
                    color: "rgb(168, 85, 247)",
                  },
                }}
                className="h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentFrequencyRatioData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="betaAlphaRatio"
                      stroke="var(--color-betaAlphaRatio)"
                      strokeWidth={3}
                      dot={{ fill: "var(--color-betaAlphaRatio)", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="text-sm">No anxiety level data available</div>
                  <div className="text-xs mt-1">Data will appear when frequency analysis is performed</div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Mood Distribution */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-foreground mb-2">Mood Distribution</h2>
          <p className="text-muted-foreground mb-4">Distribution of moods across all your captured moments</p>
        </div>
        
        <div className="mb-6">
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-purple-400" />
              <h2 className="text-lg font-semibold text-foreground">Mood Analysis</h2>
            </div>

            {pieChartData.length > 0 ? (
              <div className="flex flex-col lg:flex-row items-center gap-4">
                <div className="w-full lg:w-1/2">
                  <ChartContainer
                    config={pieChartData.reduce((acc, item) => {
                      acc[item.name] = {
                        label: item.name,
                        color: COLORS[pieChartData.indexOf(item) % COLORS.length]
                      }
                      return acc
                    }, {} as Record<string, { label: string; color: string }>)}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percentage }) => `${name} (${percentage}%)`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip 
                          content={<ChartTooltipContent />}
                          formatter={(value, name) => [value, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                
                <div className="w-full lg:w-1/2">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-foreground mb-2">Mood Breakdown</h3>
                    {pieChartData.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between p-1.5 rounded bg-muted/50">
                        <div className="flex items-center gap-1.5">
                          <div 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-xs font-medium text-foreground capitalize">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-semibold text-foreground">{item.value}</div>
                          <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="text-sm">No mood data available</div>
                  <div className="text-xs mt-1">Mood data will appear when you capture moments</div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Technical EEG Data */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Technical EEG Data</h2>
          <p className="text-muted-foreground mb-6">Raw brain wave frequencies and technical measurements</p>
        </div>
        
        {/* First row: Brain Waves and Frequency Ratios */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-secondary" />
              <h2 className="text-xl font-semibold text-foreground">EEG - Brain Waves</h2>
            </div>

            <div className="grid grid-cols-5 gap-2 mb-4">
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Alpha</div>
                <div className="text-sm font-bold text-blue-400">8-13 Hz</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Beta</div>
                <div className="text-sm font-bold text-green-400">13-30 Hz</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Theta</div>
                <div className="text-sm font-bold text-yellow-400">4-8 Hz</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Delta</div>
                <div className="text-sm font-bold text-red-400">0.5-4 Hz</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Gamma</div>
                <div className="text-sm font-bold text-purple-400">30+ Hz</div>
              </div>
            </div>

            {currentFrequencyBandData.length > 0 ? (
              <ChartContainer
                config={{
                  alpha: { label: "Alpha", color: "rgb(96, 165, 250)" },
                  beta: { label: "Beta", color: "rgb(74, 222, 128)" },
                  theta: { label: "Theta", color: "rgb(250, 204, 21)" },
                  delta: { label: "Delta", color: "rgb(248, 113, 113)" },
                  gamma: { label: "Gamma", color: "rgb(168, 85, 247)" },
                }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentFrequencyBandData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="alpha" stroke="var(--color-alpha)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="beta" stroke="var(--color-beta)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="theta" stroke="var(--color-theta)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="delta" stroke="var(--color-delta)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="gamma" stroke="var(--color-gamma)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="text-sm">No EEG frequency band data available</div>
                  <div className="text-xs mt-1">Data will appear when frequency analysis is performed</div>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-secondary" />
              <h2 className="text-xl font-semibold text-foreground">EEG - Frequency Ratios</h2>
            </div>

            <div className="grid grid-cols-5 gap-2 mb-4">
              <div className="text-center">
                <div className="text-xs text-muted-foreground">α/θ</div>
                <div className="text-sm font-bold text-blue-400">Alpha/Theta</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">α/β</div>
                <div className="text-sm font-bold text-green-400">Alpha/Beta</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">θ/β</div>
                <div className="text-sm font-bold text-yellow-400">Theta/Beta</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">α/β Major</div>
                <div className="text-sm font-bold text-red-400">Alpha Major/Beta Major</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">θ/α</div>
                <div className="text-sm font-bold text-purple-400">Theta/Alpha</div>
              </div>
            </div>

            {currentFrequencyRatioData.length > 0 ? (
              <ChartContainer
                config={{
                  alphaThetaRatio: { label: "α/θ", color: "rgb(96, 165, 250)" },
                  alphaBetaRatio: { label: "α/β", color: "rgb(74, 222, 128)" },
                  thetaBetaRatio: { label: "θ/β", color: "rgb(250, 204, 21)" },
                  alphaMajorBetaMajorRatio: { label: "α/β Major", color: "rgb(248, 113, 113)" },
                  thetaAlphaRatio: { label: "θ/α", color: "rgb(168, 85, 247)" },
                }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentFrequencyRatioData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="alphaThetaRatio" stroke="var(--color-alphaThetaRatio)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="alphaBetaRatio" stroke="var(--color-alphaBetaRatio)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="thetaBetaRatio" stroke="var(--color-thetaBetaRatio)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="alphaMajorBetaMajorRatio" stroke="var(--color-alphaMajorBetaMajorRatio)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="thetaAlphaRatio" stroke="var(--color-thetaAlphaRatio)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="text-sm">No EEG frequency ratio data available</div>
                  <div className="text-xs mt-1">Data will appear when frequency analysis is performed</div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Second row: Channel Voltages (centered) */}
        <div className="flex justify-center mb-6">
          <div className="w-full max-w-4xl">
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-semibold text-foreground">EEG - Channel Voltages</h2>
              </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="text-center">
                <div className="text-xs text-muted-foreground">O1</div>
                <div className="text-sm font-bold text-blue-400">Voltage</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">O2</div>
                <div className="text-sm font-bold text-green-400">Voltage</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">T3</div>
                <div className="text-sm font-bold text-yellow-400">Voltage</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">T4</div>
                <div className="text-sm font-bold text-red-400">Voltage</div>
              </div>
            </div>

            <ChartContainer
              config={{
                channel_0: { label: "O1", color: "rgb(96, 165, 250)" },
                channel_1: { label: "O2", color: "rgb(74, 222, 128)" },
                channel_2: { label: "T3", color: "rgb(250, 204, 21)" },
                channel_3: { label: "T4", color: "rgb(248, 113, 113)" },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentChannelVoltageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="channel_0" stroke="var(--color-channel_0)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="channel_1" stroke="var(--color-channel_1)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="channel_2" stroke="var(--color-channel_2)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="channel_3" stroke="var(--color-channel_3)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
            </Card>
          </div>
        </div>

        {/* Individual Frequency Bands */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Individual Frequency Bands</h2>
          <p className="text-muted-foreground mb-6">Individual brain wave frequency band analysis</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold text-foreground">Alpha Waves</h2>
            </div>

            {currentFrequencyBandData.length > 0 ? (
              <ChartContainer
                config={{
                  alpha: {
                    label: "Alpha (8-12 Hz)",
                    color: "rgb(96, 165, 250)",
                  },
                }}
                className="h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentFrequencyBandData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <ChartTooltip 
                      content={<ChartTooltipContent />} 
                      formatter={(value, name) => [Number(value).toFixed(6), name]}
                    />
                    <Line
                      type="monotone"
                      dataKey="alpha"
                      stroke="var(--color-alpha)"
                      strokeWidth={3}
                      dot={{ fill: "var(--color-alpha)", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="text-sm">No alpha wave data available</div>
                  <div className="text-xs mt-1">Data will appear when frequency analysis is performed</div>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-semibold text-foreground">Beta Waves</h2>
            </div>

            {currentFrequencyBandData.length > 0 ? (
              <ChartContainer
                config={{
                  beta: {
                    label: "Beta (13-30 Hz)",
                    color: "rgb(74, 222, 128)",
                  },
                }}
                className="h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentFrequencyBandData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <ChartTooltip 
                      content={<ChartTooltipContent />} 
                      formatter={(value, name) => [Number(value).toFixed(6), name]}
                    />
                    <Line
                      type="monotone"
                      dataKey="beta"
                      stroke="var(--color-beta)"
                      strokeWidth={3}
                      dot={{ fill: "var(--color-beta)", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="text-sm">No beta wave data available</div>
                  <div className="text-xs mt-1">Data will appear when frequency analysis is performed</div>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-yellow-400" />
              <h2 className="text-xl font-semibold text-foreground">Theta Waves</h2>
            </div>

            {currentFrequencyBandData.length > 0 ? (
              <ChartContainer
                config={{
                  theta: {
                    label: "Theta (4-8 Hz)",
                    color: "rgb(250, 204, 21)",
                  },
                }}
                className="h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentFrequencyBandData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <ChartTooltip 
                      content={<ChartTooltipContent />} 
                      formatter={(value, name) => [Number(value).toFixed(6), name]}
                    />
                    <Line
                      type="monotone"
                      dataKey="theta"
                      stroke="var(--color-theta)"
                      strokeWidth={3}
                      dot={{ fill: "var(--color-theta)", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="text-sm">No theta wave data available</div>
                  <div className="text-xs mt-1">Data will appear when frequency analysis is performed</div>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-red-400" />
              <h2 className="text-xl font-semibold text-foreground">Delta Waves</h2>
            </div>

            {currentFrequencyBandData.length > 0 ? (
              <ChartContainer
                config={{
                  delta: {
                    label: "Delta (0.5-4 Hz)",
                    color: "rgb(248, 113, 113)",
                  },
                }}
                className="h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentFrequencyBandData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <ChartTooltip 
                      content={<ChartTooltipContent />} 
                      formatter={(value, name) => [Number(value).toFixed(6), name]}
                    />
                    <Line
                      type="monotone"
                      dataKey="delta"
                      stroke="var(--color-delta)"
                      strokeWidth={3}
                      dot={{ fill: "var(--color-delta)", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="text-sm">No delta wave data available</div>
                  <div className="text-xs mt-1">Data will appear when frequency analysis is performed</div>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-foreground">Gamma Waves</h2>
            </div>

            {currentFrequencyBandData.length > 0 ? (
              <ChartContainer
                config={{
                  gamma: {
                    label: "Gamma (30+ Hz)",
                    color: "rgb(168, 85, 247)",
                  },
                }}
                className="h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentFrequencyBandData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <ChartTooltip 
                      content={<ChartTooltipContent />} 
                      formatter={(value, name) => [Number(value).toFixed(6), name]}
                    />
                    <Line
                      type="monotone"
                      dataKey="gamma"
                      stroke="var(--color-gamma)"
                      strokeWidth={3}
                      dot={{ fill: "var(--color-gamma)", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="text-sm">No gamma wave data available</div>
                  <div className="text-xs mt-1">Data will appear when frequency analysis is performed</div>
                </div>
              </div>
            )}
          </Card>

        </div>
      </main>
    </div>
  )
}
