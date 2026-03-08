import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Generate forecasting reports based on sales history and reorder times
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const daysAhead = parseInt(searchParams.get('daysAhead') || '30') // Forecast for next 30 days by default

    // Get all auto parts with their sales history
    const autoParts = await prisma.autoPart.findMany({
      include: {
        saleItems: {
          include: {
            sale: true
          }
        }
      }
    })

    // Calculate sales velocity and generate forecasts
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    const forecasts = autoParts.map(part => {
      // Get sales in last 30 days
      const recentSales = part.saleItems.filter(item => 
        new Date(item.sale.saleDate) >= thirtyDaysAgo
      )
      
      // Get sales in previous 30 days (for trend analysis)
      const previousSales = part.saleItems.filter(item => {
        const saleDate = new Date(item.sale.saleDate)
        return saleDate >= sixtyDaysAgo && saleDate < thirtyDaysAgo
      })

      // Calculate quantity sold in each period
      const recentQtySold = recentSales.reduce((sum, item) => sum + item.quantity, 0)
      const previousQtySold = previousSales.reduce((sum, item) => sum + item.quantity, 0)

      // Calculate daily sales velocity (items per day)
      const recentDailyVelocity = recentQtySold / 30
      const previousDailyVelocity = previousQtySold / 30

      // Calculate trend (percentage change)
      let trend = 0
      if (previousDailyVelocity > 0) {
        trend = ((recentDailyVelocity - previousDailyVelocity) / previousDailyVelocity) * 100
      } else if (recentDailyVelocity > 0) {
        trend = 100 // New item with sales
      }

      // Calculate predicted sales for next N days
      const predictedSales = recentDailyVelocity * daysAhead

      // Calculate days until stockout
      let daysUntilStockout: number | null = null
      if (recentDailyVelocity > 0) {
        daysUntilStockout = Math.floor(part.quantity / recentDailyVelocity)
      }

      // Calculate recommended reorder date
      let recommendedReorderDate: string | null = null
      const reorderTime = part.reorderTime || 7 // Default to 7 days if not set
      
      if (daysUntilStockout !== null && daysUntilStockout <= reorderTime) {
        const reorderDate = new Date(now.getTime() + (daysUntilStockout - reorderTime) * 24 * 60 * 60 * 1000)
        recommendedReorderDate = reorderDate.toISOString().split('T')[0]
      }

      // Calculate reorder quantity recommendation (enough for 60 days + safety stock)
      const safetyStock = Math.ceil(recentDailyVelocity * 7) // 7 days safety stock
      const recommendedReorderQty = Math.ceil(predictedSales * 2) + safetyStock

      return {
        partId: part.id,
        name: part.name,
        make: part.make,
        model: part.model,
        partNumber: part.partNumber,
        currentStock: part.quantity,
        desiredStockLevel: part.desiredStockLevel,
        reorderTime: part.reorderTime || 7,
        recentQtySold,
        previousQtySold,
        dailyVelocity: Math.round(recentDailyVelocity * 100) / 100,
        trend: Math.round(trend * 10) / 10,
        predictedSales: Math.round(predictedSales * 100) / 100,
        daysUntilStockout: daysUntilStockout !== null ? daysUntilStockout : null,
        recommendedReorderDate,
        recommendedReorderQty: recommendedReorderQty > 0 ? recommendedReorderQty : 1,
        status: getStockStatus(part.quantity, part.desiredStockLevel, daysUntilStockout, reorderTime)
      }
    })

    // Sort by urgency (items needing reorder first)
    forecasts.sort((a, b) => {
      if (a.recommendedReorderDate && !b.recommendedReorderDate) return -1
      if (!a.recommendedReorderDate && b.recommendedReorderDate) return 1
      if (a.daysUntilStockout !== null && b.daysUntilStockout !== null) {
        return a.daysUntilStockout - b.daysUntilStockout
      }
      return 0
    })

    // Summary statistics
    const summary = {
      totalParts: autoParts.length,
      partsWithSales: forecasts.filter(f => f.recentQtySold > 0).length,
      partsNeedingReorder: forecasts.filter(f => f.recommendedReorderDate !== null).length,
      outOfStockRisk: forecasts.filter(f => f.daysUntilStockout !== null && f.daysUntilStockout <= 7).length,
      lowStock: forecasts.filter(f => f.status === 'low').length,
      totalPredictedSales: Math.round(forecasts.reduce((sum, f) => sum + f.predictedSales, 0) * 100) / 100
    }

    return NextResponse.json({
      forecastDays: daysAhead,
      summary,
      forecasts
    })
  } catch (error) {
    console.error('Error generating forecast:', error)
    return NextResponse.json({ error: 'Failed to generate forecast' }, { status: 500 })
  }
}

function getStockStatus(quantity: number, desiredLevel: number, daysUntilStockout: number | null, reorderTime: number) {
  if (quantity === 0) return 'out_of_stock'
  if (daysUntilStockout !== null && daysUntilStockout <= reorderTime) return 'reorder_urgent'
  if (desiredLevel > 0 && quantity <= desiredLevel) return 'low'
  return 'normal'
}
