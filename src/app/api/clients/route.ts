import { NextRequest, NextResponse } from 'next/server'
import { clientService } from '@/lib/client-service'

export async function GET(request: NextRequest) {
  try {
    const caId = request.headers.get('x-ca-id')
    if (!caId) {
      return NextResponse.json(
        { error: 'CA ID required' },
        { status: 401 }
      )
    }

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
    const caId = request.headers.get('x-ca-id')
    if (!caId) {
      return NextResponse.json(
        { error: 'CA ID required' },
        { status: 401 }
      )
    }

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
