import { NextRequest, NextResponse } from 'next/server'
import { invoiceService } from '@/lib/invoice-service'

export async function GET(request: NextRequest) {
  try {
    const caId = request.headers.get('x-ca-id')
    const status = request.nextUrl.searchParams.get('status')
    const skip = parseInt(request.nextUrl.searchParams.get('skip') || '0')
    const take = parseInt(request.nextUrl.searchParams.get('take') || '20')

    if (!caId) {
      return NextResponse.json(
        { error: 'CA ID required' },
        { status: 401 }
      )
    }

    const result = await invoiceService.getInvoices({
      caId,
      status: status || undefined,
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
    const invoice = await invoiceService.createInvoice({
      caId,
      ...body,
    })

    return NextResponse.json(
      { success: true, invoice },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}
