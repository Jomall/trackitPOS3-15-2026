# Rental Client Details + Damage/Payments TODO

## Information Gathered:
**Schema (prisma/schema.prisma):**
- RentalClient model has all fields: name, phone, email, license, blacklist fields, createdAt
- No DamageOwed or ClientPayment models yet - need to add

**Clients List (`src/app/vehicle-rental/clients/page.tsx`):**
- Full CRUD table with Edit/Delete/Blacklist/Unlist
- No \"View\" button - add Link to `/vehicle-rental/clients/[id]`
- Fetches from `/api/rental-clients`
- Status displayed (Active/Blacklisted)

**API:**
- `/api/rental-clients/[id]/route.ts`: GET (details), PUT (update), DELETE - perfect base
- Blacklist/unblacklist APIs fixed

**Structure:**
- No `src/app/vehicle-rental/clients/[id]` folder/page - create
- Similar to accommodation/tenants/[id]

## Plan:
1. [x] Add View button to clients list ✅
2. [ ] Schema updates (prisma/schema.prisma):**

   - Add `ClientDamage`: id, rentalClientId, vehicleId?, description, amount, date, status (pending/paid)
   - Add `ClientPayment`: id, rentalClientId, amount, date, method, notes, appliedToDamageId?
   - RentalClient.balance Float? (computed: sum(damages) - sum(payments))

2. **Client details page (`src/app/vehicle-rental/clients/[id]/page.tsx`):**
   - Fetch client + damages + payments via API
   - Show all fields + status badge
   - List damages/payments tables

3. **API extensions:**
   - `/api/rental-clients/[id]`: Include include: { damages: true, payments: true }
   - `/api/rental-clients/[id]/damages`: CRUD damages
   - `/api/rental-clients/[id]/payments`: CRUD payments

4. **List page update:**
   - Add \"View\" button per row: <Link href={`/vehicle-rental/clients/${client.id}`}>👁️</Link>

5. **Migrations/UI polish:**
   - prisma migrate dev
   - Seed sample damages/payments
   - Balance summary on details page

**Dependent Files:**
- prisma/schema.prisma (primary)
- src/app/vehicle-rental/clients/page.tsx (add View button)
- src/app/api/rental-clients/[id]/route.ts (extend GET)
- New: src/app/vehicle-rental/clients/[id]/page.tsx, api/rental-clients/[id]/damages/route.ts, payments/route.ts

**Followup:**
- Prisma migrate & generate
- Test details page, add damage/payment
- Seed data

Ready to proceed? Confirm plan before schema edits.

