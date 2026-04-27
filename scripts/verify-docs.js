#!/usr/bin/env node
// scripts/verify-docs.js

const fs = require('fs');
const path = require('path');

console.log('🔍 验证文档完整性...');

const requiredDocs = [
  'README_AUDIT_SYSTEM.md',
  'development_spec.md',
  'agent_development_preset.md',
  'implementation_plan.md',
  'PROJECT_ANALYSIS.md',
  'docs/architecture/audit-system.md',
  'docs/integration/README.md',
  'docs/integration/quickstart.md',
  'client/docs/architecture/client-architecture.md',
  'client/docs/api/sdk-reference.md',
  'client/docs/operations/deployment-guide.md'
];

let allOk = true;

for (const docPath of requiredDocs) {
  const fullPath = path.join(__dirname, '..', docPath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${docPath}`);
  } else {
    console.log(`❌ ${docPath} - 缺失`);
    allOk = false;
  }
}

// 检查关键目录
const requiredDirs = [
  'docs/architecture',
  'docs/integration',
  'client/docs/architecture',
  'client/docs/api',
  'client/docs/operations'
];

for (const dirPath of requiredDirs) {
  const fullPath = path.join(__dirname, '..', dirPath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ 目录 ${dirPath}`);
  } else {
    console.log(`❌ 目录 ${dirPath} - 缺失`);
    allOk = false;
  }
}

if (allOk) {
  console.log('🎉 所有必需文档都存在！');
  process.exit(0);
} else {
  console.log('⚠️  部分文档缺失，请检查。');
  process.exit(1);
}