import { NextRequest, NextResponse } from 'next/server'
import { taskService } from '@/lib/task-service'

export async function GET(request: NextRequest) {
  try {
    const caId = request.headers.get('x-ca-id')
    const clientId = request.headers.get('x-client-id')
    const status = request.nextUrl.searchParams.get('status')
    const priority = request.nextUrl.searchParams.get('priority')
    const skip = parseInt(request.nextUrl.searchParams.get('skip') || '0')
    const take = parseInt(request.nextUrl.searchParams.get('take') || '20')

    const result = await taskService.getTasks({
      caId: caId || undefined,
      clientId: clientId || undefined,
      status: status || undefined,
      priority: priority || undefined,
      skip,
      take,
    })

    return NextResponse.json(result)
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
    if (!caId) {
      return NextResponse.json(
        { error: 'CA ID required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const task = await taskService.createTask({
      caId,
      ...body,
    })

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
