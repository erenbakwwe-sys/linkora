const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Packaging NestJS into standalone bundle via @vercel/ncc...');
execSync('npx @vercel/ncc build dist/main.js -o dist/bundle -m', { stdio: 'inherit' });

const bundleFile = path.join(__dirname, 'dist', 'bundle', 'index.js');
const targetFile = path.join(__dirname, 'dist', 'main.js');

if (fs.existsSync(bundleFile)) {
  fs.copyFileSync(bundleFile, targetFile);
  console.log('Successfully replaced dist/main.js with self-contained bundle.');
} else {
  console.error('Error: dist/bundle/index.js was not generated.');
  process.exit(1);
}
