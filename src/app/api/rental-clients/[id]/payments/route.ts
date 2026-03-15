import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const clientId = parseInt(params.id)

  try {
    const payments = await prisma.clientPayment.findMany({
      where: { rentalClientId: clientId },
      orderBy: { paymentDate: 'desc' }
    })

    return NextResponse.json(payments)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const clientId = parseInt(params.id)
  const formData = await request.formData()

const data = {
    rentalClientId: clientId,
    amount: parseFloat(formData.get('amount') as string),
    method: formData.get('method') as string,
    notes: formData.get('notes') as string || undefined,
    // New payment terms fields
    totalAgreementAmount: formData.get('totalAgreementAmount') ? parseFloat(formData.get('totalAgreementAmount') as string) : undefined,
    installmentNumber: formData.get('installmentNumber') ? parseInt(formData.get('installmentNumber') as string) : undefined,
    totalInstallments: formData.get('totalInstallments') ? parseInt(formData.get('totalInstallments') as string) : undefined,
    dueDate: formData.get('dueDate') ? new Date(formData.get('dueDate') as string) : undefined,
    lateFeeAmount: formData.get('lateFeeAmount') ? parseFloat(formData.get('lateFeeAmount') as string) : undefined,
    lateFeeRate: formData.get('lateFeeRate') ? parseFloat(formData.get('lateFeeRate') as string) : undefined
  }

  try {
    // Update client balance
    const paymentAmount = parseFloat(formData.get('amount') as string)
    await prisma.rentalClient.update({
      where: { id: clientId },
      data: { balance: { decrement: paymentAmount } }
    })

    const payment = await prisma.clientPayment.create({
      data
    })

    return NextResponse.json({ success: true, payment }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const clientId = parseInt(params.id)
  const paymentId = parseInt(params.id)
  const formData = await request.formData()

  try {
    // Get old payment
    const oldPayment = await prisma.clientPayment.findUnique({ where: { id: paymentId } })
    if (!oldPayment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 })

    const newAmount = parseFloat(formData.get('amount') as string)
    const delta = oldPayment.amount - newAmount  // payment increase -> less negative balance

    await prisma.$transaction([
      prisma.rentalClient.update({
        where: { id: clientId },
        data: { balance: { increment: delta } }
      }),
      prisma.clientPayment.update({
        where: { id: paymentId },
        data: {
          amount: newAmount,
          method: formData.get('method') as string,
          notes: formData.get('notes') as string || undefined,
          totalAgreementAmount: formData.get('totalAgreementAmount') ? parseFloat(formData.get('totalAgreementAmount') as string) : undefined,
          installmentNumber: formData.get('installmentNumber') ? parseInt(formData.get('installmentNumber') as string) : undefined,
          totalInstallments: formData.get('totalInstallments') ? parseInt(formData.get('totalInstallments') as string) : undefined,
          dueDate: formData.get('dueDate') ? new Date(formData.get('dueDate') as string) : undefined,
          lateFeeAmount: formData.get('lateFeeAmount') ? parseFloat(formData.get('lateFeeAmount') as string) : undefined,
          lateFeeRate: formData.get('lateFeeRate') ? parseFloat(formData.get('lateFeeRate') as string) : undefined
        }
      })
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const clientId = parseInt(params.id)
  const paymentId = parseInt(params.id)

  try {
    const payment = await prisma.clientPayment.findUnique({ where: { id: paymentId } })
    if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 })

    await prisma.$transaction([
      prisma.rentalClient.update({
        where: { id: clientId },
        data: { balance: { increment: payment.amount } }
      }),
      prisma.clientPayment.delete({ where: { id: paymentId } })
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 })
  }
}

