import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seed() {
  // Clear existing (ignore if no data)
  try {
    await prisma.rentalClient.deleteMany()
  } catch {}
  try {
    await prisma.vehicle.deleteMany()
  } catch {}

  // Seed 10 RentalClients (some blacklisted)
  const clientsData = [
    {
      name: 'John Doe',
      phone: '+1-555-0101',
      email: 'john@example.com',
      driversLicenseNumber: 'DL123456',
      driversLicensePhoto: null,
      preferredVehicle: 'Sedan',
      emergencyContact: 'Jane Doe +1-555-0102',
      isBlacklisted: false,
    },
    {
      name: 'Jane Smith',
      phone: '+1-555-0102',
      email: 'jane@example.com',
      driversLicenseNumber: 'DL789012',
      driversLicensePhoto: null,
      preferredVehicle: 'SUV',
      emergencyContact: 'Bob Smith +1-555-0103',
      isBlacklisted: true, // blacklisted
    },
    // 8 more...
    {
      name: 'Mike Johnson',
      phone: '+1-555-0103',
      email: 'mike@example.com',
      driversLicenseNumber: 'DL345678',
      driversLicensePhoto: null,
      preferredVehicle: 'Truck',
      emergencyContact: 'Sarah Johnson +1-555-0104',
      isBlacklisted: false,
    },
    {
      name: 'Sarah Wilson',
      phone: '+1-555-0104',
      email: 'sarah@example.com',
      driversLicenseNumber: 'DL901234',
      driversLicensePhoto: null,
      preferredVehicle: 'Compact',
      emergencyContact: 'Tom Wilson +1-555-0105',
      isBlacklisted: false,
    },
    {
      name: 'Tom Brown',
      phone: '+1-555-0105',
      email: 'tom@example.com',
      driversLicenseNumber: 'DL567890',
      driversLicensePhoto: null,
      preferredVehicle: 'Van',
      emergencyContact: 'Lisa Brown +1-555-0106',
      isBlacklisted: true,
    },
    {
      name: 'Lisa Davis',
      phone: '+1-555-0106',
      email: 'lisa@example.com',
      driversLicenseNumber: 'DL234567',
      driversLicensePhoto: null,
      preferredVehicle: 'Sedan',
      emergencyContact: 'Mark Davis +1-555-0107',
      isBlacklisted: false,
    },
    {
      name: 'Mark Taylor',
      phone: '+1-555-0107',
      email: 'mark@example.com',
      driversLicenseNumber: 'DL890123',
      driversLicensePhoto: null,
      preferredVehicle: 'SUV',
      emergencyContact: 'Emma Taylor +1-555-0108',
      isBlacklisted: false,
    },
    {
      name: 'Emma Anderson',
      phone: '+1-555-0108',
      email: 'emma@example.com',
      driversLicenseNumber: 'DL456789',
      driversLicensePhoto: null,
      preferredVehicle: 'Truck',
      emergencyContact: 'David Anderson +1-555-0109',
      isBlacklisted: false,
    },
    {
      name: 'David Martinez',
      phone: '+1-555-0109',
      email: 'david@example.com',
      driversLicenseNumber: 'DL012345',
      driversLicensePhoto: null,
      preferredVehicle: 'Compact',
      emergencyContact: 'Anna Martinez +1-555-0110',
      isBlacklisted: true,
    },
    {
      name: 'Anna Garcia',
      phone: '+1-555-0110',
      email: 'anna@example.com',
      driversLicenseNumber: 'DL678901',
      driversLicensePhoto: null,
      preferredVehicle: 'Van',
      emergencyContact: 'Carlos Garcia +1-555-0111',
      isBlacklisted: false,
    },
  ]

  for (const clientData of clientsData) {
    await prisma.rentalClient.create({
      data: clientData
    })
  }

  // Seed 5 Vehicles
  const vehiclesData = [
    { make: 'Toyota', model: 'Camry', year: 2023, vin: '4T1BF1FK0DU123456', licensePlate: 'ABC123' },
    { make: 'Honda', model: 'Civic', year: 2022, vin: '2HGFC2F5XNH123457', licensePlate: 'XYZ789' },
    { make: 'Ford', model: 'F-150', year: 2024, vin: '1FTFW1E59RKE12345', licensePlate: 'TRK001' },
    { make: 'Tesla', model: 'Model 3', year: 2023, vin: '5YJ3E1EA0JF123456', licensePlate: 'EV001' },
    { make: 'Chevrolet', model: 'Silverado', year: 2023, vin: '3GCUDDED1PG123456', licensePlate: 'TRK002' },
  ]

  for (const vehicleData of vehiclesData) {
    await prisma.vehicle.create({
      data: vehicleData
    })
  }

  console.log('✅ Seeded 10 RentalClients + 5 Vehicles!')
}

seed()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())

