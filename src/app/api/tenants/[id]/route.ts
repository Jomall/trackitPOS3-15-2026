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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const tenantId = parseInt(params.id)
    
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        agreements: {
          include: {
            property: {
              select: { propertyId: true, name: true }
            },
            payments: true
          }
        }
      }
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    return NextResponse.json({ tenant })
  } catch (error) {
    console.error('Tenant detail error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const tenantId = parseInt(params.id)
    const formData = await request.formData()

    const tenantData = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      idNumber: formData.get('idNumber') as string,
      emergencyContact: formData.get('emergencyContact') as string
    }

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: tenantData
    })

    return NextResponse.json({ tenant, success: true })
  } catch (error) {
    console.error('Update tenant error:', error)
    return NextResponse.json({ error: 'Failed to update tenant' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const tenantId = parseInt(params.id)
    
    // Cascade handled by Prisma
    await prisma.tenant.delete({
      where: { id: tenantId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete tenant error:', error)
    return NextResponse.json({ error: 'Failed to delete tenant' }, { status: 500 })
  }
}

