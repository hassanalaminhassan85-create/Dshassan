const fs = require('fs');
const path = require('path');

const dir = 'src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx')).map(f => path.join(dir, f));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/if\s*\(\s*data\s*&&\s*data\.length\s*>\s*0\s*\)\s*\{/g, 'if (data) {');
  content = content.replace(/if\s*\(\s*data\s*&&\s*data\.length\s*>\s*0\s*\)\s*set/g, 'if (data) set');
  fs.writeFileSync(file, content);
});
console.log('Fixed lengths');
