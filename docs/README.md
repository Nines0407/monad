# 项目文档目录

本目录包含 Agentic Payment System 的详细技术文档，涵盖架构设计、API 规范、集成指南和运维手册。

## 目录结构

```
docs/
├── architecture/          # 架构设计文档
│   ├── audit-system.md   # 审计系统架构
│   └── ...              # 其他架构文档
├── integration/          # 集成文档
│   ├── README.md        # 集成层概述
│   ├── quickstart.md    # 快速开始指南
│   ├── mcp-server-api.md # MCP 服务器 API
│   ├── cli-reference.md # CLI 工具参考
│   ├── sdk-guide.md     # TypeScript SDK 指南
│   ├── rest-api.md      # REST API 文档
│   ├── graphql-api.md   # GraphQL API 文档
│   ├── websocket-api.md # WebSocket API 文档
│   ├── integration-examples.md # 集成示例
│   └── troubleshooting.md # 故障排查
├── api/                 # API 详细文档
├── operations/          # 运维和部署文档
└── README.md           # 本文档
```

## 文档语言状态

| 目录 | 语言 | 翻译状态 | 说明 |
|------|------|----------|------|
| architecture/ | 英文 | 待翻译 | 技术架构文档 |
| integration/ | 中文 | ✅ 已翻译 | 集成层文档已全面翻译 |
| api/ | 英文 | 待翻译 | API 详细规范 |
| operations/ | 英文 | 待翻译 | 运维和部署指南 |

## 快速访问

### 已翻译文档（中文）
- [集成层概述](integration/README.md) - 集成层整体介绍
- [快速开始指南](integration/quickstart.md) - 快速上手教程
- [MCP 服务器 API](integration/mcp-server-api.md) - AI 智能体集成接口
- [CLI 工具参考](integration/cli-reference.md) - 命令行工具使用指南
- [TypeScript SDK 指南](integration/sdk-guide.md) - SDK 使用方法
- [REST API 文档](integration/rest-api.md) - RESTful API 接口
- [GraphQL API 文档](integration/graphql-api.md) - GraphQL 查询接口
- [WebSocket API 文档](integration/websocket-api.md) - 实时通信接口
- [集成示例](integration/integration-examples.md) - 实际使用示例
- [故障排查](integration/troubleshooting.md) - 常见问题解决

### 英文技术文档（待翻译）
- [审计系统架构](architecture/audit-system.md) - 审计系统详细设计
- API 文档目录 - 详细的 API 接口规范
- 运维文档目录 - 部署和运维指南

## 文档更新策略

### 优先级
1. **用户文档**：优先翻译和更新（集成层文档已完成）
2. **开发文档**：逐步翻译技术架构和 API 文档
3. **运维文档**：根据实际需求更新

### 翻译计划
- 短期：完成架构文档的中文翻译
- 中期：完成 API 文档的翻译和更新
- 长期：建立双语文档体系

## 文档贡献

欢迎贡献文档翻译和改进！请参考以下流程：

1. **选择文档**：从待翻译列表中选择文档
2. **创建翻译**：创建中文版本（可保留英文原文件）
3. **提交 PR**：提交到项目仓库
4. **审查合并**：经过审查后合并

### 翻译指南
- 保持技术术语的一致性
- 确保翻译准确，不影响技术含义
- 添加必要的注释说明
- 更新目录和链接

## 相关资源

- [项目主文档](../README.md) - 项目综合介绍
- [AI 智能体开发预设定](../agent_development_preset.md) - 开发标准
- [部署指南](../DEPLOYMENT_GUIDE.md) - 详细部署说明
- [贡献指南](../CONTRIBUTING.md) - 如何参与项目

## 文档版本

| 版本 | 日期 | 更新说明 |
|------|------|----------|
| 1.0 | 2025-04-12 | 初始版本，集成层文档完成翻译 |
| 1.1 | 2025-04-13 | 添加文档状态说明和翻译计划 |

---

*文档是项目的重要组成部分，我们致力于提供全面、准确、易用的文档支持。*