const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/components/*.tsx');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/if\s*\(\s*data\s*&&\s*data\.length\s*>\s*0\s*\)\s*\{/g, 'if (data) {');
  content = content.replace(/if\s*\(\s*data\s*&&\s*data\.length\s*>\s*0\s*\)\s*set/g, 'if (data) set');
  fs.writeFileSync(file, content);
});
console.log('Fixed lengths');
