# Payment Tracking Feature - Progress

## Analysis Complete ✅
**Schema:** RentalPayment model exists (agreementId, amount, date, method)
**Relationships:** Property → Agreement → Tenant + Payments (N:1:M)

## Implementation Plan
**Information Gathered:**
- RentalAgreement has rentAmount monthly
- No payment history UI/API
- Tenants page shows agreement count only
- Need monthly expected vs paid calculation

**File Level Plan:**
1. `src/app/accommodation/tenants/[id]/page.tsx` **NEW**: Tenant detail + payments table + balance
2. `src/app/api/payments/[tenantId]/route.ts` **NEW**: GET tenant payments + balance calc
3. `src/app/accommodation/tenants/page.tsx` **EDIT**: Balance column + link to detail
4. Modal for add/edit payment
5. Prisma query optimizations

**Dependent Files:**
- Edit tenants/route.ts (add agreements summary)
- No migration needed (model exists)

**Followup Steps:**
1. Create tenant/[id] page
2. Payments API  
3. Add payment modal
4. Test balance calc
5. Restart dev server

- [x] 1. Tenant detail page (`tenants/[id]/page.tsx`) + tenant API (`api/tenants/[tenantId]`)
- [ ] 2. Payments API (`api/payments/[tenantId]`)
- [ ] 3. Add/edit payment form
- [ ] 4. Balance column in tenants list
- [ ] 5. Link from tenants list to detail
