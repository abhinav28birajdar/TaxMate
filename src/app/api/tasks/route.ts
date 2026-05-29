import { NextRequest, NextResponse } from 'next/server'
import { taskService } from '@/lib/services'

export async function GET(request: NextRequest) {
  try {
    const caId = request.headers.get('x-ca-id')
    const clientId = request.headers.get('x-client-id')
    const status = request.nextUrl.searchParams.get('status')
    const priority = request.nextUrl.searchParams.get('priority')

    // Get tasks using the Supabase-based service
    const tasks = await taskService.getAll(caId || clientId || '', {
      status: status || undefined,
      priority: priority || undefined,
    })

    return NextResponse.json({
      tasks,
      total: tasks?.length || 0,
      success: true,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const caId = request.headers.get('x-ca-id')
    const clientId = request.headers.get('x-client-id')
    
    if (!caId && !clientId) {
      return NextResponse.json(
        { error: 'CA ID or Client ID required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const task = await taskService.create(
      caId || clientId || '',
      clientId || caId || '',
      body
    )

    return NextResponse.json(
      { success: true, task },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}
