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

export async function GET(request: Request, { params }: { params: { tenantId: string } }) {
  try {
    const tenantId = parseInt(params.tenantId)
    
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        agreements: {
          include: {
            property: true,
            payments: {
              orderBy: { paymentDate: 'desc' }
            }
          }
        }
      }
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    const payments = tenant.agreements.flatMap(a => a.payments.map(p => ({ ...p, agreement: a })))

    return NextResponse.json({ tenant, payments })
  } catch (error) {
    console.error('Payments error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { tenantId: string } }) {
  try {
    const tenantId = parseInt(params.tenantId)
    const formData = await request.formData()

    const paymentData = {
      agreementId: parseInt(formData.get('agreementId') as string),
      amount: parseFloat(formData.get('amount') as string),
      paymentDate: new Date(formData.get('paymentDate') as string),
      method: formData.get('method') as string,
      receiptNumber: `REC-${Date.now()}`
    }

    const payment = await prisma.rentalPayment.create({
      data: paymentData,
      include: {
        agreement: {
          include: {
            tenant: true,
            property: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, payment })
  } catch (error) {
    console.error('Create payment error:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}

