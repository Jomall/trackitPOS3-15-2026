import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Fetch all sales or filter by date
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = searchParams.get('limit')

    const where: any = {}

    if (startDate || endDate) {
      where.saleDate = {}
      if (startDate) where.saleDate.gte = new Date(startDate)
      if (endDate) where.saleDate.lte = new Date(endDate)
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        items: {
          include: {
            autoPart: true
          }
        }
      },
      orderBy: { saleDate: 'desc' },
      take: limit ? parseInt(limit) : undefined
    })

    return NextResponse.json(sales)
  } catch (error) {
    console.error('Error fetching sales:', error)
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 })
  }
}

// POST - Create new sale with tax and discount support
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, paymentMethod, customerName, customerPhone, customerEmail, notes, taxRate, discountType, discountValue } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in sale' }, { status: 400 })
    }

    // Calculate subtotal and validate stock
    let subtotal = 0
    const saleItemsData = []

    for (const item of items) {
      const autoPart = await prisma.autoPart.findUnique({
        where: { id: item.autoPartId }
      })

      if (!autoPart) {
        return NextResponse.json({ error: `Auto part ${item.autoPartId} not found` }, { status: 400 })
      }

      if (autoPart.quantity < item.quantity) {
        return NextResponse.json({ 
          error: `Insufficient stock for ${autoPart.name}. Available: ${autoPart.quantity}` 
        }, { status: 400 })
      }

      const itemSubtotal = (autoPart.price || 0) * item.quantity
      subtotal += itemSubtotal

      saleItemsData.push({
        autoPartId: item.autoPartId,
        quantity: item.quantity,
        unitPrice: autoPart.price || 0,
        subtotal: itemSubtotal
      })
    }

    // Calculate discount
    let discountAmount = 0
    if (discountType === 'percentage' && discountValue) {
      discountAmount = subtotal * (discountValue / 100)
    } else if (discountType === 'fixed' && discountValue) {
      discountAmount = Math.min(discountValue, subtotal)
    }

    // Calculate tax
    const appliedTaxRate = taxRate || 0
    const taxableAmount = subtotal - discountAmount
    const taxAmount = taxableAmount > 0 ? taxableAmount * (appliedTaxRate / 100) : 0

    // Calculate total
    const totalAmount = taxableAmount + taxAmount

    // Create sale transaction with all tax and discount fields
    const sale = await prisma.sale.create({
      data: {
        subtotal: subtotal,
        taxAmount: taxAmount,
        taxRate: appliedTaxRate,
        discountAmount: discountAmount,
        discountType: discountType,
        discountValue: discountValue,
        totalAmount: totalAmount,
        paymentMethod,
        customerName,
        customerPhone,
        customerEmail,
        notes: notes || null,
        items: {
          create: saleItemsData
        }
      },
      include: {
        items: {
          include: {
            autoPart: true
          }
        }
      }
    })

    // Update inventory (reduce stock)
    for (const item of items) {
      await prisma.autoPart.update({
        where: { id: item.autoPartId },
        data: {
          quantity: {
            decrement: item.quantity
          },
          lastStockUpdate: new Date(),
          lastUpdated: new Date()
        }
      })
    }

    return NextResponse.json(sale, { status: 201 })
  } catch (error) {
    console.error('Error creating sale:', error)
    return NextResponse.json({ error: 'Failed to create sale' }, { status: 500 })
  }
}

// DELETE - Delete a sale
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // First, restore inventory
    const sale = await prisma.sale.findUnique({
      where: { id: parseInt(id) },
      include: { items: true }
    })

    if (sale) {
      for (const item of sale.items) {
        await prisma.autoPart.update({
          where: { id: item.autoPartId },
          data: {
            quantity: {
              increment: item.quantity
            },
            lastStockUpdate: new Date()
          }
        })
      }
    }

    await prisma.sale.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ message: 'Sale deleted successfully' })
  } catch (error) {
    console.error('Error deleting sale:', error)
    return NextResponse.json({ error: 'Failed to delete sale' }, { status: 500 })
  }
}
