const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf8');

// Replace the fetch block in apiGetOngoingProjects
code = code.replace(/try\s*\{\s*const res = await fetch\('\/api\/ongoing-projects'\);[\s\S]*?catch\s*\([^)]*\)\s*\{\}/, '');
// Replace the fetch block in apiGetRecognitionCertificates
code = code.replace(/try\s*\{\s*const res = await fetch\('\/api\/recognition\/certificates'\);[\s\S]*?catch\s*\([^)]*\)\s*\{\}/, '');
// Replace the fetch block in apiGetCacMetadata
code = code.replace(/try\s*\{\s*const res = await fetch\('\/api\/cac\/metadata'\);[\s\S]*?catch\s*\([^)]*\)\s*\{\}/, '');
fs.writeFileSync('src/lib/api.ts', code);
console.log('Fixed more api.ts');
