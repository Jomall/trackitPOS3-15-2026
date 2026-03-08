const fs = require('fs');
const path = 'src/app/auto-parts/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Find and replace the Sale interface
const oldInterface = `interface Sale {
  id: number
  saleDate: string
  totalAmount: number
  paymentMethod?: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  notes?: string
  items: SaleItem[]
}`;

const newInterface = `interface Sale {
  id: number
  saleDate: string
  subtotal: number
  taxAmount: number
  taxRate: number
  discountAmount: number
  discountType?: string
  discountValue?: number
  totalAmount: number
  paymentMethod?: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  notes?: string
  items: SaleItem[]
}`;

if (content.includes(oldInterface)) {
  content = content.replace(oldInterface, newInterface);
  fs.writeFileSync(path, content);
  console.log('Interface updated successfully!');
} else {
  console.log('Pattern not found');
}
