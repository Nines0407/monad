import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditEventsApi } from '../api';
import type { AuditEvent } from '../types/models';
import { format } from 'date-fns';
import { 
  FileText, 
  Shield, 
  User, 
  Key, 
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

const eventIcons = {
  payment_created: FileText,
  policy_updated: Shield,
  key_registered: Key,
  emergency_paused: AlertTriangle,
  user_login: User,
  permission_changed: RefreshCw,
  system_alert: AlertTriangle,
  export_generated: CheckCircle,
};

const eventColors = {
  payment_created: 'bg-blue-100 text-blue-700',
  policy_updated: 'bg-purple-100 text-purple-700',
  key_registered: 'bg-green-100 text-green-700',
  emergency_paused: 'bg-red-100 text-red-700',
  user_login: 'bg-gray-100 text-gray-700',
  permission_changed: 'bg-amber-100 text-amber-700',
  system_alert: 'bg-red-100 text-red-700',
  export_generated: 'bg-green-100 text-green-700',
};

const AuditEvents: React.FC = () => {
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['audit-events', 'recent'],
    queryFn: () => auditEventsApi.getAll({ limit: 6, orderBy: 'created_at', orderDirection: 'desc' }),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-100 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-gray-500">
        <AlertTriangle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm">Failed to load audit events</p>
      </div>
    );
  }

  const recentEvents = events?.data || [];

  return (
    <div className="space-y-4">
      {recentEvents.length > 0 ? (
        recentEvents.map((event: AuditEvent) => {
          const EventIcon = eventIcons[event.event_type] || FileText;
          return (
            <div key={event.id} className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${eventColors[event.event_type] || 'bg-gray-100'}`}>
                <EventIcon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {event.event_type.replace(/_/g, ' ')}
                  </p>
                  <span className="text-xs text-gray-500">
                    {format(new Date(event.created_at), 'HH:mm')}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {event.actor_type}: {event.actor_id}
                  {event.target_type && ` → ${event.target_type}: ${event.target_id}`}
                </p>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-4 text-gray-500">
          <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm">No audit events found</p>
        </div>
      )}
      
      {recentEvents.length > 0 && (
        <button className="w-full mt-4 text-center text-sm font-medium text-purple-600 hover:text-purple-700 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
          View all events
        </button>
      )}
    </div>
  );
};

export default AuditEvents;