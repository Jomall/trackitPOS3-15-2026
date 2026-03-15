import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const clientIdStr = formData.get('clientId') as string
    const clientId = Number(clientIdStr)

    if (isNaN(clientId) || clientId <= 0) {
      return NextResponse.json({ error: 'Valid client ID required' }, { status: 400 })
    }

    // Check if client exists
    const existingClient = await prisma.rentalClient.findUnique({
      where: { id: clientId }
    })
    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    await prisma.rentalClient.update({
      where: { id: clientId },
      data: {
        isBlacklisted: false,
        blacklistReason: null,
        blacklistUntil: null,
        blacklistDate: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Unblacklist error:', error)
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Error unblacklisting client: ${errorMsg}` }, { status: 500 })
  }
}
