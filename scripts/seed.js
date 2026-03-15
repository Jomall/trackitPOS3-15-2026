const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Mock properties
  await prisma.property.createMany({
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
    ],
    skipDuplicates: true
  })

  // Mock tenants
  await prisma.tenant.createMany({
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
    ],
    skipDuplicates: true
  })

  console.log('Mock data seeded: 2 properties, 3 tenants (2 blacklisted)')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

