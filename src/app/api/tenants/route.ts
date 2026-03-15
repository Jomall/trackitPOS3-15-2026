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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: any = {
      OR: search ? [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { idNumber: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ] : undefined
    }

    const [tenants, totalCount] = await Promise.all([
      prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          idNumber: true,
          createdAt: true,
          isBlacklisted: true,
          blacklistReason: true,
          blacklistUntil: true,
          blacklistDate: true,
          blacklistBy: true,
          agreements: {
            where: { status: 'ACTIVE' },
            include: {
              payments: true
            }
          }
        }
      }),
      prisma.tenant.count({ where })
    ])

    // Server-side balance calculation
    const tenantsWithBalance = tenants.map(tenant => {
      let totalExpected = 0
      let totalPaid = 0

      tenant.agreements.forEach(agreement => {
        const start = new Date(agreement.startDate)
        const now = new Date()
        const months = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
        totalExpected += agreement.rentAmount * Math.max(0, months)
        totalPaid += agreement.payments.reduce((sum, p) => sum + p.amount, 0)
      })

      const balance = Math.max(0, totalExpected - totalPaid)

      return { ...tenant, balance }
    })

    return NextResponse.json({ 
      tenants: tenantsWithBalance, 
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    })
  } catch (error) {
    console.error('Get tenants error:', error)
    return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 })
  }
}


