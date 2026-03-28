const fs = require('fs');
const path = require('path');
const nmDir = path.join(__dirname, '..', 'node_modules');
const dirs = fs.readdirSync(nmDir);
for (const d of dirs) {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(nmDir, d, 'package.json'), 'utf8'));
    if (!pkg.version || pkg.version === '') {
      console.log('BAD VERSION:', d, JSON.stringify(pkg.version));
    }
  } catch(e) {}
}
console.log('Done checking', dirs.length, 'packages');
