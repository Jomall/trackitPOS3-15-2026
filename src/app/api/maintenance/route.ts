import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

// GET all maintenances or search with filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const vehicleId = searchParams.get('vehicleId')
    const type = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const minCost = searchParams.get('minCost')
    const maxCost = searchParams.get('maxCost')
    
    const where: any = {}
    
    // Filter by vehicle ID
    if (vehicleId) {
      where.vehicleId = parseInt(vehicleId)
    }
    
    // Filter by maintenance type
    if (type) {
      where.type = { contains: type }
    }
    
    // Filter by date range
    if (startDate || endDate) {
      where.date = {}
      if (startDate) {
        where.date.gte = new Date(startDate)
      }
      if (endDate) {
        where.date.lte = new Date(endDate)
      }
    }
    
    // Filter by cost range
    if (minCost || maxCost) {
      where.cost = {}
      if (minCost) {
        where.cost.gte = parseFloat(minCost)
      }
      if (maxCost) {
        where.cost.lte = parseFloat(maxCost)
      }
    }
    
    // Search across multiple fields
    if (search) {
      where.OR = [
        { type: { contains: search } },
        { description: { contains: search } },
        { notes: { contains: search } },
        { vehicle: { make: { contains: search } } },
        { vehicle: { model: { contains: search } } },
        { vehicle: { year: { equals: parseInt(search) || 0 } } },
        { vehicle: { vin: { contains: search } } },
        { vehicle: { licensePlate: { contains: search } } },
      ]
    }
    
    const maintenances = await prisma.maintenance.findMany({
      where,
      include: {
        vehicle: true,
      },
      orderBy: { date: 'desc' },
    })
    
    return NextResponse.json(maintenances)
  } catch (error) {
    console.error('Error fetching maintenances:', error)
    return NextResponse.json({ error: 'Failed to fetch maintenances' }, { status: 500 })
  }
}

// POST - Create a new maintenance record
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { vehicleId, type, description, date, nextDue, cost, notes } = body
    
    const maintenance = await prisma.maintenance.create({
      data: {
        vehicleId: parseInt(vehicleId),
        type,
        description: description || null,
        date: new Date(date),
        nextDue: nextDue ? new Date(nextDue) : null,
        cost: cost ? parseFloat(cost) : null,
        notes: notes || null,
      },
      include: {
        vehicle: true,
      },
    })
    
    return NextResponse.json(maintenance, { status: 201 })
  } catch (error) {
    console.error('Error creating maintenance:', error)
    return NextResponse.json({ error: 'Failed to create maintenance record' }, { status: 500 })
  }
}

// PUT - Update a maintenance record
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, vehicleId, type, description, date, nextDue, cost, notes } = body
    
    const maintenance = await prisma.maintenance.update({
      where: { id: parseInt(id) },
      data: {
        vehicleId: parseInt(vehicleId),
        type,
        description: description || null,
        date: new Date(date),
        nextDue: nextDue ? new Date(nextDue) : null,
        cost: cost ? parseFloat(cost) : null,
        notes: notes || null,
      },
      include: {
        vehicle: true,
      },
    })
    
    return NextResponse.json(maintenance)
  } catch (error) {
    console.error('Error updating maintenance:', error)
    return NextResponse.json({ error: 'Failed to update maintenance record' }, { status: 500 })
  }
}

// DELETE - Delete a maintenance record
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Maintenance ID required' }, { status: 400 })
    }
    
    await prisma.maintenance.delete({
      where: { id: parseInt(id) },
    })
    
    return NextResponse.json({ message: 'Maintenance record deleted successfully' })
  } catch (error) {
    console.error('Error deleting maintenance:', error)
    return NextResponse.json({ error: 'Failed to delete maintenance record' }, { status: 500 })
  }
}
