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

    if (isNaN(tenantId)) {
      return NextResponse.json({ error: 'Missing tenantId' }, { status: 400 })
    }

    const existingTenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    })
    if (!existingTenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        isBlacklisted: false,
        blacklistReason: null,
        blacklistUntil: null,
        blacklistDate: null,
        blacklistBy: null
      }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unblacklist API error:', error)
    return NextResponse.json({ error: 'Server error', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
