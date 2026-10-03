import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function createClient() {
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('PLACEHOLDER') || supabaseKey.includes('placeholder')) {
        throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    return createBrowserClient(supabaseUrl, supabaseKey)
}
