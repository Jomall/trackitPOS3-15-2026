'use server'

import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

let prisma: PrismaClient

declare global {
  var __db__: PrismaClient
}

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.__db__) {
    global.__db__ = new PrismaClient()
  }
  prisma = global.__db__
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const tenantId = parseInt(formData.get('tenantId') as string, 10)
    const reason = formData.get('reason') as string
    const untilStr = formData.get('blacklistUntil') as string
    const until = untilStr ? new Date(untilStr) : null

    console.log('Blacklist attempt:', { tenantId, reason, untilStr, until: until?.toISOString(), isValidTenantId: !isNaN(tenantId) })

    if (isNaN(tenantId) || !reason) {
      return NextResponse.json({ error: 'Missing tenantId or reason' }, { status: 400 })
    }

    // Check if tenant exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    })
    if (!existingTenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Validate date if provided
    if (untilStr && isNaN(Date.parse(untilStr))) {
      return NextResponse.json({ error: 'Invalid blacklistUntil date' }, { status: 400 })
    }

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        isBlacklisted: true,
        blacklistReason: reason,
        blacklistUntil: until,
        blacklistDate: new Date(),
        blacklistBy: null
      }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Blacklist API error:', error)
    return NextResponse.json({ error: 'Server error', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
