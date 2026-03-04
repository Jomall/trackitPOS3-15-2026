import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

// GET all vehicles or search vehicles
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    
    let vehicles
    if (search) {
      vehicles = await prisma.vehicle.findMany({
        where: {
          OR: [
            { make: { contains: search } },
            { model: { contains: search } },
            { year: { equals: parseInt(search) || 0 } },
            { vin: { contains: search } },
            { licensePlate: { contains: search } },
          ],
        },
        include: {
          maintenances: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    } else {
      vehicles = await prisma.vehicle.findMany({
        include: {
          maintenances: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    }
    
    return NextResponse.json(vehicles)
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 })
  }
}

// POST - Create a new vehicle
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { make, model, year, vin, licensePlate, notes } = body
    
    // Check if VIN already exists
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { vin },
    })
    
    if (existingVehicle) {
      return NextResponse.json({ error: 'Vehicle with this VIN already exists' }, { status: 400 })
    }
    
    const vehicle = await prisma.vehicle.create({
      data: {
        make,
        model,
        year: parseInt(year),
        vin,
        licensePlate,
        notes: notes || null,
      },
    })
    
    return NextResponse.json(vehicle, { status: 201 })
  } catch (error) {
    console.error('Error creating vehicle:', error)
    return NextResponse.json({ error: 'Failed to create vehicle' }, { status: 500 })
  }
}

// PUT - Update a vehicle
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, make, model, year, vin, licensePlate, notes } = body
    
    const vehicle = await prisma.vehicle.update({
      where: { id: parseInt(id) },
      data: {
        make,
        model,
        year: parseInt(year),
        vin,
        licensePlate,
        notes: notes || null,
      },
    })
    
    return NextResponse.json(vehicle)
  } catch (error) {
    console.error('Error updating vehicle:', error)
    return NextResponse.json({ error: 'Failed to update vehicle' }, { status: 500 })
  }
}

// DELETE - Delete a vehicle
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Vehicle ID required' }, { status: 400 })
    }
    
    // Delete associated maintenances first
    await prisma.maintenance.deleteMany({
      where: { vehicleId: parseInt(id) },
    })
    
    await prisma.vehicle.delete({
      where: { id: parseInt(id) },
    })
    
    return NextResponse.json({ message: 'Vehicle deleted successfully' })
  } catch (error) {
    console.error('Error deleting vehicle:', error)
    return NextResponse.json({ error: 'Failed to delete vehicle' }, { status: 500 })
  }
}
