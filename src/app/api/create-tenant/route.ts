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
    
    const tenantData = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string || null,
      email: formData.get('email') as string || null,
      idNumber: formData.get('idNumber') as string || null,
      idPhoto: formData.get('idPhoto') as string || null,
      requiresSecurityDeposit: formData.get('requiresSecurityDeposit') === 'on',
      securityDepositAmount: formData.get('securityDepositAmount') ? parseFloat(formData.get('securityDepositAmount') as string) : null,
      securityDepositCollected: formData.get('securityDepositCollected') === 'on',
      emergencyContact: formData.get('emergencyContact') as string || null,
    }

    const tenant = await prisma.tenant.create({
      data: tenantData
    })

    return NextResponse.json({ 
      success: true, 
      tenant: {
        id: tenant.id,
        name: tenant.name
      } 
    })
  } catch (error) {
    console.error('Create tenant error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create tenant' 
    }, { status: 500 })
  }
}
