const fs = require('fs');
const path = 'src/app/auto-parts/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Find by ID
const oldLine = '  id: number\n  saleDate: string\n  totalAmount: number';
const newLine = '  id: number\n  saleDate: string\n  subtotal: number\n  taxAmount: number\n  taxRate: number\n  discountAmount: number\n  discountType?: string\n  discountValue?: number\n  totalAmount: number';

if (content.includes(oldLine)) {
  content = content.replace(oldLine, newLine);
  fs.writeFileSync(path, content);
  console.log('Interface updated successfully!');
} else {
  console.log('Pattern not found - trying simpler pattern');
  const simpler = 'saleDate: string\n  totalAmount: number';
  if (content.includes(simpler)) {
    console.log('Found simpler pattern');
  }
}
