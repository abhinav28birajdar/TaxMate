import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/auth-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email required' },
        { status: 400 }
      )
    }

    await authService.sendOTP(email)

    return NextResponse.json({
      success: true,
      message: 'OTP sent to email',
    })
  } catch (error: any) {
    console.error('OTP send error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send OTP' },
      { status: 400 }
    )
  }
}
