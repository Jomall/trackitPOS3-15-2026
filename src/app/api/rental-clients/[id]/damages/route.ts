import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const clientId = parseInt(params.id)

  try {
    const damages = await prisma.clientDamage.findMany({
      where: { rentalClientId: clientId },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(damages)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch damages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const clientId = parseInt(params.id)
  const formData = await request.formData()

  const data = {
    rentalClientId: clientId,
    description: formData.get('description') as string,
    amount: parseFloat(formData.get('amount') as string),
    notes: formData.get('notes') as string || undefined,
    status: formData.get('status') as string || 'pending',
    // New fields
    accidentDate: formData.get('accidentDate') ? new Date(formData.get('accidentDate') as string) : undefined,
    accidentLocation: formData.get('accidentLocation') as string || undefined,
    vehiclesInvolved: formData.get('vehiclesInvolved') as string || undefined,
    payerName: formData.get('payerName') as string || undefined,
    payerAddress: formData.get('payerAddress') as string || undefined,
    receiverName: formData.get('receiverName') as string || undefined,
    receiverAddress: formData.get('receiverAddress') as string || undefined
  }

  try {
    // Update client balance
    const damageAmount = parseFloat(formData.get('amount') as string)
    await prisma.rentalClient.update({
      where: { id: clientId },
      data: { balance: { increment: damageAmount } }
    })

    const damage = await prisma.clientDamage.create({
      data
    })

    return NextResponse.json({ success: true, damage }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create damage record' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const clientId = parseInt(params.id)
  const damageId = parseInt(params.id)
  const formData = await request.formData()

  try {
    // Get old damage to calc delta
    const oldDamage = await prisma.clientDamage.findUnique({ where: { id: damageId } })
    if (!oldDamage) return NextResponse.json({ error: 'Damage not found' }, { status: 404 })

    const newAmount = parseFloat(formData.get('amount') as string)
    const delta = newAmount - oldDamage.amount

    // Update balance and damage
    await prisma.$transaction([
      prisma.rentalClient.update({
        where: { id: clientId },
        data: { balance: { increment: delta } }
      }),
      prisma.clientDamage.update({
        where: { id: damageId },
        data: {
          description: formData.get('description') as string,
          amount: newAmount,
          notes: formData.get('notes') as string || undefined,
          status: formData.get('status') as string || 'pending',
          accidentDate: formData.get('accidentDate') ? new Date(formData.get('accidentDate') as string) : undefined,
          accidentLocation: formData.get('accidentLocation') as string || undefined,
          vehiclesInvolved: formData.get('vehiclesInvolved') as string || undefined,
          payerName: formData.get('payerName') as string || undefined,
          payerAddress: formData.get('payerAddress') as string || undefined,
          receiverName: formData.get('receiverName') as string || undefined,
          receiverAddress: formData.get('receiverAddress') as string || undefined
        }
      })
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update damage' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const clientId = parseInt(params.id)
  const damageId = parseInt(params.id)
  
  try {
    // Get damage amount to refund
    const damage = await prisma.clientDamage.findUnique({ where: { id: damageId } })
    if (!damage) return NextResponse.json({ error: 'Damage not found' }, { status: 404 })

    await prisma.$transaction([
      prisma.rentalClient.update({
        where: { id: clientId },
        data: { balance: { decrement: damage.amount } }
      }),
      prisma.clientDamage.delete({ where: { id: damageId } })
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to delete damage' }, { status: 500 })
  }
}

