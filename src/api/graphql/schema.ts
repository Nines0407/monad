import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar JSON
  scalar DateTime

  enum PaymentStatus {
    PENDING
    APPROVED
    REJECTED
    EXECUTED
    FAILED
  }

  enum PaymentCategory {
    API
    COMPUTE
    STORAGE
    DATA
    SERVICE
    OTHER
  }

  enum PolicyDecisionType {
    ALLOW
    DENY
    REQUIRE_APPROVAL
  }

  type Payment {
    id: ID!
    transactionHash: String
    taskId: String!
    agentId: String!
    userId: String!
    amount: String!
    currency: String!
    recipient: String!
    status: PaymentStatus!
    category: PaymentCategory!
    reason: String
    createdAt: DateTime!
    updatedAt: DateTime!
    executedAt: DateTime
    policyDecisions: [PolicyDecision!]!
    auditEvents: [AuditEvent!]!
    sessionKeyEvents: [SessionKeyEvent!]!
    manualApprovals: [ManualApproval!]!
  }

  type PolicyDecision {
    id: ID!
    paymentId: String!
    policyId: String!
    decision: PolicyDecisionType!
    evaluatedRules: JSON!
    violations: JSON!
    createdAt: DateTime!
  }

  type AuditEvent {
    id: ID!
    eventType: String!
    actorType: String!
    actorId: String!
    targetType: String
    targetId: String
    metadata: JSON!
    createdAt: DateTime!
  }

  type SessionKeyEvent {
    id: ID!
    sessionKey: String!
    eventType: String!
    permissionsSnapshot: JSON!
    relatedPaymentId: String
    createdAt: DateTime!
  }

  type ManualApproval {
    id: ID!
    paymentId: String!
    approverId: String!
    decision: String!
    reason: String
    approvedAt: DateTime!
  }

  type PaymentSearchResult {
    payments: [Payment!]!
    total: Int!
    page: Int!
    pageSize: Int!
  }

  input PaymentSearchInput {
    userId: String
    agentId: String
    taskId: String
    status: PaymentStatus
    category: PaymentCategory
    dateFrom: DateTime
    dateTo: DateTime
    minAmount: String
    maxAmount: String
    recipient: String
  }

  input QueryOptionsInput {
    limit: Int
    offset: Int
    orderBy: String
    orderDirection: String
  }

  type Query {
    # Payment queries
    payments(
      criteria: PaymentSearchInput
      options: QueryOptionsInput
    ): PaymentSearchResult!
    payment(id: ID!): Payment
    paymentsByTaskId(taskId: String!): [Payment!]!
    paymentsByAgentId(agentId: String!, options: QueryOptionsInput): [Payment!]!
    paymentsByUserId(userId: String!, options: QueryOptionsInput): [Payment!]!
    
    # Audit event queries
    auditEvents(
      eventType: String
      actorType: String
      actorId: String
      targetType: String
      targetId: String
      dateFrom: DateTime
      dateTo: DateTime
      limit: Int
    ): [AuditEvent!]!
    
    # Policy decision queries
    policyDecisions(paymentId: String!): [PolicyDecision!]!
    policyStatistics(from: DateTime!, to: DateTime!): JSON!
  }

  type Mutation {
    # Payment mutations
    createPayment(input: JSON!): Payment!
    updatePaymentStatus(id: ID!, status: PaymentStatus!): Payment!
    
    # Audit event mutations
    logAuditEvent(input: JSON!): Boolean!
    
    # Policy decision mutations
    createPolicyDecision(input: JSON!): PolicyDecision!
    
    # Manual approval mutations
    createManualApproval(input: JSON!): ManualApproval!
  }
`;