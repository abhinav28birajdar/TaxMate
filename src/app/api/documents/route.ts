import { NextRequest, NextResponse } from 'next/server'
import { documentService } from '@/lib/document-service'

export async function GET(request: NextRequest) {
  try {
    const clientId = request.headers.get('x-client-id')
    const category = request.nextUrl.searchParams.get('category')
    const status = request.nextUrl.searchParams.get('status')
    const skip = parseInt(request.nextUrl.searchParams.get('skip') || '0')
    const take = parseInt(request.nextUrl.searchParams.get('take') || '20')

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID required' },
        { status: 401 }
      )
    }

    const result = await documentService.getDocumentsByClient(clientId, {
      type: category || undefined,
      skip,
      take,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Get documents error:', error)
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
    const document = await documentService.uploadDocument({
      caId,
      ...body,
    })

    return NextResponse.json(
      { success: true, document },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Upload document error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}
