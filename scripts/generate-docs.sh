#!/bin/bash
# scripts/generate-docs.sh

echo "📄 生成系统文档..."

# 1. 生成API文档
npx typedoc --out docs/api src/

# 2. 生成合约ABI文档
forge doc --out docs/contracts

# 3. 生成架构图
npx mmdc -i docs/architecture/diagrams/*.mmd -o docs/architecture/images/

# 4. 验证文档完整性
node scripts/verify-docs.js

echo "✅ 文档生成完成！"