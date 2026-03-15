import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const clientIdStr = formData.get('clientId') as string
    const clientId = Number(clientIdStr)
    const reason = (formData.get('reason') as string)?.trim()
    const blacklistUntilStr = formData.get('blacklistUntil') as string || null

    if (isNaN(clientId) || clientId <= 0) {
      return NextResponse.json({ error: 'Valid client ID required' }, { status: 400 })
    }
    if (!reason || reason.length === 0) {
      return NextResponse.json({ error: 'Reason required' }, { status: 400 })
    }

    // Check if client exists
    const existingClient = await prisma.rentalClient.findUnique({
      where: { id: clientId }
    })
    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const data: any = {
      isBlacklisted: true,
      blacklistReason: reason,
      blacklistDate: new Date(),
      // blacklistBy: currentUserId, // TODO if user auth
    }

    if (blacklistUntilStr) {
      const blacklistUntilDate = new Date(blacklistUntilStr)
      if (isNaN(blacklistUntilDate.getTime())) {
        return NextResponse.json({ error: 'Invalid blacklist until date' }, { status: 400 })
      }
      data.blacklistUntil = blacklistUntilDate
    }

    await prisma.rentalClient.update({
      where: { id: clientId },
      data,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Blacklist error:', error)
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Error blacklisting client: ${errorMsg}` }, { status: 500 })
  }
}
