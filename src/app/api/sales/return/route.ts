import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Process a return
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { saleId, items, returnReason, refundMethod, returnAmount } = body

    if (!saleId) {
      return NextResponse.json({ error: 'Sale ID is required' }, { status: 400 })
    }

    // Find the original sale
    const originalSale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        items: {
          include: {
            autoPart: true
          }
        }
      }
    })

    if (!originalSale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 })
    }

    // Determine which items to return and calculate amount
    let itemsToReturn = originalSale.items
    let totalReturnAmount = returnAmount || originalSale.totalAmount

    if (items && items.length > 0) {
      // Partial return - only return specific items
      itemsToReturn = originalSale.items.filter(saleItem => 
        items.some(returnItem => returnItem.saleItemId === saleItem.id)
      )
      
      // Calculate partial return amount
      totalReturnAmount = itemsToReturn.reduce((sum, item) => sum + item.subtotal, 0)
    } else if (returnAmount && returnAmount > 0) {
      // Full return with specified amount - return all items but possibly different amount
      // This handles the case where tax/discounts were applied
      totalReturnAmount = returnAmount
    }

    // Restore inventory for returned items
    for (const item of itemsToReturn) {
      await prisma.autoPart.update({
        where: { id: item.autoPartId },
        data: {
          quantity: {
            increment: item.quantity
          },
          lastStockUpdate: new Date(),
          lastUpdated: new Date()
        }
      })
    }

    // Store return info in notes
    const returnNotes = JSON.stringify({
      originalSaleId: saleId,
      returnReason: returnReason,
      refundMethod: refundMethod || 'original_payment',
      returnedItems: itemsToReturn.map(item => ({
        name: item.autoPart.name,
        quantity: item.quantity,
        amount: item.subtotal
      }))
    })

    // Create a return record - use negative amounts to indicate this is a return
    const returnSale = await prisma.sale.create({
      data: {
        subtotal: -totalReturnAmount,
        totalAmount: -totalReturnAmount,
        taxAmount: 0,
        taxRate: 0,
        discountAmount: 0,
        paymentMethod: refundMethod || 'refund',
        customerName: originalSale.customerName,
        customerPhone: originalSale.customerPhone,
        notes: returnNotes,
        items: {
          create: itemsToReturn.map(item => ({
            autoPartId: item.autoPartId,
            quantity: -item.quantity,
            unitPrice: item.unitPrice,
            subtotal: -item.subtotal
          }))
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

    return NextResponse.json({
      message: 'Return processed successfully',
      returnSale,
      refundedAmount: totalReturnAmount,
      originalSaleId: saleId
    }, { status: 201 })

  } catch (error) {
    console.error('Error processing return:', error)
    return NextResponse.json({ error: 'Failed to process return' }, { status: 500 })
  }
}

// GET - Get return history
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const saleId = searchParams.get('saleId')

    if (saleId) {
      // Find returns for a specific original sale
      const returns = await prisma.sale.findMany({
        where: {
          notes: {
            contains: `"originalSaleId":${saleId}`
          }
        },
        include: {
          items: {
            include: {
              autoPart: true
            }
          }
        },
        orderBy: { saleDate: 'desc' }
      })
      return NextResponse.json(returns)
    }

    // Get all returns (sales with negative totalAmount)
    const returns = await prisma.sale.findMany({
      where: {
        totalAmount: { lt: 0 }
      },
      include: {
        items: {
          include: {
            autoPart: true
          }
        }
      },
      orderBy: { saleDate: 'desc' }
    })

    return NextResponse.json(returns)
  } catch (error) {
    console.error('Error fetching returns:', error)
    return NextResponse.json({ error: 'Failed to fetch returns' }, { status: 500 })
  }
}
