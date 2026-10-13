import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('https://htv2025-production.up.railway.app/api/biometric/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Biometric API Response:', data)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching biometric data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch biometric data' },
      { status: 500 }
    )
  }
}
