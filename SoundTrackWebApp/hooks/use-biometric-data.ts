import { useState, useEffect } from 'react'
import { useData } from '@/contexts/DataContext'

interface EEGChannel {
  voltageValue: number
  channelName: string
}

interface FrequencyBands {
  delta: number
  alpha: number
  beta: number
  theta: number
  alphaMajor: number
  gamma: number
  betaMajor: number
}

interface FrequencyRatios {
  alphaThetaRatio: number
  alphaMajorBetaMajorRatio: number
  thetaBetaRatio: number
  alphaBetaRatio: number
  thetaAlphaRatio: number
}

interface ChannelFrequencyData {
  frequencyBands: FrequencyBands
  ratios: FrequencyRatios
}

interface FrequencyAnalysis {
  samplesAnalyzed: number
  hasAnalysis: boolean
  analysisWindow: number
  channels: {
    [key: string]: ChannelFrequencyData
  }
}

interface EEGData {
  channels: {
    [key: string]: EEGChannel
  }
  timestamp: string
  samplingRate: number
  frequencyAnalysis?: FrequencyAnalysis
}

interface BiometricRecord {
  id: string
  createdAt: string
  timestamp: string
  sessionId: string
  eegData: EEGData
}

interface BiometricData {
  eegData?: Array<{
    time: string
    alpha: number
    beta: number
    theta: number
    delta: number
  }>
  ecgData?: Array<{
    time: string
    bpm: number
    hrv: number
  }>
  focusData?: Array<{
    time: string
    focus: number
  }>
  happinessData?: Array<{
    time: string
    happiness: number
  }>
  rawBiometricData?: BiometricRecord[]
  channelVoltageData?: Array<{
    time: string
    channel_0: number
    channel_1: number
    channel_2: number
    channel_3: number
  }>
  frequencyBandData?: Array<{
    time: string
    delta: number
    alpha: number
    beta: number
    theta: number
    gamma: number
  }>
  frequencyRatioData?: Array<{
    time: string
    alphaThetaRatio: number
    alphaMajorBetaMajorRatio: number
    thetaBetaRatio: number
    alphaBetaRatio: number
    thetaAlphaRatio: number
  }>
}

export function useBiometricData() {
  const { biometricData: contextBiometricData, isLoading: contextLoading } = useData()
  const [data, setData] = useState<BiometricData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Only process when context data is available
    if (!contextLoading && contextBiometricData) {
      try {
        // Check if context biometric data has the expected structure
        if (Array.isArray(contextBiometricData) && contextBiometricData.length > 0) {
          // Cast to BiometricRecord[] type and transform
          const transformedData = transformBiometricData(contextBiometricData as any[])
          setData(transformedData)
        } else {
          // No biometric data available
          setData(null)
        }
      } catch (err) {
        console.error('Error transforming biometric data:', err)
        setError(err instanceof Error ? err.message : 'Failed to transform biometric data')
      }
    }
  }, [contextBiometricData, contextLoading])

  return { data, loading: contextLoading, error }
}

