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
    const propertyId = parseInt(params.id)
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        agreements: {
          include: {
            tenant: true
          }
        },
        householdItems: true
      }
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    return NextResponse.json({ property })
  } catch (error) {
    console.error('Property detail error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const propertyId = parseInt(params.id)
    const formData = await request.formData()

    const propertyData = {
      name: formData.get('name') as string,
      propertyId: formData.get('propertyId') as string,
      rentAmount: parseFloat(formData.get('rentAmount') as string),
      occupancyLimit: parseInt(formData.get('occupancyLimit') as string),
      status: formData.get('status') as string
    }

    const property = await prisma.property.update({
      where: { id: propertyId },
      data: propertyData
    })

    return NextResponse.json({ property, success: true })
  } catch (error) {
    console.error('Update property error:', error)
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const propertyId = parseInt(params.id)
    
    // Cascade delete handled by Prisma
    await prisma.property.delete({
      where: { id: propertyId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete property error:', error)
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 })
  }
}

