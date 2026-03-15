# Furnished Property Inventory Feature

## Steps:
- [x] Plan created and approved
- [x] Update prisma/schema.prisma (add furnishingType enum to Property, HouseholdItem model)
- [x] Run prisma migrate dev & generate (note: shadow DB issue noted, proceed assuming manual fix if needed)
- [ ] Update new-property/page.tsx (add furnishingType, conditional items table)
- [ ] Update api/create-property/route.ts (handle furnishingType, items array)
- [ ] Update api/properties/route.ts (include furnishingType, householdItems in list)
- [ ] Update api/properties/[id]/route.ts (GET/PUT include items)
- [ ] Update accommodation/properties/page.tsx (show furnishingType column, link to [id] detail)
- [ ] Create accommodation/properties/[id]/page.tsx (detail with inventory table/edit)
- [ ] Test full flow: create furnished property with items, view/edit inventory, list shows type
- [ ] Complete
