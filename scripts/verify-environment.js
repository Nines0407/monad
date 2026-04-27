const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Verifying Audit System development environment...');

const checks = [
  { name: 'Node.js', command: 'node --version', minVersion: '18.0.0' },
  { name: 'npm', command: 'npm --version', minVersion: '9.0.0' },
  { name: 'Git', command: 'git --version' },
  { name: 'TypeScript', command: 'tsc --version' },
  { name: 'Forge', command: 'forge --version' },
  { name: 'Solc', command: 'solc --version', minVersion: '0.8.20' },
];

let allPassed = true;

checks.forEach(check => {
  try {
    const output = execSync(check.command, { encoding: 'utf8' }).trim();
    console.log(`✅ ${check.name}: ${output}`);
    if (check.minVersion) {
      const version = output.match(/\d+\.\d+\.\d+/)?.[0];
      if (version && compareVersions(version, check.minVersion) < 0) {
        console.error(`❌ ${check.name} version too low: need >= ${check.minVersion}, currently ${version}`);
        allPassed = false;
      }
    }
  } catch (error) {
    console.error(`❌ ${check.name}: not installed or inaccessible`);
    allPassed = false;
  }
});

if (!fs.existsSync('package.json')) {
  console.error('❌ package.json not found, make sure to run from project root');
  allPassed = false;
}

// Check for contracts directory
if (!fs.existsSync('contracts')) {
  console.warn('⚠️  contracts directory not found, run setup.sh to create');
}

if (allPassed) {
  console.log('✅ All environment checks passed!');
  process.exit(0);
} else {
  console.error('❌ Environment checks failed, please install missing dependencies');
  process.exit(1);
}

function compareVersions(a, b) {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aVal = aParts[i] || 0;
    const bVal = bParts[i] || 0;
    if (aVal !== bVal) return aVal - bVal;
  }
  return 0;
}