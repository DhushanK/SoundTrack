"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Music, Bell, User, Save } from "lucide-react"

export default function SettingsPage() {
  const [captureFrequency, setCaptureFrequency] = useState(5)
  const [moodSensitivity, setMoodSensitivity] = useState([65])
  const [autoCapture, setAutoCapture] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  const handleSaveSettings = () => {
    // Save settings logic here
    console.log("Settings saved:", {
      captureFrequency,
      moodSensitivity: moodSensitivity[0],
      autoCapture,
      notifications,
      darkMode,
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 pt-24 pb-24 md:pt-32 md:pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Settings</h1>
            <p className="text-muted-foreground">Customize your SoundTrack to Your Life experience</p>
          </div>

          <Tabs defaultValue="capture" className="space-y-6">
            <TabsList className="grid w-full max-w-2xl grid-cols-4">
              <TabsTrigger value="capture">Capture</TabsTrigger>
              <TabsTrigger value="mood">Mood</TabsTrigger>
              <TabsTrigger value="music">Music</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>

            {/* Capture Settings */}
            <TabsContent value="capture" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    <CardTitle>Data Capture Settings</CardTitle>
                  </div>
                  <CardDescription>Configure how and when data is captured</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Auto Capture */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-capture" className="text-base">
                        Auto Capture
                      </Label>
                      <p className="text-sm text-muted-foreground">Automatically start capturing when app opens</p>
                    </div>
                    <Switch id="auto-capture" checked={autoCapture} onCheckedChange={setAutoCapture} />
                  </div>

                  {/* Capture Frequency */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="capture-frequency" className="text-base">
                        Capture Frequency
                      </Label>
                      <span className="text-sm font-medium text-foreground">{captureFrequency} minutes</span>
                    </div>
                    <p className="text-sm text-muted-foreground">How often to capture images and environmental data</p>
                    <Select
                      value={captureFrequency.toString()}
                      onValueChange={(value) => setCaptureFrequency(Number.parseInt(value))}
                    >
                      <SelectTrigger id="capture-frequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Every 1 minute</SelectItem>
                        <SelectItem value="5">Every 5 minutes</SelectItem>
                        <SelectItem value="10">Every 10 minutes</SelectItem>
                        <SelectItem value="15">Every 15 minutes</SelectItem>
                        <SelectItem value="30">Every 30 minutes</SelectItem>
                        <SelectItem value="60">Every hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Biomedical Sensors */}
                  <div className="space-y-3">
                    <Label className="text-base">Active Sensors</Label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="eeg-sensor" className="font-normal">
                          EEG (Brain Activity)
                        </Label>
                        <Switch id="eeg-sensor" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="ecg-sensor" className="font-normal">
                          ECG (Heart Rate)
                        </Label>
                        <Switch id="ecg-sensor" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="imu-sensor" className="font-normal">
                          IMU (Movement)
                        </Label>
                        <Switch id="imu-sensor" defaultChecked />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Mood Settings */}
            <TabsContent value="mood" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mood Detection Settings</CardTitle>
                  <CardDescription>Adjust how emotions are detected and analyzed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Mood Sensitivity */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="mood-sensitivity" className="text-base">
                        Detection Sensitivity
                      </Label>
                      <span className="text-sm font-medium text-foreground">{moodSensitivity[0]}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Higher sensitivity detects subtle mood changes, lower sensitivity focuses on major shifts
                    </p>
                    <Slider
                      id="mood-sensitivity"
                      value={moodSensitivity}
                      onValueChange={setMoodSensitivity}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Less Sensitive</span>
                      <span>More Sensitive</span>
                    </div>
                  </div>

                  {/* Analysis Method */}
                  <div className="space-y-3">
                    <Label htmlFor="analysis-method" className="text-base">
                      Analysis Method
                    </Label>
                    <Select defaultValue="balanced">
                      <SelectTrigger id="analysis-method">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fast">Fast (Less accurate)</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="detailed">Detailed (More accurate)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Real-time Analysis */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="realtime-analysis" className="text-base">
                        Real-time Analysis
                      </Label>
                      <p className="text-sm text-muted-foreground">Analyze mood continuously during capture</p>
                    </div>
                    <Switch id="realtime-analysis" defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Music Settings */}
            <TabsContent value="music" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Music className="w-5 h-5 text-primary" />
                    <CardTitle>Music Preferences</CardTitle>
                  </div>
                  <CardDescription>Customize your music recommendations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Favorite Genres */}
                  <div className="space-y-3">
                    <Label htmlFor="genres" className="text-base">
                      Favorite Genres
                    </Label>
                    <Input
                      id="genres"
                      placeholder="e.g., Ambient, Classical, Electronic, Jazz"
                      defaultValue="Ambient, Classical, Electronic"
                    />
                    <p className="text-sm text-muted-foreground">Separate multiple genres with commas</p>
                  </div>

                  {/* Favorite Artists */}
                  <div className="space-y-3">
                    <Label htmlFor="artists" className="text-base">
                      Favorite Artists
                    </Label>
                    <Input
                      id="artists"
                      placeholder="e.g., Marconi Union, Ludovico Einaudi, Ólafur Arnalds"
                      defaultValue="Marconi Union, Claude Debussy"
                    />
                    <p className="text-sm text-muted-foreground">Separate multiple artists with commas</p>
                  </div>

                  {/* Music Discovery */}
                  <div className="space-y-3">
                    <Label htmlFor="discovery" className="text-base">
                      Discovery Level
                    </Label>
                    <Select defaultValue="balanced">
                      <SelectTrigger id="discovery">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="familiar">Mostly Familiar</SelectItem>
                        <SelectItem value="balanced">Balanced Mix</SelectItem>
                        <SelectItem value="discovery">Mostly New</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">Balance between familiar songs and new discoveries</p>
                  </div>

                  {/* Explicit Content */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="explicit-content" className="text-base">
                        Allow Explicit Content
                      </Label>
                      <p className="text-sm text-muted-foreground">Include songs with explicit lyrics</p>
                    </div>
                    <Switch id="explicit-content" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Account Settings */}
            <TabsContent value="account" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    <CardTitle>Account Settings</CardTitle>
                  </div>
                  <CardDescription>Manage your account and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile */}
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-base">
                      Name
                    </Label>
                    <Input id="name" placeholder="Your name" defaultValue="Alex Johnson" />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-base">
                      Email
                    </Label>
                    <Input id="email" type="email" placeholder="your@email.com" defaultValue="alex@example.com" />
                  </div>

                  {/* Notifications */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-primary" />
                      <Label className="text-base">Notifications</Label>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="push-notifications" className="font-normal">
                          Push Notifications
                        </Label>
                        <Switch id="push-notifications" checked={notifications} onCheckedChange={setNotifications} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-notifications" className="font-normal">
                          Email Updates
                        </Label>
                        <Switch id="email-notifications" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="weekly-summary" className="font-normal">
                          Weekly Summary
                        </Label>
                        <Switch id="weekly-summary" defaultChecked />
                      </div>
                    </div>
                  </div>

                  {/* Theme */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="dark-mode" className="text-base">
                        Dark Mode
                      </Label>
                      <p className="text-sm text-muted-foreground">Use dark theme throughout the app</p>
                    </div>
                    <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} />
                  </div>
                </CardContent>
              </Card>

              {/* Data Management */}
              <Card>
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                  <CardDescription>Manage your captured data and history</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Storage Used</p>
                      <p className="text-sm text-muted-foreground">2.4 GB of 10 GB</p>
                    </div>
                    <Button variant="outline">Manage Storage</Button>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <p className="font-medium text-foreground">Export Data</p>
                      <p className="text-sm text-muted-foreground">Download all your captured data</p>
                    </div>
                    <Button variant="outline">Export</Button>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <p className="font-medium text-destructive">Delete Account</p>
                      <p className="text-sm text-muted-foreground">Permanently delete your account and data</p>
                    </div>
                    <Button variant="destructive">Delete</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <Card className="mt-6 border-2 border-primary/50 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-foreground">Save Your Settings</p>
                  <p className="text-sm text-muted-foreground">Changes will be applied immediately</p>
                </div>
                <Button onClick={handleSaveSettings} size="lg" className="gap-2 w-full sm:w-auto">
                  <Save className="w-4 h-4" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
