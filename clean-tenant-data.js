const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanData() {
  console.log('🧹 Cleaning tenant data...')

// 1. Find duplicate tenants by name + idNumber using raw query
  const dupCandidates = await prisma.tenant.findMany({
    where: {
      idNumber: { not: null }
    },
    select: { id: true, name: true, idNumber: true }
  })

  // Group manually
  const tenantGroups = {}
  for (const tenant of dupCandidates) {
    const key = `${tenant.name}-${tenant.idNumber}`
    if (!tenantGroups[key]) tenantGroups[key] = []
    tenantGroups[key].push(tenant)
  }

  for (const [key, group] of Object.entries(tenantGroups)) {
    if (group.length > 1) {
      console.log(`Merging ${group.length} duplicates: ${key}`)
      
      // Keep lowest ID
      group.sort((a, b) => a.id - b.id)
      const keepTenant = group[0]
      const deleteTenants = group.slice(1)

      // Reassign agreements
      for (const delTenant of deleteTenants) {
        await prisma.rentalAgreement.updateMany({
          where: { tenantId: delTenant.id },
          data: { tenantId: keepTenant.id }
        })
      }

      // Delete extras
      for (const delTenant of deleteTenants) {
        await prisma.tenant.delete({ where: { id: delTenant.id } })
      }
      console.log(`✅ Merged duplicates for ${key}, kept ID ${keepTenant.id}`)
    }
  }



// 2. Fix duplicate payments (keep latest per receiptNumber) using raw approach
  const allPayments = await prisma.rentalPayment.findMany({
    where: { receiptNumber: { not: null } },
    select: { id: true, receiptNumber: true, paymentDate: true }
  })

  const paymentGroups = {}
  for (const payment of allPayments) {
    if (!paymentGroups[payment.receiptNumber]) paymentGroups[payment.receiptNumber] = []
    paymentGroups[payment.receiptNumber].push(payment)
  }

  for (const [receipt, group] of Object.entries(paymentGroups)) {
    if (group.length > 1) {
      // Keep latest by ID
      group.sort((a, b) => b.id - a.id)
      const keepId = group[0].id
      const deleteIds = group.slice(1).map(p => p.id)
      
      await prisma.rentalPayment.deleteMany({
        where: { id: { in: deleteIds } }
      })
      console.log(`✅ Fixed duplicate receipt ${receipt}, kept ID ${keepId}`)
    }
  }



  console.log('✅ Tenant duplicates and payment duplicates cleaned!')
  
  const tenantCount = await prisma.tenant.count()
  const paymentCount = await prisma.rentalPayment.count()
  console.log(`📊 Final Stats: ${tenantCount} tenants, ${paymentCount} payments`)
}

cleanData()
  .catch(e => console.error('❌ Cleanup failed:', e))
  .finally(async () => await prisma.$disconnect())

