'use server'
// import { PrismaClient } from '@prisma/client'
const { PrismaClient } = require('@prisma/client')
import { redirect } from 'next/navigation'

const prisma: any = new PrismaClient()

export async function POST(request: Request) {
  const formData = await request.formData()
  const tenantId = parseInt(formData.get('tenantId') as string)

  // Check blacklist status
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId }
  })

  if (tenant?.isBlacklisted) {
    const now = new Date()
    const stillBlacklisted = !tenant.blacklistUntil || tenant.blacklistUntil > now
    if (stillBlacklisted) {
      throw new Error(`Tenant "${tenant.name}" is blacklisted${tenant.blacklistUntil ? ` until ${tenant.blacklistUntil.toLocaleDateString()}` : ' indefinitely'}. Cannot create agreement.`)
    }
  }

  const agreementData = {
    agreementNumber: `RA-${Date.now()}`,
    propertyId: parseInt(formData.get('propertyId') as string),
    tenantId,
    startDate: new Date(formData.get('startDate') as string),
    rentAmount: parseFloat(formData.get('rentAmount') as string),
    depositAmount: parseFloat(formData.get('depositAmount') as string || '0'),
    status: 'ACTIVE'
  }

  await prisma.rentalAgreement.create({
    data: agreementData
  })

  redirect('/accommodation')
}
