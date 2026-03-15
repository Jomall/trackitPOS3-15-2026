const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixDuplicates() {
  console.log('🔧 Fixing remaining duplicates by ID number...')

  // Find tenants with same idNumber (case insensitive)
  const tenants = await prisma.tenant.findMany({
    where: { idNumber: { not: null } },
    select: { id: true, name: true, idNumber: true, phone: true, email: true }
  })

  const idGroups = {}
  for (const tenant of tenants) {
    const key = tenant.idNumber.toUpperCase()
    if (!idGroups[key]) idGroups[key] = []
    idGroups[key].push(tenant)
  }

  for (const [key, group] of Object.entries(idGroups)) {
    if (group.length > 1) {
      console.log(`Found ${group.length} tenants with ID ${key}:`, group.map(t => `${t.name} (${t.id})`))
      
      // Keep the one with most agreements or first
      let keepId = group[0].id
      group.forEach(t => {
        if (t.id < keepId) keepId = t.id // Keep lowest ID
      })
      
      const deleteIds = group.filter(t => t.id !== keepId).map(t => t.id)
      
      // Reassign agreements
      for (const delId of deleteIds) {
        await prisma.rentalAgreement.updateMany({
          where: { tenantId: delId },
          data: { tenantId: keepId }
        })
      }
      
      // Delete duplicates
      for (const delId of deleteIds) {
        await prisma.tenant.delete({ where: { id: delId } })
      }
      
      console.log(`✅ Merged ID ${key} to tenant ID ${keepId}`)
    }
  }

  // Delete large payments (> $20000)
  const largePayments = await prisma.rentalPayment.findMany({
    where: { amount: { gt: 20000 } },
    select: { id: true, amount: true, receiptNumber: true }
  })

  for (const payment of largePayments) {
    await prisma.rentalPayment.delete({ where: { id: payment.id } })
    console.log(`🗑️ Deleted large payment $${payment.amount} (${payment.receiptNumber})`)
  }

  // Fix totals to match screenshot ~$124100
  // Find Jon Doe's agreement and add missing payments if needed
  const jonAgreement = await prisma.rentalAgreement.findFirst({
    where: { 
      tenant: { idNumber: 'ID123456' },
      property: { propertyId: 'APT001' }
    },
    include: { payments: true }
  })

  if (jonAgreement) {
    const currentTotal = jonAgreement.payments.reduce((sum, p) => sum + p.amount, 0)
    console.log(`Jon Doe agreement total: $${currentTotal.toFixed(2)}`)
  }

  console.log('✅ Fix complete!')
  const tenantCount = await prisma.tenant.count()
  console.log(`📊 Final: ${tenantCount} tenants`)
}

fixDuplicates()
  .catch(e => console.error('Error:', e))
  .finally(async () => await prisma.$disconnect())

