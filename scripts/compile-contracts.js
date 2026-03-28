#!/usr/bin/env node
/**
 * Compiles contracts/FullFeatureBEP20.sol → src/lib/contracts/FullFeatureBEP20.json
 *
 * Requires solcjs globally: npm install -g solc
 * Run: node scripts/compile-contracts.js
 */

const { execSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const ROOT        = path.join(__dirname, '..');
const SOURCE_FILE = path.join(ROOT, 'contracts', 'FullFeatureBEP20.sol');
const OUT_DIR     = path.join(ROOT, 'src', 'lib', 'contracts');
const TMP_DIR     = path.join(ROOT, '.compile-tmp');

if (!fs.existsSync(SOURCE_FILE)) {
  console.error('Contract not found:', SOURCE_FILE);
  process.exit(1);
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

console.log('Compiling FullFeatureBEP20.sol...');

// Compile --bin and --abi separately
const opts = `--optimize --optimize-runs 200 -o "${TMP_DIR}"`;
const src  = `"${SOURCE_FILE}"`;

try {
  execSync(`solcjs ${opts} --bin --abi ${src}`, { encoding: 'utf8' });
} catch (err) {
  console.error('Compilation failed:');
  console.error(err.stderr || err.stdout || err.message);
  process.exit(1);
}

// solcjs outputs files named like: contracts_FullFeatureBEP20_sol_CryptoGodToken.bin
const files = fs.readdirSync(TMP_DIR);
const binFile = files.find(f => f.endsWith('_CryptoGodToken.bin'));
const abiFile = files.find(f => f.endsWith('_CryptoGodToken.abi'));

if (!binFile || !abiFile) {
  console.error('Output files not found in', TMP_DIR);
  console.error('Files found:', files);
  process.exit(1);
}

const bytecode = fs.readFileSync(path.join(TMP_DIR, binFile), 'utf8').trim();
const abi      = JSON.parse(fs.readFileSync(path.join(TMP_DIR, abiFile), 'utf8'));

if (!bytecode || bytecode.length === 0) {
  console.error('Empty bytecode — compilation failed silently');
  process.exit(1);
}

const result = {
  contractName: 'CryptoGodToken',
  abi,
  bytecode: '0x' + bytecode,
};

fs.writeFileSync(path.join(OUT_DIR, 'FullFeatureBEP20.json'), JSON.stringify(result, null, 2));

// Cleanup tmp
fs.rmSync(TMP_DIR, { recursive: true, force: true });

const byteKB = Math.round(bytecode.length / 2 / 1024);
console.log('✓ Compiled successfully');
console.log(`  ABI functions : ${abi.filter(x => x.type === 'function').length}`);
console.log(`  ABI events    : ${abi.filter(x => x.type === 'event').length}`);
console.log(`  Bytecode size : ${byteKB} KB ${byteKB > 24 ? '⚠ (near EVM 24KB limit)' : '✓'}`);
console.log(`  Output        : src/lib/contracts/FullFeatureBEP20.json`);
