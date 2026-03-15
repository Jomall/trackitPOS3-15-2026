import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

import { revalidatePath } from 'next/cache'
const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''

  const skip = (page - 1) * limit

  const where = search 
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { driversLicenseNumber: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {}

  const [clients, totalCount] = await Promise.all([
    prisma.rentalClient.findMany({
      where,
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            damages: true,
            payments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.rentalClient.count({ where }),
  ])

  return NextResponse.json({
    clients,
    page,
    limit,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
  })
}
