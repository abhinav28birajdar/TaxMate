import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/auth-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp } = body

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP required' },
        { status: 400 }
      )
    }

    const result = await authService.verifyOTP(email, otp)

    const response = NextResponse.json({
      success: true,
      user: result.user,
    })

    response.cookies.set('auth-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    })

    return response
  } catch (error: any) {
    console.error('OTP verify error:', error)
    return NextResponse.json(
      { error: error.message || 'OTP verification failed' },
      { status: 400 }
    )
  }
}
