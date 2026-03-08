import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Generate sales reports
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const reportType = searchParams.get('type') || 'daily' // daily, weekly, monthly, custom
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const make = searchParams.get('make')

    let dateFilter: { gte: Date; lte: Date } | undefined
    
    const now = new Date()
    
    if (reportType === 'daily') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
      dateFilter = { gte: startOfDay, lte: endOfDay }
    } else if (reportType === 'weekly') {
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
      dateFilter = { gte: startOfWeek, lte: now }
    } else if (reportType === 'monthly') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      dateFilter = { gte: startOfMonth, lte: now }
    } else if (startDate && endDate) {
      dateFilter = { gte: new Date(startDate), lte: new Date(endDate) }
    }

    const where: any = {}
    if (dateFilter) {
      where.saleDate = dateFilter
    }

    // Get all sales in the date range
    const sales = await prisma.sale.findMany({
      where,
      include: {
        items: {
          include: {
            autoPart: true
          }
        }
      },
      orderBy: { saleDate: 'desc' }
    })

    // Calculate totals
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0)
    const totalTransactions = sales.length
    const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

    // Sales by date
    const salesByDate: Record<string, { date: string; revenue: number; transactions: number }> = {}
    sales.forEach(sale => {
      const dateKey = sale.saleDate.toISOString().split('T')[0]
      if (!salesByDate[dateKey]) {
        salesByDate[dateKey] = { date: dateKey, revenue: 0, transactions: 0 }
      }
      salesByDate[dateKey].revenue += sale.totalAmount
      salesByDate[dateKey].transactions += 1
    })

    // Sales by item
    const salesByItem: Record<number, { partId: number; name: string; quantity: number; revenue: number }> = {}
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!salesByItem[item.autoPartId]) {
          salesByItem[item.autoPartId] = {
            partId: item.autoPartId,
            name: item.autoPart.name,
            quantity: 0,
            revenue: 0
          }
        }
        salesByItem[item.autoPartId].quantity += item.quantity
        salesByItem[item.autoPartId].revenue += item.subtotal
      })
    })

    // Filter by make if specified
    let filteredSalesByItem = Object.values(salesByItem)
    if (make) {
      filteredSalesByItem = filteredSalesByItem.filter(item => {
        const part = sales.flatMap(s => s.items).find(i => i.autoPartId === item.partId)
        return part?.autoPart.make === make
      })
    }

    // Top selling items
    const topSellingItems = filteredSalesByItem
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)

    // Sales by payment method
    const salesByPayment: Record<string, number> = {}
    sales.forEach(sale => {
      const method = sale.paymentMethod || 'Unknown'
      salesByPayment[method] = (salesByPayment[method] || 0) + sale.totalAmount
    })

    // Get unique makes for filter
    const allItems = await prisma.autoPart.findMany({
      select: { make: true }
    })
    const uniqueMakes = Array.from(new Set(allItems.map(item => item.make).filter(Boolean)))

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalTransactions,
        averageTransaction,
        dateRange: dateFilter ? {
          start: dateFilter.gte,
          end: dateFilter.lte
        } : null
      },
      salesByDate: Object.values(salesByDate).sort((a, b) => a.date.localeCompare(b.date)),
      topSellingItems,
      salesByPayment,
      uniqueMakes,
      sales: sales.slice(0, 50) // Limit to recent 50 sales for detailed view
    })
  } catch (error) {
    console.error('Error generating sales report:', error)
    return NextResponse.json({ error: 'Failed to generate sales report' }, { status: 500 })
  }
}
