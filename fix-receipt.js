const fs = require('fs');
const path = 'src/app/auto-parts/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Find and replace the printReceipt function to include tax and discount
const oldReceipt = `const printReceipt = () => {
    if (!lastSale) return
    const itemsList = lastSale.items.map((item: any) => {
      return \`<tr><td style="padding:8px;border-bottom:1px solid #ddd;">\${item.name || 'Item'}</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:center;">\${item.quantity}</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">\$\${item.unitPrice.toFixed(2)}</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">\$\${item.subtotal.toFixed(2)}</td></tr>\`
    }).join('')
    const receiptContent = \`<html><head><title>Receipt - Sale #\${lastSale.id}</title><style>body{font-family:Arial,sans-serif;padding:20px;max-width:300px;margin:0 auto}h1{font-size:18px;text-align:center}.info{margin:10px 0;font-size:12px}table{width:100%;border-collapse:collapse;font-size:12px}.total{font-size:16px;font-weight:bold;margin-top:10px}.footer{text-align:center;margin-top:20px;font-size:10px;color:#666}</style></head><body><h1>🧾 Auto Parts Receipt</h1><div class="info"><p><strong>Sale #:</strong> \${lastSale.id}</p><p><strong>Date:</strong> \${new Date(lastSale.saleDate).toLocaleString()}</p>\${lastSale.customerName ? \`<p><strong>Customer:</strong> \${lastSale.customerName}</p>\` : ''}</div><table><thead><tr><th style="text-align:left;padding:8px;">Item</th><th style="padding:8px;">Qty</th><th style="text-align:right;padding:8px;">Price</th><th style="text-align:right;padding:8px;">Total</th></tr></thead><tbody>\${itemsList}</tbody></table><div class="total"><p>TOTAL: \$\${lastSale.totalAmount.toFixed(2)}</p><p style="font-size:12px;font-weight:normal;">Payment: \${lastSale.paymentMethod || 'N/A'}</p></div><div class="footer"><p>Thank you for your business!</p></div></body></html>\`
    const win = window.open('', '_blank')
    if (win) { win.document.write(receiptContent); win.document.close(); win.print() }
  }`;

const newReceipt = `const printReceipt = () => {
    if (!lastSale) return
    const itemsList = lastSale.items.map((item: any) => {
      return \`<tr><td style="padding:8px;border-bottom:1px solid #ddd;">\${item.name || 'Item'}</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:center;">\${item.quantity}</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">\$\${item.unitPrice.toFixed(2)}</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">\$\${item.subtotal.toFixed(2)}</td></tr>\`
    }).join('')
    const hasDiscount = lastSale.discountAmount > 0
    const hasTax = lastSale.taxAmount > 0
    const discountLine = hasDiscount ? \`<tr><td colspan="3" style="padding:8px;text-align:right;color:red;">Discount:</td><td style="padding:8px;text-align:right;color:red;">-$\${lastSale.discountAmount.toFixed(2)}</td></tr>\` : ''
    const taxLine = hasTax ? \`<tr><td colspan="3" style="padding:8px;text-align:right;">Tax (\${lastSale.taxRate}%):</td><td style="padding:8px;text-align:right;">$\${lastSale.taxAmount.toFixed(2)}</td></tr>\` : ''
    const receiptContent = \`<html><head><title>Receipt - Sale #\${lastSale.id}</title><style>body{font-family:Arial,sans-serif;padding:20px;max-width:300px;margin:0 auto}h1{font-size:18px;text-align:center}.info{margin:10px 0;font-size:12px}table{width:100%;border-collapse:collapse;font-size:12px}.total{font-size:16px;font-weight:bold;margin-top:10px}.footer{text-align:center;margin-top:20px;font-size:10px;color:#666}</style></head><body><h1>🧾 Auto Parts Receipt</h1><div class="info"><p><strong>Sale #:</strong> \${lastSale.id}</p><p><strong>Date:</strong> \${new Date(lastSale.saleDate).toLocaleString()}</p>\${lastSale.customerName ? \`<p><strong>Customer:</strong> \${lastSale.customerName}</p>\` : ''}\${lastSale.customerEmail ? \`<p><strong>Email:</strong> \${lastSale.customerEmail}</p>\` : ''}</div><table><thead><tr><th style="text-align:left;padding:8px;">Item</th><th style="padding:8px;">Qty</th><th style="text-align:right;padding:8px;">Price</th><th style="text-align:right;padding:8px;">Total</th></tr></thead><tbody>\${itemsList}</tbody></table><table style="margin-top:10px;font-size:12px"><tr><td colspan="3" style="padding:8px;text-align:right;">Subtotal:</td><td style="padding:8px;text-align:right;">$\${lastSale.subtotal.toFixed(2)}</td></tr>\${discountLine}\${taxLine}<tr><td colspan="3" style="padding:8px;text-align:right;font-weight:bold;font-size:16px;">TOTAL:</td><td style="padding:8px;text-align:right;font-weight:bold;font-size:16px;color:green;">$\${lastSale.totalAmount.toFixed(2)}</td></tr></table><p style="font-size:12px;margin-top:10px;">Payment: \${lastSale.paymentMethod || 'N/A'}</p><div class="footer"><p>Thank you for your business!</p></div></body></html>\`
    const win = window.open('', '_blank')
    if (win) { win.document.write(receiptContent); win.document.close(); win.print() }
  }`;

if (content.includes(oldReceipt)) {
  content = content.replace(oldReceipt, newReceipt);
  fs.writeFileSync(path, content);
  console.log('Receipt updated successfully!');
} else {
  console.log('Pattern not found - trying alternative approach');
  // Try a simpler approach - find the receipt generation and add the lines
}
