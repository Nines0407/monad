import { AxiosInstance } from 'axios';
import { AuditEvent, PaginatedResponse, IntegrationError, ErrorCodes } from '@agent-pay/shared';

export interface AuditFilter {
  eventType?: string;
  actorType?: string;
  actorId?: string;
  targetType?: string;
  targetId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface AuditStats {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsByActorType: Record<string, number>;
  eventsByDay: Array<{ date: string; count: number }>;
  recentEvents: AuditEvent[];
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'jsonl';
  includeFields?: string[];
  excludeFields?: string[];
  compression?: 'none' | 'gzip';
}

export class AuditClient {
  constructor(private axiosInstance: AxiosInstance) {}

  /**
   * Get audit events with filtering
   */
  async getEvents(filter: AuditFilter = {}): Promise<PaginatedResponse<AuditEvent>> {
    try {
      const params: Record<string, any> = {};

      if (filter.eventType) params.eventType = filter.eventType;
      if (filter.actorType) params.actorType = filter.actorType;
      if (filter.actorId) params.actorId = filter.actorId;
      if (filter.targetType) params.targetType = filter.targetType;
      if (filter.targetId) params.targetId = filter.targetId;
      if (filter.startDate) params.startDate = filter.startDate.toISOString();
      if (filter.endDate) params.endDate = filter.endDate.toISOString();
      if (filter.limit) params.limit = filter.limit;
      if (filter.offset) params.offset = filter.offset;
      if (filter.orderBy) params.orderBy = filter.orderBy;
      if (filter.orderDirection) params.orderDirection = filter.orderDirection;

      const response = await this.axiosInstance.get<PaginatedResponse<AuditEvent>>('/api/v1/audit/events', { params });
      return response.data;
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      throw new IntegrationError(
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        'Failed to get audit events',
        { filter, originalError: error }
      );
    }
  }

  /**
   * Get audit event by ID
   */
  async getEvent(eventId: string): Promise<AuditEvent> {
    try {
      const response = await this.axiosInstance.get<AuditEvent>(`/api/v1/audit/events/${eventId}`);
      return response.data;
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      throw new IntegrationError(
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        'Failed to get audit event',
        { eventId, originalError: error }
      );
    }
  }

  /**
   * Log a new audit event
   */
  async logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<AuditEvent> {
    try {
      const response = await this.axiosInstance.post<AuditEvent>('/api/v1/audit/events', event);
      return response.data;
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      throw new IntegrationError(
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        'Failed to log audit event',
        { event, originalError: error }
      );
    }
  }

  /**
   * Get audit statistics
   */
  async getStats(options: {
    startDate?: Date;
    endDate?: Date;
    groupBy?: 'hour' | 'day' | 'week' | 'month';
  } = {}): Promise<AuditStats> {
    try {
      const params: Record<string, any> = {};
      if (options.startDate) params.startDate = options.startDate.toISOString();
      if (options.endDate) params.endDate = options.endDate.toISOString();
      if (options.groupBy) params.groupBy = options.groupBy;

      const response = await this.axiosInstance.get<AuditStats>('/api/v1/audit/stats', { params });
      return response.data;
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      throw new IntegrationError(
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        'Failed to get audit statistics',
        { options, originalError: error }
      );
    }
  }

  /**
   * Search audit events
   */
  async searchEvents(query: string, options: {
    field?: 'eventType' | 'actorId' | 'targetId' | 'metadata';
    limit?: number;
    offset?: number;
  } = {}): Promise<AuditEvent[]> {
    try {
      const params: Record<string, any> = { q: query };
      if (options.field) params.field = options.field;
      if (options.limit) params.limit = options.limit;
      if (options.offset) params.offset = options.offset;

      const response = await this.axiosInstance.get<AuditEvent[]>('/api/v1/audit/search', { params });
      return response.data;
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      throw new IntegrationError(
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        'Failed to search audit events',
        { query, options, originalError: error }
      );
    }
  }

  /**
   * Export audit events
   */
  async exportEvents(filter: AuditFilter, options: ExportOptions): Promise<{
    exportId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    downloadUrl?: string;
    estimatedSize?: number;
  }> {
    try {
      const request = {
        filter,
        options,
      };

      const response = await this.axiosInstance.post('/api/v1/audit/export', request);
      return response.data;
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      throw new IntegrationError(
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        'Failed to export audit events',
        { filter, options, originalError: error }
      );
    }
  }

  /**
   * Get export status
   */
  async getExportStatus(exportId: string): Promise<{
    exportId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
    downloadUrl?: string;
    error?: string;
    createdAt: Date;
    completedAt?: Date;
  }> {
    try {
      const response = await this.axiosInstance.get(`/api/v1/audit/export/${exportId}`);
      return response.data;
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      throw new IntegrationError(
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        'Failed to get export status',
        { exportId, originalError: error }
      );
    }
  }

  /**
   * Stream audit events (real-time)
   */
  async streamEvents(filter: AuditFilter, callback: (event: AuditEvent) => void): Promise<{ unsubscribe: () => void }> {
    // This would use WebSocket in a real implementation
    // For now, we'll simulate with polling
    let isActive = true;
    let lastTimestamp = new Date();

    const poll = async () => {
      if (!isActive) return;

      try {
        const events = await this.getEvents({
          ...filter,
          startDate: lastTimestamp,
          orderBy: 'timestamp',
          orderDirection: 'asc',
        });

        events.items.forEach(event => {
          callback(event);
          if (event.timestamp > lastTimestamp) {
            lastTimestamp = event.timestamp;
          }
        });

        // Poll every 5 seconds
        setTimeout(poll, 5000);
      } catch (error) {
        console.error('Error polling audit events:', error);
        if (isActive) {
          setTimeout(poll, 10000); // Retry after 10 seconds on error
        }
      }
    };

    // Start polling
    poll();

    return {
      unsubscribe: () => {
        isActive = false;
      },
    };
  }

  /**
   * Get system health events
   */
  async getSystemHealthEvents(limit: number = 100): Promise<AuditEvent[]> {
    try {
      const response = await this.axiosInstance.get<AuditEvent[]>('/api/v1/audit/system-health', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      throw new IntegrationError(
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        'Failed to get system health events',
        { limit, originalError: error }
      );
    }
  }

  /**
   * Clean up old audit events
   */
  async cleanupOldEvents(retentionDays: number = 365): Promise<{ deletedCount: number; freedSpace: number }> {
    try {
      const response = await this.axiosInstance.post('/api/v1/audit/cleanup', { retentionDays });
      return response.data;
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      throw new IntegrationError(
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        'Failed to cleanup old audit events',
        { retentionDays, originalError: error }
      );
    }
  }
}