const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  // Create demo client if not exists
  let client = await prisma.rentalClient.findFirst({ where: { name: 'Demo Client John Doe' } });
  if (!client) {
    client = await prisma.rentalClient.create({
      data: {
        name: 'Demo Client John Doe',
        phone: '555-0123',
        email: 'john@example.com',
        driversLicenseNumber: 'DL123456',
        balance: 0
      }
    });
  }

  // Demo damage
  await prisma.clientDamage.create({
    data: {
      rentalClientId: client.id,
      description: 'Rear bumper damage from parking lot accident',
      amount: 850.00,
      status: 'pending',
      accidentDate: new Date('2026-08-05'),
      accidentLocation: 'Store Parking Lot, Main St',
      vehiclesInvolved: 'Our Fleet Vehicle ABC123 vs Client Car XYZ789',
      payerName: 'John Doe',
      payerAddress: '123 Main St, City',
      receiverName: 'Trackit Rental Co',
      receiverAddress: '456 Business Ave, City',
      notes: 'Minor scratch, repair quote attached'
    }
  });

  // Demo payment
  await prisma.clientPayment.create({
    data: {
      rentalClientId: client.id,
      amount: 400.00,
      method: 'bank_transfer',
      totalAgreementAmount: 850.00,
      installmentNumber: 1,
      totalInstallments: 3,
      dueDate: new Date('2026-08-20'),
      lateFeeRate: 1.5,
      notes: 'First installment'
    }
  });

  console.log(`Demo data seeded for client ID ${client.id}. Balance should show $450 owed.`);
}

seed().finally(() => prisma.$disconnect());

