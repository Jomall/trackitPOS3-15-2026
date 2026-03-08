const fs = require('fs');
const path = 'src/app/auto-parts/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Simple pattern - just look for the TOTAL line in receipt
const oldPattern = '<div class="total"><p>TOTAL: $${lastSale.totalAmount.toFixed(2)}</p><p style="font-size:12px;font-weight:normal;">Payment: ${lastSale.paymentMethod || \'N/A\'}</p></div>';

const newPattern = `<table style="margin-top:10px;font-size:12px">
      <tr><td colspan="3" style="padding:8px;text-align:right;">Subtotal:</td><td style="padding:8px;text-align:right;">$${lastSale.subtotal.toFixed(2)}</td></tr>
      ${'${lastSale.discountAmount > 0 ? `<tr><td colspan="3" style="padding:8px;text-align:right;color:red;">Discount:</td><td style="padding:8px;text-align:right;color:red;">-$$${lastSale.discountAmount.toFixed(2)}</td></tr>` : \'\'}'}
      ${'${lastSale.taxAmount > 0 ? `<tr><td colspan="3" style="padding:8px;text-align:right;">Tax ($$${lastSale.taxRate}%):</td><td style="padding:8px;text-align:right;">$$${lastSale.taxAmount.toFixed(2)}</td></tr>` : \'\'}'}
      <tr><td colspan="3" style="padding:8px;text-align:right;font-weight:bold;font-size:16px;">TOTAL:</td><td style="padding:8px;text-align:right;font-weight:bold;font-size:16px;color:green;">$$${lastSale.totalAmount.toFixed(2)}</td></tr>
    </table>
    <p style="font-size:12px;margin-top:10px;">Payment: ${lastSale.paymentMethod || 'N/A'}</p>`;

if (content.includes(oldPattern)) {
  content = content.replace(oldPattern, newPattern);
  fs.writeFileSync(path, content);
  console.log('Receipt updated successfully with tax and discount!');
} else {
  console.log('Pattern not found');
  // Try alternative
  const altPattern = "TOTAL: $${lastSale.totalAmount.toFixed(2)}</p><p style=";
  if (content.includes(altPattern)) {
    console.log('Found alternative pattern');
  }
}
