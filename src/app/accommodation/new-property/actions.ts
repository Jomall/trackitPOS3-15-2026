'use server'
import { PrismaClient } from '@prisma/client'
import { redirect } from 'next/navigation'

const prisma = new PrismaClient()

export async function createPropertyAction(_prevState: any, formData: FormData): Promise<{ message: string }> {
  const propertyData = {
    propertyId: formData.get('propertyId') as string,
    name: formData.get('name') as string,
    address: formData.get('address') as string,
    occupancyLimit: parseInt(formData.get('occupancyLimit') as string),
    rentAmount: parseFloat(formData.get('rentAmount') as string),
    depositAmount: parseFloat(formData.get('depositAmount') as string || '0'),
    amenities: formData.get('amenities') as string || '',
    status: 'AVAILABLE'
  }

  await prisma.property.create({
    data: propertyData
  })

  return { message: 'Property created successfully! Redirecting...' }
}
