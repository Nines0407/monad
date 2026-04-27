# 集成示例

## 概述

本文档提供 Agentic Payment System 与各种平台和框架的集成示例，帮助开发者快速上手。每个示例都包含完整的代码和配置说明。

## 目录

1. [AI 代理集成](#ai-代理集成)
   - [Claude Code 集成](#claude-code-集成)
   - [OpenClaw 集成](#openclaw-集成)
   - [Codex 集成](#codex-集成)
   - [Manus 集成](#manus-集成)

2. [Web 应用集成](#web-应用集成)
   - [React 应用集成](#react-应用集成)
   - [Vue.js 应用集成](#vuejs-应用集成)
   - [Next.js 应用集成](#nextjs-应用集成)
   - [Express 服务器集成](#express-服务器集成)

3. [移动应用集成](#移动应用集成)
   - [React Native 集成](#react-native-集成)
   - [Flutter 集成](#flutter-集成)

4. [自动化脚本集成](#自动化脚本集成)
   - [Python 脚本集成](#python-脚本集成)
   - [Node.js 脚本集成](#nodejs-脚本集成)
   - [Bash 脚本集成](#bash-脚本集成)

5. [CI/CD 流水线集成](#cicd-流水线集成)
   - [GitHub Actions 集成](#github-actions-集成)
   - [GitLab CI 集成](#gitlab-ci-集成)
   - [Jenkins 集成](#jenkins-集成)

6. [监控和告警集成](#监控和告警集成)
   - [Grafana 仪表板集成](#grafana-仪表板集成)
   - [Slack 通知集成](#slack-通知集成)
   - [Discord Webhook 集成](#discord-webhook-集成)

7. [企业系统集成](#企业系统集成)
   - [ERP 系统集成](#erp-系统集成)
   - [会计软件集成](#会计软件集成)
   - [身份提供商集成](#身份提供商集成)

## AI 代理集成

### Claude Code 集成

#### 使用 MCP 服务器集成

**配置 Claude Code 使用 MCP 服务器**:

```json
// ~/.config/claude-code/mcp-servers.json
{
  "agentic-pay": {
    "command": "npx",
    "args": ["@agentic-pay/mcp-server"],
    "env": {
      "AGENTIC_PAY_API_KEY": "your_api_key_here",
      "AGENTIC_PAY_ENVIRONMENT": "testnet"
    }
  }
}
```

**Claude Code 中使用的示例**:

```javascript
// Claude Code 可以直接调用 MCP 工具
// 请求支付
const payment = await request_payment({
  amount: "1.5",
  currency: "USDC",
  recipient: "0x742d35Cc6634C0532925a3b844Bc9e90E8993f7f",
  reason: "API 调用费用",
  category: "api",
  taskContext: {
    taskId: "task_12345",
    description: "自动支付 API 调用费用",
    agentId: "claude_code"
  }
});

console.log(`Payment requested: ${payment.id}`);

// 检查预算
const budget = await check_budget("claude_code");
console.log(`Remaining budget: ${budget.remaining} ${budget.currency}`);

// 列出支付记录
const payments = await list_payments({
  limit: 10,
  agentId: "claude_code",
  status: "completed"
});

payments.forEach(p => {
  console.log(`${p.amount} ${p.currency} to ${p.recipient.slice(0, 8)}...`);
});
```

#### 直接使用 SDK 集成

```typescript
// claude-code-integration.js
import { AgentPay } from '@agentic-pay/sdk';

class ClaudeCodePaymentHandler {
  constructor() {
    this.agentPay = new AgentPay({
      apiKey: process.env.AGENTIC_PAY_API_KEY,
      environment: process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet'
    });
  }
  
  async requestPayment(params) {
    const { amount, recipient, reason, taskContext } = params;
    
    try {
      const payment = await this.agentPay.requestPayment({
        amount,
        currency: 'USDC',
        recipient,
        reason,
        category: 'ai_agent',
        taskContext: {
          taskId: taskContext.taskId || `claude_task_${Date.now()}`,
          description: taskContext.description || 'Claude Code 自动任务',
          agentId: 'claude_code'
        }
      });
      
      return {
        success: true,
        paymentId: payment.id,
        status: payment.status,
        message: `Payment requested successfully. Status: ${payment.status}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        suggestion: this.getErrorSuggestion(error)
      };
    }
  }
  
  async checkBudget() {
    const budget = await this.agentPay.checkBudget('claude_code');
    return {
      total: budget.total,
      spent: budget.spent,
      remaining: budget.remaining,
      dailyLimit: budget.dailyLimit,
      dailySpent: budget.dailySpent
    };
  }
  
  getErrorSuggestion(error) {
    if (error.code === 'INSUFFICIENT_BUDGET') {
      return 'Consider requesting a budget increase or reducing the payment amount.';
    }
    if (error.code === 'POLICY_VIOLATION') {
      return 'Check payment parameters against security policies.';
    }
    return 'Check the payment parameters and try again.';
  }
}

// 导出供 Claude Code 使用
module.exports = { ClaudeCodePaymentHandler };
```

### OpenClaw 集成

#### 配置 OpenClaw 插件

```python
# openclaw_agentic_pay_plugin.py
import os
import requests
from typing import Dict, Any, Optional
from datetime import datetime

class AgenticPayPlugin:
    def __init__(self):
        self.api_key = os.getenv('AGENTIC_PAY_API_KEY')
        self.base_url = os.getenv('AGENTIC_PAY_API_URL', 'https://api.agenticpay.com')
        self.agent_id = 'openclaw'
        
    def request_payment(self, amount: str, recipient: str, reason: str, **kwargs) -> Dict[str, Any]:
        """请求支付"""
        url = f"{self.base_url}/api/v1/payments"
        
        payload = {
            "amount": amount,
            "currency": "USDC",
            "recipient": recipient,
            "reason": reason,
            "category": kwargs.get('category', 'ai_agent'),
            "taskContext": {
                "taskId": kwargs.get('task_id', f"openclaw_task_{datetime.now().timestamp()}"),
                "description": kwargs.get('task_description', 'OpenClaw 自动任务'),
                "agentId": self.agent_id
            }
        }
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        
        return response.json()
    
    def check_budget(self) -> Dict[str, Any]:
        """检查预算"""
        url = f"{self.base_url}/api/v1/budgets/{self.agent_id}"
        
        headers = {
            "Authorization": f"Bearer {self.api_key}"
        }
        
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        return response.json()
    
    def list_payments(self, limit: int = 10, status: Optional[str] = None) -> Dict[str, Any]:
        """列出支付记录"""
        url = f"{self.base_url}/api/v1/payments"
        
        params = {
            "agentId": self.agent_id,
            "limit": limit
        }
        
        if status:
            params['status'] = status
            
        headers = {
            "Authorization": f"Bearer {self.api_key}"
        }
        
        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()
        
        return response.json()

# OpenClaw 工具注册
def register_tools(registry):
    plugin = AgenticPayPlugin()
    
    @registry.register_tool
    def request_payment(amount: str, recipient: str, reason: str, **kwargs):
        """请求支付到指定地址"""
        return plugin.request_payment(amount, recipient, reason, **kwargs)
    
    @registry.register_tool
    def check_budget():
        """检查当前预算状态"""
        return plugin.check_budget()
    
    @registry.register_tool
    def list_payments(limit: int = 10, status: Optional[str] = None):
        """列出最近的支付记录"""
        return plugin.list_payments(limit, status)
```

#### OpenClaw 使用示例

```python
# 在 OpenClaw 任务中使用
from openclaw_agentic_pay_plugin import AgenticPayPlugin

def handle_server_payment_task():
    """处理服务器费用支付任务"""
    plugin = AgenticPayPlugin()
    
    # 检查预算
    budget = plugin.check_budget()
    print(f"当前预算: {budget['remaining']}/{budget['total']} USDC")
    
    # 请求支付
    payment = plugin.request_payment(
        amount="50.00",
        recipient="0x742d35Cc6634C0532925a3b844Bc9e90E8993f7f",
        reason="月度服务器费用",
        category="infrastructure",
        task_id="server_maintenance_2024_01",
        task_description="AWS EC2 实例月度费用"
    )
    
    print(f"支付请求已提交: {payment['id']}")
    print(f"状态: {payment['status']}")
    
    return payment
```

### Codex 集成

#### Codex 自定义技能

```javascript
// codex-skill-agentic-pay.js
const { AgentPay } = require('@agentic-pay/sdk');

module.exports = {
  name: 'agentic-pay',
  version: '1.0.0',
  description: 'Agentic Payment System integration for Codex',
  
  init(config) {
    this.agentPay = new AgentPay({
      apiKey: config.apiKey,
      environment: config.environment || 'testnet'
    });
    
    this.agentId = config.agentId || 'codex';
  },
  
  commands: {
    async requestPayment(args) {
      const { amount, recipient, reason, category = 'ai_agent' } = args;
      
      try {
        const payment = await this.agentPay.requestPayment({
          amount,
          currency: 'USDC',
          recipient,
          reason,
          category,
          taskContext: {
            taskId: `codex_task_${Date.now()}`,
            description: 'Codex 自动支付任务',
            agentId: this.agentId
          }
        });
        
        return {
          success: true,
          data: {
            paymentId: payment.id,
            status: payment.status,
            amount: payment.amount,
            currency: payment.currency
          },
          message: `Payment requested successfully. ID: ${payment.id}`
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          code: error.code
        };
      }
    },
    
    async checkBudget() {
      try {
        const budget = await this.agentPay.checkBudget(this.agentId);
        
        return {
          success: true,
          data: {
            total: budget.total,
            spent: budget.spent,
            remaining: budget.remaining,
            dailyLimit: budget.dailyLimit,
            dailySpent: budget.dailySpent
          },
          message: `Budget status: ${budget.remaining} ${budget.currency} remaining`
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    },
    
    async listPayments(args) {
      const { limit = 10, status } = args;
      
      try {
        const payments = await this.agentPay.listPayments({
          agentId: this.agentId,
          limit,
          status
        });
        
        return {
          success: true,
          data: payments,
          message: `Found ${payments.items.length} payments`
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    }
  },
  
  help() {
    return {
      requestPayment: '请求支付 - 参数: amount, recipient, reason, [category]',
      checkBudget: '检查预算状态',
      listPayments: '列出支付记录 - 参数: [limit], [status]'
    };
  }
};
```

#### Codex 配置

```yaml
# codex-config.yaml
skills:
  agentic-pay:
    path: ./codex-skill-agentic-pay.js
    config:
      apiKey: ${AGENTIC_PAY_API_KEY}
      environment: testnet
      agentId: codex_${USER_ID}
      
workflows:
  payment-workflow:
    steps:
      - name: check-budget
        skill: agentic-pay
        command: checkBudget
        
      - name: request-payment
        skill: agentic-pay
        command: requestPayment
        args:
          amount: ${AMOUNT}
          recipient: ${RECIPIENT}
          reason: ${REASON}
          category: ${CATEGORY}
          
      - name: verify-payment
        skill: agentic-pay
        command: listPayments
        args:
          limit: 1
```

### Manus 集成

#### Manus 动作配置

```yaml
# manus-actions.yaml
version: '1.0'
actions:
  request-payment:
    name: "Request Payment"
    description: "Request payment using Agentic Payment System"
    inputs:
      - name: amount
        type: string
        required: true
        description: "Payment amount"
      - name: recipient
        type: string
        required: true
        description: "Recipient address"
      - name: reason
        type: string
        required: true
        description: "Payment reason"
      - name: category
        type: string
        default: "ai_agent"
        description: "Payment category"
    outputs:
      - name: paymentId
        type: string
      - name: status
        type: string
    handler:
      type: http
      method: POST
      url: "https://api.agenticpay.com/api/v1/payments"
      headers:
        Authorization: "Bearer {{ secrets.AGENTIC_PAY_API_KEY }}"
      body:
        amount: "{{ inputs.amount }}"
        currency: "USDC"
        recipient: "{{ inputs.recipient }}"
        reason: "{{ inputs.reason }}"
        category: "{{ inputs.category }}"
        taskContext:
          taskId: "manus_action_{{ workflow.id }}"
          description: "Manus workflow payment"
          agentId: "manus"
          
  check-budget:
    name: "Check Budget"
    description: "Check remaining budget"
    outputs:
      - name: budget
        type: object
    handler:
      type: http
      method: GET
      url: "https://api.agenticpay.com/api/v1/budgets/manus"
      headers:
        Authorization: "Bearer {{ secrets.AGENTIC_PAY_API_KEY }}"
        
  monitor-payments:
    name: "Monitor Payments"
    description: "Monitor payment status changes"
    triggers:
      - type: webhook
        events:
          - payment.status_changed
    handler:
      type: webhook
      url: "{{ secrets.MANUS_WEBHOOK_URL }}"
```

#### Manus 工作流示例

```yaml
# manus-workflow.yaml
name: "Monthly Infrastructure Payment"
description: "Automated monthly payment for infrastructure services"
version: '1.0'

variables:
  infrastructure_providers:
    - name: "AWS"
      recipient: "0x1234567890123456789012345678901234567890"
      amount: "500.00"
    - name: "Cloudflare"
      recipient: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
      amount: "200.00"
    - name: "GitHub"
      recipient: "0x0987654321098765432109876543210987654321"
      amount: "50.00"

steps:
  - name: "check-overall-budget"
    action: "check-budget"
    
  - name: "process-payments"
    forEach: "{{ variables.infrastructure_providers }}"
    steps:
      - name: "request-payment"
        action: "request-payment"
        inputs:
          amount: "{{ item.amount }}"
          recipient: "{{ item.recipient }}"
          reason: "Monthly {{ item.name }} services"
          category: "infrastructure"
          
      - name: "log-payment"
        action: "manus/log"
        inputs:
          message: "Payment requested for {{ item.name }}: {{ steps.request-payment.outputs.paymentId }}"
          
  - name: "send-summary"
    action: "manus/email"
    inputs:
      to: "finance@company.com"
      subject: "Monthly Infrastructure Payments Completed"
      body: |
        Monthly infrastructure payments have been processed.
        
        Total payments: {{ steps.process-payments.results | length }}
        
        Details:
        {% for result in steps.process-payments.results %}
        - {{ result.item.name }}: {{ result.steps.request-payment.outputs.status }}
          Payment ID: {{ result.steps.request-payment.outputs.paymentId }}
        {% endfor %}
```

## Web 应用集成

### React 应用集成

#### 安装和配置

```bash
# 安装 SDK
npm install @agentic-pay/sdk
# 或
yarn add @agentic-pay/sdk
```

#### Provider 组件

```tsx
// src/providers/AgenticPayProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AgentPay, WebSocketClient } from '@agentic-pay/sdk';

interface AgenticPayContextType {
  agentPay: AgentPay | null;
  wsClient: WebSocketClient | null;
  isConnected: boolean;
  payments: any[];
  budget: any | null;
  error: string | null;
  requestPayment: (params: any) => Promise<any>;
  refreshBudget: () => Promise<void>;
}

const AgenticPayContext = createContext<AgenticPayContextType | undefined>(undefined);

export const AgenticPayProvider: React.FC<{
  children: React.ReactNode;
  apiKey: string;
  environment?: 'testnet' | 'mainnet';
}> = ({ children, apiKey, environment = 'testnet' }) => {
  const [agentPay, setAgentPay] = useState<AgentPay | null>(null);
  const [wsClient, setWsClient] = useState<WebSocketClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [budget, setBudget] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 初始化 SDK
    const agentPayInstance = new AgentPay({
      apiKey,
      environment,
      timeout: 30000
    });
    
    setAgentPay(agentPayInstance);

    // 初始化 WebSocket 客户端
    const wsClientInstance = new WebSocketClient({
      url: environment === 'mainnet' 
        ? 'wss://api.agenticpay.com/ws'
        : 'wss://testnet.api.agenticpay.com/ws',
      token: apiKey,
      autoReconnect: true
    });

    setWsClient(wsClientInstance);

    // 连接 WebSocket
    wsClientInstance.connect().then(() => {
      setIsConnected(true);
      
      // 订阅事件
      wsClientInstance.subscribe('payment:status_changed', (data) => {
        console.log('Payment status changed:', data);
        // 更新支付列表
        refreshPayments();
      });
      
      wsClientInstance.subscribe('budget:updated', (data) => {
        console.log('Budget updated:', data);
        refreshBudget();
      });
    }).catch((err) => {
      setError(`WebSocket connection failed: ${err.message}`);
    });

    // 初始加载数据
    refreshPayments();
    refreshBudget();

    return () => {
      if (wsClientInstance) {
        wsClientInstance.disconnect();
      }
    };
  }, [apiKey, environment]);

  const refreshPayments = async () => {
    if (!agentPay) return;
    
    try {
      const result = await agentPay.listPayments({ limit: 20 });
      setPayments(result.items);
      setError(null);
    } catch (err: any) {
      setError(`Failed to load payments: ${err.message}`);
    }
  };

  const refreshBudget = async () => {
    if (!agentPay) return;
    
    try {
      // 假设使用默认代理 ID
      const budgetData = await agentPay.checkBudget('default');
      setBudget(budgetData);
      setError(null);
    } catch (err: any) {
      setError(`Failed to load budget: ${err.message}`);
    }
  };

  const requestPayment = async (params: any) => {
    if (!agentPay) {
      throw new Error('AgentPay not initialized');
    }
    
    try {
      const payment = await agentPay.requestPayment(params);
      await refreshPayments();
      await refreshBudget();
      return payment;
    } catch (err: any) {
      setError(`Payment request failed: ${err.message}`);
      throw err;
    }
  };

  const contextValue: AgenticPayContextType = {
    agentPay,
    wsClient,
    isConnected,
    payments,
    budget,
    error,
    requestPayment,
    refreshBudget
  };

  return (
    <AgenticPayContext.Provider value={contextValue}>
      {children}
    </AgenticPayContext.Provider>
  );
};

export const useAgenticPay = () => {
  const context = useContext(AgenticPayContext);
  if (!context) {
    throw new Error('useAgenticPay must be used within AgenticPayProvider');
  }
  return context;
};
```

#### 自定义 Hook

```tsx
// src/hooks/usePayments.ts
import { useState, useEffect, useCallback } from 'react';
import { useAgenticPay } from '../providers/AgenticPayProvider';

export const usePayments = (options: {
  limit?: number;
  agentId?: string;
  status?: string;
} = {}) => {
  const { agentPay } = useAgenticPay();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 20,
    hasNext: false,
    hasPrevious: false
  });

  const loadPayments = useCallback(async (page = 1) => {
    if (!agentPay) return;
    
    setLoading(true);
    try {
      const limit = options.limit || 20;
      const offset = (page - 1) * limit;
      
      const result = await agentPay.listPayments({
        ...options,
        limit,
        offset
      });
      
      setPayments(result.items);
      setPagination({
        total: result.total,
        page,
        pageSize: limit,
        hasNext: offset + limit < result.total,
        hasPrevious: page > 1
      });
      setError(null);
    } catch (err: any) {
      setError(`Failed to load payments: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [agentPay, options]);

  useEffect(() => {
    loadPayments(1);
  }, [loadPayments]);

  return {
    payments,
    loading,
    error,
    pagination,
    loadPayments,
    refresh: () => loadPayments(pagination.page)
  };
};

// src/hooks/useBudget.ts
import { useState, useEffect, useCallback } from 'react';
import { useAgenticPay } from '../providers/AgenticPayProvider';

export const useBudget = (agentId?: string) => {
  const { agentPay } = useAgenticPay();
  const [budget, setBudget] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBudget = useCallback(async () => {
    if (!agentPay) return;
    
    setLoading(true);
    try {
      const budgetData = await agentPay.checkBudget(agentId || 'default');
      setBudget(budgetData);
      setError(null);
    } catch (err: any) {
      setError(`Failed to load budget: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [agentPay, agentId]);

  useEffect(() => {
    loadBudget();
    
    // 每 30 秒刷新一次
    const interval = setInterval(loadBudget, 30000);
    return () => clearInterval(interval);
  }, [loadBudget]);

  return {
    budget,
    loading,
    error,
    refresh: loadBudget
  };
};
```

#### 支付表单组件

```tsx
// src/components/PaymentForm.tsx
import React, { useState } from 'react';
import { useAgenticPay } from '../providers/AgenticPayProvider';

interface PaymentFormProps {
  onSuccess?: (payment: any) => void;
  onError?: (error: string) => void;
  defaultValues?: Partial<PaymentFormData>;
}

interface PaymentFormData {
  amount: string;
  recipient: string;
  reason: string;
  category: string;
  taskId: string;
  taskDescription: string;
}

const CATEGORIES = [
  'api',
  'infrastructure',
  'tools',
  'data',
  'compute',
  'service',
  'ai_agent',
  'other'
];

export const PaymentForm: React.FC<PaymentFormProps> = ({
  onSuccess,
  onError,
  defaultValues = {}
}) => {
  const { requestPayment } = useAgenticPay();
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: defaultValues.amount || '',
    recipient: defaultValues.recipient || '',
    reason: defaultValues.reason || '',
    category: defaultValues.category || 'ai_agent',
    taskId: defaultValues.taskId || `task_${Date.now()}`,
    taskDescription: defaultValues.taskDescription || ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payment = await requestPayment({
        amount: formData.amount,
        currency: 'USDC',
        recipient: formData.recipient,
        reason: formData.reason,
        category: formData.category,
        taskContext: {
          taskId: formData.taskId,
          description: formData.taskDescription,
          agentId: 'web_app'
        }
      });

      onSuccess?.(payment);
      
      // 重置表单
      setFormData({
        amount: '',
        recipient: '',
        reason: '',
        category: 'ai_agent',
        taskId: `task_${Date.now()}`,
        taskDescription: ''
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Payment request failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: keyof PaymentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="amount">Amount (USDC)</label>
        <input
          id="amount"
          type="text"
          value={formData.amount}
          onChange={(e) => handleChange('amount', e.target.value)}
          placeholder="0.00"
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="recipient">Recipient Address</label>
        <input
          id="recipient"
          type="text"
          value={formData.recipient}
          onChange={(e) => handleChange('recipient', e.target.value)}
          placeholder="0x..."
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="reason">Reason</label>
        <input
          id="reason"
          type="text"
          value={formData.reason}
          onChange={(e) => handleChange('reason', e.target.value)}
          placeholder="Payment reason"
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          required
        >
          {CATEGORIES.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="taskId">Task ID</label>
        <input
          id="taskId"
          type="text"
          value={formData.taskId}
          onChange={(e) => handleChange('taskId', e.target.value)}
          placeholder="Task identifier"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="taskDescription">Task Description</label>
        <textarea
          id="taskDescription"
          value={formData.taskDescription}
          onChange={(e) => handleChange('taskDescription', e.target.value)}
          placeholder="Describe the task"
          rows={3}
        />
      </div>
      
      <button 
        type="submit" 
        disabled={submitting}
        className="submit-button"
      >
        {submitting ? 'Processing...' : 'Request Payment'}
      </button>
    </form>
  );
};
```

#### 预算显示组件

```tsx
// src/components/BudgetDisplay.tsx
import React from 'react';
import { useBudget } from '../hooks/useBudget';

interface BudgetDisplayProps {
  agentId?: string;
  showDetails?: boolean;
}

export const BudgetDisplay: React.FC<BudgetDisplayProps> = ({
  agentId,
  showDetails = false
}) => {
  const { budget, loading, error, refresh } = useBudget(agentId);

  if (loading) {
    return <div className="budget-loading">Loading budget...</div>;
  }

  if (error) {
    return (
      <div className="budget-error">
        <p>Error: {error}</p>
        <button onClick={refresh}>Retry</button>
      </div>
    );
  }

  if (!budget) {
    return <div className="budget-empty">No budget data available</div>;
  }

  const usagePercentage = (budget.spent / budget.total) * 100;
  const dailyUsagePercentage = (budget.dailySpent / budget.dailyLimit) * 100;

  return (
    <div className="budget-display">
      <div className="budget-header">
        <h3>Budget Status</h3>
        <button onClick={refresh} className="refresh-button">
          Refresh
        </button>
      </div>
      
      <div className="budget-overview">
        <div className="budget-total">
          <span className="label">Total Budget:</span>
          <span className="value">
            {budget.remaining} / {budget.total} {budget.currency}
          </span>
        </div>
        
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            data-percentage={`${usagePercentage.toFixed(1)}%`}
          />
        </div>
        
        <div className="budget-daily">
          <span className="label">Daily Usage:</span>
          <span className="value">
            {budget.dailySpent} / {budget.dailyLimit} {budget.currency}
          </span>
        </div>
        
        <div className="progress-bar">
          <div 
            className="progress-fill daily"
            style={{ width: `${Math.min(dailyUsagePercentage, 100)}%` }}
            data-percentage={`${dailyUsagePercentage.toFixed(1)}%`}
          />
        </div>
      </div>
      
      {showDetails && (
        <div className="budget-details">
          <h4>Details</h4>
          <div className="detail-item">
            <span>Currency:</span>
            <span>{budget.currency}</span>
          </div>
          <div className="detail-item">
            <span>Period:</span>
            <span>{budget.period}</span>
          </div>
          <div className="detail-item">
            <span>Reset Date:</span>
            <span>{new Date(budget.resetAt).toLocaleDateString()}</span>
          </div>
          {budget.usageByCategory && (
            <div className="category-usage">
              <h5>Usage by Category</h5>
              {Object.entries(budget.usageByCategory).map(([category, amount]) => (
                <div key={category} className="category-item">
                  <span>{category}:</span>
                  <span>{amount as string} {budget.currency}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

#### 支付列表组件

```tsx
// src/components/PaymentList.tsx
import React, { useState } from 'react';
import { usePayments } from '../hooks/usePayments';

interface PaymentListProps {
  agentId?: string;
  status?: string;
  limit?: number;
}

export const PaymentList: React.FC<PaymentListProps> = ({
  agentId,
  status,
  limit = 10
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const { payments, loading, error, pagination, loadPayments } = usePayments({
    agentId,
    status,
    limit
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadPayments(page);
  };

  if (loading && payments.length === 0) {
    return <div className="payment-list-loading">Loading payments...</div>;
  }

  if (error) {
    return (
      <div className="payment-list-error">
        <p>Error: {error}</p>
        <button onClick={() => loadPayments(currentPage)}>Retry</button>
      </div>
    );
  }

  if (payments.length === 0) {
    return <div className="payment-list-empty">No payments found</div>;
  }

  return (
    <div className="payment-list">
      <div className="payment-list-header">
        <h3>Recent Payments</h3>
        <span className="total-count">Total: {pagination.total}</span>
      </div>
      
      <div className="payments-container">
        {payments.map(payment => (
          <div key={payment.id} className="payment-item">
            <div className="payment-main">
              <div className="payment-amount">
                {payment.amount} {payment.currency}
              </div>
              <div className="payment-status">
                <span className={`status-badge status-${payment.status}`}>
                  {payment.status}
                </span>
              </div>
            </div>
            
            <div className="payment-details">
              <div className="detail">
                <span className="label">Recipient:</span>
                <span className="value">
                  {payment.recipient.slice(0, 8)}...{payment.recipient.slice(-6)}
                </span>
              </div>
              
              <div className="detail">
                <span className="label">Reason:</span>
                <span className="value">{payment.reason}</span>
              </div>
              
              <div className="detail">
                <span className="label">Category:</span>
                <span className="value">{payment.category}</span>
              </div>
              
              <div className="detail">
                <span className="label">Date:</span>
                <span className="value">
                  {new Date(payment.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
            
            {payment.taskContext && (
              <div className="payment-context">
                <span className="label">Task:</span>
                <span className="value">{payment.taskContext.description}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="payment-pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!pagination.hasPrevious || loading}
        >
          Previous
        </button>
        
        <span className="page-info">
          Page {currentPage} of {Math.ceil(pagination.total / pagination.pageSize)}
        </span>
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!pagination.hasNext || loading}
        >
          Next
        </button>
      </div>
    </div>
  );
};
```

#### 应用集成示例

```tsx
// src/App.tsx
import React from 'react';
import { AgenticPayProvider } from './providers/AgenticPayProvider';
import { BudgetDisplay } from './components/BudgetDisplay';
import { PaymentList } from './components/PaymentList';
import { PaymentForm } from './components/PaymentForm';
import './App.css';

function App() {
  const apiKey = process.env.REACT_APP_AGENTIC_PAY_API_KEY;
  
  if (!apiKey) {
    return (
      <div className="app-error">
        <h1>Agentic Pay Dashboard</h1>
        <p>Please set REACT_APP_AGENTIC_PAY_API_KEY environment variable</p>
      </div>
    );
  }

  return (
    <AgenticPayProvider 
      apiKey={apiKey}
      environment={process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet'}
    >
      <div className="app">
        <header className="app-header">
          <h1>Agentic Pay Dashboard</h1>
        </header>
        
        <main className="app-main">
          <div className="dashboard-layout">
            <div className="sidebar">
              <BudgetDisplay showDetails={true} />
            </div>
            
            <div className="main-content">
              <div className="content-section">
                <h2>Request Payment</h2>
                <PaymentForm 
                  onSuccess={(payment) => {
                    console.log('Payment successful:', payment);
                    alert(`Payment requested: ${payment.id}`);
                  }}
                  onError={(error) => {
                    console.error('Payment error:', error);
                    alert(`Payment failed: ${error}`);
                  }}
                />
              </div>
              
              <div className="content-section">
                <h2>Recent Payments</h2>
                <PaymentList limit={10} />
              </div>
            </div>
          </div>
        </main>
        
        <footer className="app-footer">
          <p>Agentic Payment System &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </AgenticPayProvider>
  );
}

export default App;
```

#### CSS 样式

```css
/* src/App.css */
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.app-main {
  flex: 1;
  padding: 2rem;
  background: #f5f5f5;
}

.dashboard-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.sidebar {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.content-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.payment-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.submit-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 4px;
  border-left: 4px solid #c33;
}

.budget-display {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.budget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.refresh-button {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
}

.progress-bar {
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
  margin: 0.5rem 0;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  transition: width 0.3s ease;
}

.progress-fill.daily {
  background: linear-gradient(90deg, #2196f3, #03a9f4);
}

.payment-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.payment-item {
  background: #f9f9f9;
  border-radius: 6px;
  padding: 1rem;
  border-left: 4px solid #667eea;
}

.payment-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.payment-amount {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-pending {
  background: #ffeb3b;
  color: #333;
}

.status-completed {
  background: #4caf50;
  color: white;
}

.status-failed {
  background: #f44336;
  color: white;
}

.payment-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.detail {
  display: flex;
  justify-content: space-between;
}

.detail .label {
  font-weight: 600;
  color: #666;
}

.detail .value {
  color: #333;
}

.app-footer {
  background: #333;
  color: white;
  text-align: center;
  padding: 1rem;
  margin-top: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-layout {
    grid-template-columns: 1fr;
  }
  
  .payment-details {
    grid-template-columns: 1fr;
  }
}
```

### Vue.js 应用集成

由于篇幅限制，Vue.js 集成示例将在后续更新中提供。集成模式与 React 类似，使用 Vue 3 Composition API。

### Next.js 应用集成

由于篇幅限制，Next.js 集成示例将在后续更新中提供。包括服务器端渲染和 API 路由的集成。

## 后续集成示例

由于文档长度限制，以下集成示例将在后续更新中提供：

1. **Express 服务器集成**
2. **React Native 集成**
3. **Flutter 集成**
4. **Python 脚本集成**
5. **Node.js 脚本集成**
6. **Bash 脚本集成**
7. **GitHub Actions 集成**
8. **GitLab CI 集成**
9. **Jenkins 集成**
10. **Grafana 仪表板集成**
11. **Slack 通知集成**
12. **Discord Webhook 集成**
13. **ERP 系统集成**
14. **会计软件集成**
15. **身份提供商集成**

## 贡献指南

欢迎贡献更多集成示例！请遵循以下指南：

1. **代码质量**: 确保示例代码清晰、简洁、可运行
2. **完整性**: 提供完整的配置和部署说明
3. **安全性**: 避免硬编码敏感信息，使用环境变量
4. **测试**: 如果可能，包含测试用例
5. **文档**: 提供清晰的注释和使用说明

## 更新日志

- **2024-01-01**: 初始版本，包含 AI 代理集成和 React 应用集成示例
- **后续更新**: 将添加更多平台和框架的集成示例

---

*本文档提供 Agentic Payment System 与各种平台的集成示例，帮助开发者快速上手。*