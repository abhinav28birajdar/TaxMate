import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || supabaseUrl === '' || supabaseUrl.includes('PLACEHOLDER')) {
    console.error(
        '⚠️ NEXT_PUBLIC_SUPABASE_URL is missing or invalid!\n' +
        'Please add your Supabase project URL to .env.local file:\n' +
        'NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co'
    )
}

if (!supabaseKey || supabaseKey === '' || supabaseKey.includes('placeholder')) {
    console.error(
        '⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or invalid!\n' +
        'Please add your Supabase anon key to .env.local file:\n' +
        'NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key'
    )
}

export function createClient() {
    const url = (supabaseUrl && supabaseUrl !== '' && !supabaseUrl.includes('PLACEHOLDER')) 
        ? supabaseUrl 
        : 'https://placeholder.supabase.co';

    const key = (supabaseKey && supabaseKey !== '' && !supabaseKey.includes('placeholder')) 
        ? supabaseKey 
        : 'placeholder-anon-key';

    return createBrowserClient(url, key)
}
