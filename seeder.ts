// import { PrismaClient } from '@prisma/client' // Ignore TS error - runtime works
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Starting seed...')

  // Clear existing data for idempotency
  await prisma.property.deleteMany({})
  await prisma.tenant.deleteMany({})
  console.log('🗑️ Cleared existing properties and tenants')

  // Mock properties
  const properties = await prisma.property.createMany({
    data: [
      {
        propertyId: 'APT101',
        name: 'Studio Apartment 1A',
        address: '123 Main St, Cityville',
        occupancyLimit: 2,
        rentAmount: 1200,
        status: 'AVAILABLE'
      },
      {
        propertyId: 'ROOM205',
        name: 'Deluxe Room 205',
        address: '456 Oak Ave, Cityville',
        occupancyLimit: 1,
        rentAmount: 850,
        status: 'AVAILABLE'
      }
    ]
  })
  console.log(`🏠 Seeded ${properties.count || 2} properties`)

  // Mock tenants
  const tenants = await prisma.tenant.createMany({
    data: [
      {
        name: 'John Doe',
        phone: '+1 (555) 123-4567',
        email: 'john@example.com',
        idNumber: 'ID123456',
        emergencyContact: 'Jane Doe - +1 (555) 987-6543',
        isBlacklisted: false
      },
      {
        name: 'Jane Smith',
        phone: '+1 (555) 987-6543',
        email: 'jane@example.com',
        idNumber: 'ID789012',
        emergencyContact: 'Bob Smith - +1 (555) 111-2222',
        isBlacklisted: true,
        blacklistReason: 'Previous bad experience - property damage',
        blacklistUntil: null // indefinite
      },
      {
        name: 'Bob Johnson',
        phone: '+1 (555) 444-5555',
        email: 'bob@example.com',
        idNumber: 'ID345678',
        emergencyContact: 'Alice Johnson - +1 (555) 666-7777',
        isBlacklisted: true,
        blacklistReason: 'Non-payment of rent',
        blacklistUntil: new Date('2026-06-01') // temp
      }
    ]
  })
  console.log(`👥 Seeded ${tenants.count || 3} tenants`)

  const count = await prisma.tenant.count()
  console.log(`✅ Database ready! Total tenants: ${count}. Visit /accommodation/tenants`)
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => await prisma.$disconnect())

