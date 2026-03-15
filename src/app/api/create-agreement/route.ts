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
    
    const agreementData = {
      agreementNumber: `RA-${Date.now()}`,
      propertyId: parseInt(formData.get('propertyId') as string),
      tenantId: parseInt(formData.get('tenantId') as string),
      startDate: new Date(formData.get('startDate') as string),
      rentAmount: parseFloat(formData.get('rentAmount') as string),
      depositAmount: parseFloat(formData.get('depositAmount') as string || '0'),
      status: 'ACTIVE'
    }

    const agreement = await prisma.rentalAgreement.create({
      data: agreementData,
      include: {
        property: true,
        tenant: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      agreement: {
        id: agreement.id,
        agreementNumber: agreement.agreementNumber
      }
    })
  } catch (error) {
    console.error('Create agreement error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create agreement' 
    }, { status: 500 })
  }
}