function transformBiometricData(rawData: BiometricRecord[]): BiometricData {
  // Sort data by timestamp to ensure chronological order
  const sortedData = rawData.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  // Transform EEG channel data for the voltage chart
  const channelVoltageData = sortedData.map(record => {
    const timestamp = new Date(record.timestamp)
    const timeString = timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    })
    
    return {
      time: timeString,
      channel_0: record.eegData.channels.channel_0?.voltageValue || 0,
      channel_1: record.eegData.channels.channel_1?.voltageValue || 0,
      channel_2: record.eegData.channels.channel_2?.voltageValue || 0,
      channel_3: record.eegData.channels.channel_3?.voltageValue || 0,
    }
  })

  // Transform frequency band data (average across all channels)
  const recordsWithFrequencyData = sortedData.filter(record => record.eegData.frequencyAnalysis?.hasAnalysis)
  console.log(`Found ${recordsWithFrequencyData.length} records with frequency analysis out of ${sortedData.length} total records`)
  
  const frequencyBandData = recordsWithFrequencyData.map(record => {
      console.log('Processing frequency data for record:', record.id, record.eegData.frequencyAnalysis)
      const timestamp = new Date(record.timestamp)
      const timeString = timestamp.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false,
        timeZone: 'UTC'
      })
      
      const channels = record.eegData.frequencyAnalysis?.channels || {}
      const channelKeys = Object.keys(channels)
      
      // Average frequency bands across all channels
      const avgBands = channelKeys.reduce((acc, channelKey) => {
        const channel = channels[channelKey]
        if (channel) {
          acc.delta += channel.frequencyBands.delta
          acc.alpha += channel.frequencyBands.alpha
          acc.beta += channel.frequencyBands.beta
          acc.theta += channel.frequencyBands.theta
          acc.gamma += channel.frequencyBands.gamma
        }
        return acc
      }, { delta: 0, alpha: 0, beta: 0, theta: 0, gamma: 0 })
      
      // Divide by number of channels to get average
      const channelCount = channelKeys.length || 1
      return {
        time: timeString,
        delta: avgBands.delta / channelCount,
        alpha: avgBands.alpha / channelCount,
        beta: avgBands.beta / channelCount,
        theta: avgBands.theta / channelCount,
        gamma: avgBands.gamma / channelCount,
      }
    })

  // Transform frequency ratio data (average across all channels)
  const frequencyRatioData = recordsWithFrequencyData.map(record => {
      const timestamp = new Date(record.timestamp)
      const timeString = timestamp.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false,
        timeZone: 'UTC'
      })
      
      const channels = record.eegData.frequencyAnalysis?.channels || {}
      const channelKeys = Object.keys(channels)
      
      // Average ratios across all channels
      const avgRatios = channelKeys.reduce((acc, channelKey) => {
        const channel = channels[channelKey]
        if (channel) {
          acc.alphaThetaRatio += channel.ratios.alphaThetaRatio
          acc.alphaMajorBetaMajorRatio += channel.ratios.alphaMajorBetaMajorRatio
          acc.thetaBetaRatio += channel.ratios.thetaBetaRatio
          acc.alphaBetaRatio += channel.ratios.alphaBetaRatio
          acc.thetaAlphaRatio += channel.ratios.thetaAlphaRatio
        }
        return acc
      }, { 
        alphaThetaRatio: 0, 
        alphaMajorBetaMajorRatio: 0, 
        thetaBetaRatio: 0, 
        alphaBetaRatio: 0, 
        thetaAlphaRatio: 0 
      })
      
      // Calculate ratios manually from frequency band data
      const avgBands = channelKeys.reduce((acc, channelKey) => {
        const channel = channels[channelKey]
        if (channel) {
          acc.delta += channel.frequencyBands.delta
          acc.alpha += channel.frequencyBands.alpha
          acc.beta += channel.frequencyBands.beta
          acc.theta += channel.frequencyBands.theta
          acc.gamma += channel.frequencyBands.gamma
        }
        return acc
      }, { delta: 0, alpha: 0, beta: 0, theta: 0, gamma: 0 })
      
      // Divide by number of channels to get average
      const channelCount = channelKeys.length || 1
      const avgDelta = avgBands.delta / channelCount
      const avgAlpha = avgBands.alpha / channelCount
      const avgBeta = avgBands.beta / channelCount
      const avgTheta = avgBands.theta / channelCount
      const avgGamma = avgBands.gamma / channelCount

      return {
        time: timeString,
        alphaThetaRatio: avgRatios.alphaThetaRatio / channelCount,
        alphaMajorBetaMajorRatio: avgRatios.alphaMajorBetaMajorRatio / channelCount,
        thetaBetaRatio: avgRatios.thetaBetaRatio / channelCount,
        alphaBetaRatio: avgRatios.alphaBetaRatio / channelCount,
        thetaAlphaRatio: avgRatios.thetaAlphaRatio / channelCount,
        // Calculate beta/theta ratio for Focus Level (manual calculation)
        betaThetaRatio: avgTheta > 0 ? avgBeta / avgTheta : 0,
        // Calculate beta/alpha ratio for Anxiety Level (manual calculation)
        betaAlphaRatio: avgAlpha > 0 ? avgBeta / avgAlpha : 0,
      }
    })

  console.log('Transformed data summary:', {
    totalRecords: rawData.length,
    voltageDataPoints: channelVoltageData.length,
    frequencyBandDataPoints: frequencyBandData.length,
    frequencyRatioDataPoints: frequencyRatioData.length,
    sampleFrequencyData: frequencyBandData.slice(0, 2),
    sampleRatioData: frequencyRatioData.slice(0, 2)
  })

  return {
    rawBiometricData: rawData,
    channelVoltageData: channelVoltageData,
    frequencyBandData: frequencyBandData,
    frequencyRatioData: frequencyRatioData,
    // Keep the existing mock data structure for other charts
    eegData: undefined,
    ecgData: undefined,
    focusData: undefined,
    happinessData: undefined,
  }
}
