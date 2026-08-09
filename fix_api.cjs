const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf8');

// Replace the fetch block in apiGetServices
code = code.replace(/try\s*\{\s*const res = await fetch\('\/api\/services'\);[\s\S]*?catch\s*\([^)]*\)\s*\{\}/, '');
// Replace the fetch block in apiGetPortfolio
code = code.replace(/try\s*\{\s*const res = await fetch\('\/api\/portfolio'\);[\s\S]*?catch\s*\([^)]*\)\s*\{\}/, '');
// Replace the fetch block in apiGetBlogs
code = code.replace(/try\s*\{\s*const res = await fetch\('\/api\/blogs'\);[\s\S]*?catch\s*\([^)]*\)\s*\{\}/, '');
// Replace the fetch block in apiGetCourses
code = code.replace(/try\s*\{\s*const res = await fetch\('\/api\/courses'\);[\s\S]*?catch\s*\([^)]*\)\s*\{\}/, '');

fs.writeFileSync('src/lib/api.ts', code);
console.log('Fixed api.ts');
