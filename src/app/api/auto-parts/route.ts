import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Fetch all auto parts or filter
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const make = searchParams.get('make')
    const zone = searchParams.get('zone')
    const stockStatus = searchParams.get('stockStatus')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { make: { contains: search } },
        { partNumber: { contains: search } },
        { description: { contains: search } },
        { licensePlate: { contains: search } },
        { vin: { contains: search } },
        { purchaseLocation: { contains: search } },
        { zone: { contains: search } },
      ]
    }

    if (make) where.make = make
    if (zone) where.zone = zone

    const parts = await prisma.autoPart.findMany({
      where,
      orderBy: { name: 'asc' }
    })

    // Filter by stock status
    let filteredParts = parts
    if (stockStatus) {
      filteredParts = parts.filter(part => {
        if (stockStatus === 'out') return part.quantity === 0
        if (stockStatus === 'low') return part.desiredStockLevel > 0 && part.quantity > 0 && part.quantity <= part.desiredStockLevel
        if (stockStatus === 'normal') return part.desiredStockLevel > 0 && part.quantity > part.desiredStockLevel
        if (stockStatus === 'overstocked') return part.desiredStockLevel > 0 && part.quantity >= part.desiredStockLevel * 2
        return true
      })
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      filteredParts = filteredParts.filter(part => {
        const price = part.price || 0
        if (minPrice && price < parseFloat(minPrice)) return false
        if (maxPrice && price > parseFloat(maxPrice)) return false
        return true
      })
    }

    return NextResponse.json(filteredParts)
  } catch (error) {
    console.error('Error fetching auto parts:', error)
    return NextResponse.json({ error: 'Failed to fetch auto parts' }, { status: 500 })
  }
}

// POST - Create new auto part
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const autoPart = await prisma.autoPart.create({
      data: {
        name: body.name,
        make: body.make,
        partNumber: body.partNumber,
        description: body.description,
        quantity: body.quantity || 0,
        price: body.price,
        photo: body.photo,
        licensePlate: body.licensePlate,
        vin: body.vin,
        purchaseLocation: body.purchaseLocation,
        desiredStockLevel: body.desiredStockLevel || 0,
        zone: body.zone,
      }
    })

    return NextResponse.json(autoPart, { status: 201 })
  } catch (error) {
    console.error('Error creating auto part:', error)
    return NextResponse.json({ error: 'Failed to create auto part' }, { status: 500 })
  }
}

// PUT - Update auto part
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    const autoPart = await prisma.autoPart.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        lastUpdated: new Date(),
      }
    })

    return NextResponse.json(autoPart)
  } catch (error) {
    console.error('Error updating auto part:', error)
    return NextResponse.json({ error: 'Failed to update auto part' }, { status: 500 })
  }
}

// DELETE - Delete auto part
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await prisma.autoPart.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ message: 'Auto part deleted successfully' })
  } catch (error) {
    console.error('Error deleting auto part:', error)
    return NextResponse.json({ error: 'Failed to delete auto part' }, { status: 500 })
  }
}
