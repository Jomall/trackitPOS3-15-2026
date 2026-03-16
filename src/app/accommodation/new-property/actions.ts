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
    furnishingType: formData.get('furnishingType') as string || 'unfurnished',
    status: 'AVAILABLE'
  }

  const property = await prisma.property.create({
    data: propertyData
  })

  // Create household items if furnished
  const householdItems: any[] = [];
  let i = 0;
  while (true) {
    const description = formData.get(`items[${i}][description]`) as string;
    if (!description) break;
    householdItems.push({
      propertyId: property.id,
      description,
      quantity: parseInt(formData.get(`items[${i}][quantity]`) as string || '1'),
      conditionNote: formData.get(`items[${i}][conditionNote]`) as string || null,
    });
    i++;
  }
  if (householdItems.length > 0) {
    await prisma.householdItem.createMany({
      data: householdItems,
    });
  }

  return { message: 'Property created successfully with inventory! Redirecting...' }
}

