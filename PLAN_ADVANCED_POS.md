# Advanced POS Features Implementation Plan

## Features to Implement

### 1. Sales Tax Support
- [ ] Add taxRate field to Sale model in schema
- [ ] Add tax configuration in UI (default tax rate setting)
- [ ] Calculate tax on cart items
- [ ] Display tax breakdown on receipts

### 2. Discounts
- [ ] Add discount field to Sale model
- [ ] Support percentage discounts and fixed amount discounts
- [ ] Apply discounts before tax
- [ ] Show discount on receipt

### 3. Returns & Exchanges
- [ ] Create /api/sales/return endpoint for processing returns
- [ ] Support partial returns (return specific items)
- [ ] Restore inventory when processing returns
- [ ] Issue refund (to original payment method or store credit)

### 4. Digital Receipts
- [ ] Add customer email/SMS to sale data
- [ ] Create email receipt functionality (using API route)
- [ ] Generate HTML receipt for email

### 5. Barcode Scanning
- [ ] Add barcode input field in POS tab
- [ ] Search parts by partNumber
- [ ] Quick add to cart via barcode

## Implementation Order

1. Create /api/sales/return endpoint (backend)
2. Update Prisma schema for tax and discounts
3. Update /api/sales POST to handle tax and discounts
4. Update POS UI for:
   - Tax calculation display
   - Discount input/selection
   - Barcode scanning input
   - Return processing UI improvements
5. Add digital receipts (email)
