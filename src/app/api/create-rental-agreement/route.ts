import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Simple duration calc helper
function calculateDuration(startDate: Date, endDate: Date | null, type: string): number {
  if (!endDate) return 0
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  if (type === 'daily') return days
  if (type === 'weekly') return Math.ceil(days / 7)
  if (type === 'monthly') return Math.ceil(days / 30)
  return 1 // lease fixed
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const vehicleId = parseInt(formData.get('vehicleId') as string)
    const rentalClientId = parseInt(formData.get('rentalClientId') as string)
    const agreementType = formData.get('agreementType') as string
    const startDateStr = formData.get('startDate') as string
    const endDateStr = formData.get('endDate') as string
    const dailyAmount = parseFloat(formData.get('dailyAmount') as string || '0')
    const weeklyAmount = parseFloat(formData.get('weeklyAmount') as string || '0')
    const monthlyAmount = parseFloat(formData.get('monthlyAmount') as string || '0')
    const leaseAmount = parseFloat(formData.get('leaseAmount') as string || '0')
    const depositAmount = parseFloat(formData.get('depositAmount') as string || '0')
    const lateFee = parseFloat(formData.get('lateFee') as string || '0')
    const lateFeeAfterDays = parseInt(formData.get('lateFeeAfterDays') as string || '0')

    const startDate = new Date(startDateStr)
    const endDate = endDateStr ? new Date(endDateStr) : null

    // Validate
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } })
    if (!vehicle || (vehicle as any).status !== 'Available') {
      return NextResponse.json({ error: 'Vehicle not available' }, { status: 400 })
    }

    const client = await prisma.rentalClient.findUnique({ where: { id: rentalClientId } })
    if (!client || client.isBlacklisted) {
      return NextResponse.json({ error: 'Client invalid or blacklisted' }, { status: 400 })
    }

    // Calc rate based on type
    let rate = 0
    if (agreementType === 'daily') rate = dailyAmount
    else if (agreementType === 'weekly') rate = weeklyAmount
    else if (agreementType === 'monthly') rate = monthlyAmount
    else if (agreementType === 'fixed-lease') rate = leaseAmount

    const duration = calculateDuration(startDate, endDate, agreementType)
    const totalRental = rate * duration
    const balance = totalRental + depositAmount

    // Gen number
    const latest = (prisma as any).vehicleRentalAgreement.findFirst({
      orderBy: { id: 'desc' }
    })
    const seq = latest ? latest.id + 1 : 1
    const agreementNumber = `VRA-${new Date().getFullYear()}-${seq.toString().padStart(4, '0')}`

    // Create
    const agreement = (prisma as any).vehicleRentalAgreement.create({
      data: {
        agreementNumber,
        vehicleId,
        rentalClientId,
        agreementType,
        startDate,
        endDate,
        dailyAmount: agreementType === 'daily' ? dailyAmount : null,
        weeklyAmount: agreementType === 'weekly' ? weeklyAmount : null,
        monthlyAmount: agreementType === 'monthly' ? monthlyAmount : null,
        leaseAmount: agreementType === 'fixed-lease' ? leaseAmount : null,
        depositAmount,
        lateFee,
        lateFeeAfterDays,
        balance
      }
    })

    // Update vehicle
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { status: 'Rented' as any }
    })

    return NextResponse.json({ success: true, agreement }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create rental agreement' }, { status: 500 })
  }
}

