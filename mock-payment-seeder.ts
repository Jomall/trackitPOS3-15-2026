import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedMockPayments() {
  console.log('🧪 Seeding mock payment data...')

  // Create agreements if needed
  const property = await prisma.property.upsert({
    where: { propertyId: 'APT001' },
    update: {},
    create: {
      propertyId: 'APT001',
      name: 'Studio Apartment 1A',
      address: '123 Demo St, Trackit City',
      occupancyLimit: 2,
      rentAmount: 12000,
      depositAmount: 12000,
      status: 'AVAILABLE'
    }
  })

  const tenant = await prisma.tenant.upsert({
    where: { id: 1 }, // Jon Doe
    update: {},
    create: {
      name: 'Jon Doe',
      phone: '+1-555-0123',
      idNumber: 'ID123456',
      email: 'jon@example.com'
    }
  })

  const agreement = await prisma.rentalAgreement.upsert({
    where: { agreementNumber: 'RA-TEST-001' },
    update: {},
    create: {
      agreementNumber: 'RA-TEST-001',
      propertyId: property.id,
      tenantId: tenant.id,
      startDate: new Date('2026-01-01'),
      rentAmount: 12000,
      depositAmount: 12000,
      status: 'ACTIVE'
    }
  })

// Mock payments
  await prisma.rentalPayment.create({
    data: {
      agreementId: agreement.id,
      amount: 300,
      paymentDate: new Date('2026-01-15'),
      method: 'cash',
      receiptNumber: 'REC-300-001'
    }
  })

  const expectedMonths = Math.ceil((new Date('2026-08-01').getFullYear() - new Date('2026-01-01').getFullYear()) * 12 + 
    (new Date('2026-08-01').getMonth() - new Date('2026-01-01').getMonth()))
  const expected = agreement.rentAmount * expectedMonths
  console.log(`📊 Mock Data Ready:
  - Tenant: ${tenant.name} (ID: ${tenant.id})
  - Agreement: RA-TEST-001 ($12000/mo since Jan 2026)
  - Payment: $300 (Jan 15)
  - Expected (${expectedMonths}mo): $${expected}
  - Outstanding: ~$${(expected - 300).toLocaleString()}`)

  console.log('✅ Mock payments seeded! Visit /accommodation/tenants/1')
}

seedMockPayments()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
