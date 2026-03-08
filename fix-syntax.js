const fs = require('fs');
const path = 'src/app/auto-parts/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldCode = `const openWebsite = (url: string) => { if (url === '#') alert(\`Visit the store: \${reorderPart?.purchaseLocation}\`) else window.open(url, '_blank') }`;

const newCode = `const openWebsite = (url: string) => { 
    if (url === '#') { 
      alert('Visit the store: ' + (reorderPart?.purchaseLocation || '')) 
    } else { 
      window.open(url, '_blank') 
    } 
  }`;

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync(path, content);
  console.log('File fixed successfully!');
} else {
  console.log('Pattern not found - may already be fixed or different');
}
