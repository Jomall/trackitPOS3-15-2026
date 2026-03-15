import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)

  try {
const client = await prisma.rentalClient.findUnique({
      where: { id },
      include: {
        damages: {
          orderBy: { date: 'desc' }
        },
        payments: {
          orderBy: { paymentDate: 'desc' }
        }
      }
    })

    if (!client) {
      return NextResponse.json({ error: 'Rental client not found' }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  const formData = await request.formData()

  const data = Object.fromEntries(formData.entries())

  try {
    const client = await prisma.rentalClient.update({
      where: { id },
      data,
    })

    return NextResponse.json({ success: true, client })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)

  try {
    await prisma.rentalClient.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 })
  }
}
