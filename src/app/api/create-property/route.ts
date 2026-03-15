'use server'
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

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
      status: 'AVAILABLE'
    }

    await prisma.property.create({
      data: propertyData
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
