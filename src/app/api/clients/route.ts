import { NextRequest, NextResponse } from 'next/server'
import { clientService } from '@/lib/client-service'
import { createServerSupabaseClient } from '@lib/supabase/server'

async function getAuthorizedCA() {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { supabase, user: null }

  const role = String(user.app_metadata?.role || '').toUpperCase()
  if (!['CA', 'STAFF', 'SUPER_ADMIN'].includes(role)) return { supabase, user: null }
  return { supabase, user }
}

export async function GET(request: NextRequest) {
  try {
    const { user } = await getAuthorizedCA()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    const caId = user.id

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || undefined
    const type = searchParams.get('type') || undefined
    const status = searchParams.get('status') || undefined
    const skip = parseInt(searchParams.get('skip') || '0')
    const take = parseInt(searchParams.get('take') || '20')

    const result = await clientService.getClientsByCA(caId, {
      search: search || undefined,
      type,
      status,
      skip,
      take,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Get clients error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch clients' },
      { status: 400 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await getAuthorizedCA()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    const caId = user.id

    const body = await request.json()
    const client = await clientService.createClient(caId, body)

    return NextResponse.json(
      { success: true, client },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create client error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create client' },
      { status: 400 }
    )
  }
}
