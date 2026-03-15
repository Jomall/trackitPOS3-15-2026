# Tenant Data Fix - Progress Tracker

## Phase 1: Data Cleanup ✅ [3/3]
- [x] Create clean-tenant-data.js 
- [x] Run cleanup script (duplicates fixed: 3→1 Jon Doe, REC-300-001 fixed)
- [x] Prisma migration for unique constraint (next)

## Phase 2: Code Fixes [0/5]
- [ ] Edit prisma/schema.prisma (add @@unique([name, idNumber]))
- [ ] Fix tenants/[id]/page.tsx (balance calc, phone format, agreement names)
- [ ] Fix api/tenants/[tenantId]/route.ts (consistent data)
- [ ] Fix api/payments/[tenantId]/route.ts (dedup receipts)
- [ ] Fix tenants/page.tsx (UI dedup, format)

## Phase 3: Prevention [0/2]
- [ ] Fix mock-payment-seeder.ts (idempotent)
- [ ] Test new payment recording

## Phase 4: Validate
- [ ] Verify /accommodation/tenants/15 clean
- [ ] Correct totals, no duplicates

Current DB: 4 tenants, 9 payments
