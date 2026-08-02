import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { getDashboardPathForRole, normalizeRole } from '@/lib/auth-routing'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next')

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            let redirectPath = next

            if (!redirectPath) {
                const { data } = await supabase.auth.getUser()
                redirectPath = getDashboardPathForRole(normalizeRole(data.user?.user_metadata?.role || null))
            }

            return NextResponse.redirect(`${origin}${redirectPath || '/landing'}`)
        }
        
        // Include error details for better user communication 
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}&error_code=${error.code || 'access_denied'}`)
    }

    // Capture specific URL error params
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')
    const errorCode = searchParams.get('error_code')

    if (error || errorDescription || errorCode) {
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error || '')}&error_description=${encodeURIComponent(errorDescription || '')}&error_code=${errorCode || ''}`)
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
