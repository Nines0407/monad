# 贡献指南

感谢您对 Agentic Payment System 项目的关注！我们欢迎所有形式的贡献，无论是代码、文档、测试、还是功能建议。

## 🎯 如何贡献

### 报告问题

如果您发现 bug 或有问题，请：
1. 在 [GitHub Issues](https://github.com/your-org/agentic-payment-system/issues) 搜索是否已有类似问题
2. 如果没有，创建一个新的 issue，包含：
   - 清晰的问题描述
   - 重现步骤
   - 期望的行为
   - 实际的行为
   - 相关日志或截图

### 功能请求

如果您有新功能的想法，请：
1. 在 [GitHub Discussions](https://github.com/your-org/agentic-payment-system/discussions) 中搜索是否已有类似建议
2. 如果没有，创建一个新的讨论，包含：
   - 功能的详细描述
   - 解决的问题或带来的价值
   - 可能的实现方案
   - 相关用例

### 提交代码

#### 开发环境设置

1. **Fork 项目仓库**
```bash
git clone https://github.com/your-username/agentic-payment-system.git
cd agentic-payment-system
```

2. **安装依赖**
```bash
npm install
```

3. **设置开发环境**
```bash
# 复制环境变量示例文件
cp .env.example .env

# 启动开发数据库
docker-compose up -d postgres redis

# 运行数据库迁移
npm run migrate:up

# 启动开发服务器
npm run dev
```

#### 开发流程

1. **创建功能分支**
```bash
git checkout -b feature/your-feature-name
# 或修复 bug: git checkout -b fix/issue-description
```

2. **编写代码**
   - 遵循项目代码规范
   - 添加适当的测试
   - 更新相关文档

3. **运行测试**
```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- --testPathPattern=your-test-file

# 检查代码覆盖率
npm run test:coverage
```

4. **提交更改**
```bash
# 添加更改
git add .

# 提交（使用约定式提交格式）
git commit -m "feat: add new payment validation logic"

# 或修复 bug: git commit -m "fix: resolve session key expiration issue"
```

**提交消息格式**（遵循 [约定式提交](https://www.conventionalcommits.org/)）：
- `feat:` 新功能
- `fix:` bug 修复
- `docs:` 文档更新
- `style:` 代码格式（不影响功能）
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建过程或辅助工具更改

5. **推送到分支**
```bash
git push origin feature/your-feature-name
```

6. **创建 Pull Request**
   - 前往原仓库的 Pull Requests 页面
   - 点击 "New Pull Request"
   - 选择你的分支
   - 填写 PR 描述，说明更改内容
   - 链接相关的 issue（如果有）

## 📋 代码规范

### 通用规范

1. **TypeScript 规范**
   - 使用严格模式 (`strict: true`)
   - 避免使用 `any` 类型
   - 使用接口定义复杂数据结构
   - 为函数添加类型注解

2. **代码格式**
   - 使用 2 空格缩进
   - 使用单引号
   - 行尾不要有空格
   - 文件以换行符结尾

3. **命名约定**
   - 变量/函数：camelCase
   - 类/接口：PascalCase
   - 常量：UPPER_SNAKE_CASE
   - 文件：kebab-case

### 智能合约规范

1. **Solidity 规范**
   - 使用 Solidity 0.8.20+
   - 遵循 Solidity 样式指南
   - 添加 NatSpec 注释
   - 使用 OpenZeppelin 安全库

2. **安全最佳实践**
   - 检查-效果-交互模式
   - 防止重入攻击
   - 适当的访问控制
   - 输入验证

### 测试规范

1. **测试覆盖率**
   - 智能合约：>90%
   - 关键业务逻辑：100%
   - 整体覆盖率：>80%

2. **测试类型**
   - 单元测试：测试单个函数/组件
   - 集成测试：测试模块间交互
   - 端到端测试：测试完整流程

## 🧪 测试指南

### 运行测试

```bash
# 运行所有测试
npm test

# 运行特定模块测试
npm run test:contracts    # 智能合约测试
npm run test:client      # 客户端测试
npm run test:audit       # 审计系统测试
npm run test:integration # 集成测试

# 运行测试并生成覆盖率报告
npm run test:coverage
```

### 编写测试

#### 智能合约测试（Foundry）
```solidity
// 测试合约示例
contract AgentWalletTest is Test {
    AgentWallet public wallet;
    
    function setUp() public {
        wallet = new AgentWallet();
    }
    
    function testExecutePayment() public {
        // 测试逻辑
        vm.prank(user);
        wallet.executePayment(...);
        
        // 断言
        assertEq(wallet.balance(), expectedBalance);
    }
}
```

#### TypeScript 测试（Jest）
```typescript
// 测试文件示例
describe('PaymentValidator', () => {
    let validator: PaymentValidator;
    
    beforeEach(() => {
        validator = new PaymentValidator();
    });
    
    test('should validate valid payment', () => {
        const payment = createValidPayment();
        const result = validator.validate(payment);
        expect(result.isValid).toBe(true);
    });
    
    test('should reject invalid amount', () => {
        const payment = createPaymentWithInvalidAmount();
        const result = validator.validate(payment);
        expect(result.errors).toContain('Invalid amount');
    });
});
```

## 📚 文档规范

### 文档类型

1. **技术文档**
   - API 文档
   - 架构设计文档
   - 部署指南
   - 开发指南

2. **用户文档**
   - 使用教程
   - 功能说明
   - 故障排除

3. **API 文档**
   - REST API 端点
   - GraphQL 模式
   - SDK 使用方法

### 文档更新

当修改代码时：
1. 如果更改了公共 API，更新 API 文档
2. 如果添加了新功能，更新功能文档
3. 如果更改了部署流程，更新部署指南

## 🏗️ 项目结构

了解项目结构有助于有效贡献：

```
agentic-payment-system/
├── contracts/          # 智能合约
├── client/            # 客户端应用
├── src/               # 审计系统后端
├── integration/       # 集成层
├── docs/              # 文档
├── tests/             # 测试
├── scripts/           # 脚本
└── web/               # Web 前端
```

每个目录都有 `README.md` 说明其结构和用途。

## 🔍 代码审查

所有 Pull Request 都会经过代码审查。审查重点：

1. **功能正确性**
   - 代码是否按预期工作？
   - 是否有边界情况未处理？

2. **代码质量**
   - 是否符合代码规范？
   - 是否有重复代码？
   - 是否遵循设计模式？

3. **测试覆盖**
   - 是否有足够的测试？
   - 测试是否覆盖重要路径？
   - 测试是否清晰可读？

4. **文档更新**
   - 是否更新了相关文档？
   - 是否有清晰的注释？

5. **安全考虑**
   - 是否有潜在的安全风险？
   - 是否遵循安全最佳实践？

## 🚀 发布流程

### 版本管理

项目使用语义化版本控制：
- **主版本**：不兼容的 API 更改
- **次版本**：向后兼容的功能性新增
- **修订版本**：向后兼容的问题修复

### 发布步骤

1. **准备发布**
   - 更新版本号
   - 更新 CHANGELOG.md
   - 运行完整测试套件

2. **创建发布**
   - 创建 release 分支
   - 构建发布版本
   - 创建 GitHub Release

3. **部署**
   - 部署到测试环境
   - 验证功能
   - 部署到生产环境

## 🤝 社区交流

### 沟通渠道

- **GitHub Issues**: bug 报告和功能请求
- **GitHub Discussions**: 技术讨论和问答
- **Discord/Slack**: 实时交流（如果有）

### 行为准则

请遵守我们的 [行为准则](CODE_OF_CONDUCT.md)，确保社区友好、包容。

## 🙏 致谢

感谢所有贡献者！您的贡献使项目变得更好。

---

**有问题？** 请在 GitHub Issues 或 Discussions 中提问，我们很乐意帮助！