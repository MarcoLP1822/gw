const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'app', 'progetti', '[id]', 'page.tsx');

// Read file
let content = fs.readFileSync(filePath, 'utf8');

// Replace all spacing and margin classes for consistency
content = content.replace(/className="text-xl font-semibold text-gray-900 mb-4"/g, 'className="text-lg font-semibold text-gray-900 mb-2"');
content = content.replace(/space-y-4/g, 'space-y-2');
content = content.replace(/gap-4/g, 'gap-2');
content = content.replace(/space-y-6/g, 'space-y-3');
content = content.replace(/gap-6/g, 'gap-3');
content = content.replace(/mb-6/g, 'mb-3');
content = content.replace(/p-6/g, 'p-3');
content = content.replace(/py-6/g, 'py-3');
content = content.replace(/px-6/g, 'px-3');

// Write back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Fixed all spacing and margins!');
console.log('   - Reduced mb-4 → mb-2');
console.log('   - Reduced space-y-4 → space-y-2');
console.log('   - Reduced gap-4 → gap-2');
console.log('   - Reduced space-y-6 → space-y-3');
console.log('   - Reduced text sizes from xl to lg');
