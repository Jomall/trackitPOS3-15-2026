# CRUD + Search Implementation Plan

**Information Gathered:**
- tenants/page.tsx: Client-side list with modals (add Edit/Delete modals)
- api/tenants/route.ts: GET tenants (add POST create, GET search)
- No properties page (create /accommodation/properties/page.tsx)
- api/properties/route.ts exists
- Prisma relations support cascade delete

**Plan:**
1. **Tenants CRUD**: Edit/Delete modals in tenants/page.tsx, API /api/tenants/[id] PUT/DELETE
2. **Properties CRUD**: New /accommodation/properties/page.tsx with list/edit/delete
3. **Search**: Global search bar filtering tenants/properties by name/ID/phone
4. **Cascade Delete**: Prisma onDelete: Cascade for agreements/payments

**Dependent Files:**
- prisma/schema.prisma (add cascade)
- api/tenants/[id]/route.ts (PUT/DELETE)
- api/properties/[id]/route.ts (PUT/DELETE)
- tenants/page.tsx (modals + search)
- New properties/page.tsx

**Followup:**
1. Prisma db push
2. Test delete tenant (cascades agreements/payments)
3. Test search/filter
4. npm run dev verify
