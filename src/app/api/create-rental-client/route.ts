import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const data = Object.fromEntries(formData.entries())

    // Save photo if uploaded
    let photoPath = null
    const photoFile = formData.get('driversLicensePhoto') as File | null
    if (photoFile && photoFile.size > 0) {
      const bytes = await photoFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const filename = `dl-${Date.now()}-${photoFile.name}`
      const filepath = path.join(process.cwd(), 'public', 'uploads', filename)
      await writeFile(filepath, buffer)
      photoPath = `/uploads/${filename}`
      data.driversLicensePhoto = photoPath
    }

    // Create in DB
    const client = await prisma.rentalClient.create({
      data: {
        name: data.name as string,
        phone: data.phone as string,
        email: data.email as string,
        driversLicenseNumber: data.driversLicenseNumber as string,
        driversLicensePhoto: photoPath,
        preferredVehicle: data.preferredVehicle as string,
        emergencyContact: data.emergencyContact as string,
        // blacklistStatus handled in frontend, use isBlacklisted: false
      }
    })

    return NextResponse.json({ success: true, client })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to create rental client' }, { status: 500 })
  }
}

