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
    
    const propertyData = {
      propertyId: formData.get('propertyId') as string,
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      occupancyLimit: parseInt(formData.get('occupancyLimit') as string),
      rentAmount: parseFloat(formData.get('rentAmount') as string),
      depositAmount: parseFloat(formData.get('depositAmount') as string || '0'),
      amenities: formData.get('amenities') as string || '',
      furnishingType: formData.get('furnishingType') as string || null,
      status: 'AVAILABLE'
    }

    const property = await prisma.property.create({
      data: propertyData
    })

    // Handle household items
    const items = [];
    for (let i = 0; i < 100; i++) {
      const desc = formData.get(`items[${i}][description]`) as string;
      if (!desc) break;
      items.push({
        propertyId: property.id,
        description: desc,
        quantity: parseInt(formData.get(`items[${i}][quantity]`) as string || '1'),
        conditionNote: formData.get(`items[${i}][conditionNote]`) as string || null
      });
    }

    if (items.length > 0) {
      await prisma.householdItem.createMany({
        data: items
      });
    }
    await prisma.$disconnect()

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
