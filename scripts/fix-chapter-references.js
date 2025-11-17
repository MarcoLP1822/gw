const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'app', 'progetti', '[id]', 'page.tsx');

// Read file
let content = fs.readFileSync(filePath, 'utf8');

// Replace all occurrences
content = content.replace(/project\.chapters/g, 'project.Chapter');
content = content.replace(/_count\.chapters/g, '_count.Chapter');

// Write back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Fixed all chapter references!');
console.log('   - project.chapters → project.Chapter');
console.log('   - _count.chapters → _count.Chapter');
