import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from '../api';
import type { Payment } from '../types/models';
import { format } from 'date-fns';
import { ExternalLink, CheckCircle, XCircle, Clock, AlertCircle, CreditCard } from 'lucide-react';

const statusIcons = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  executed: CheckCircle,
  failed: AlertCircle,
};

const statusColors = {
  pending: 'text-amber-600 bg-amber-50',
  approved: 'text-green-600 bg-green-50',
  rejected: 'text-red-600 bg-red-50',
  executed: 'text-blue-600 bg-blue-50',
  failed: 'text-red-600 bg-red-50',
};

const RecentPayments: React.FC = () => {
  const { data: payments, isLoading, error } = useQuery({
    queryKey: ['payments', 'recent'],
    queryFn: () => paymentsApi.getAll({ limit: 5, orderBy: 'created_at', orderDirection: 'desc' }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-gray-500">
        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p>Failed to load payments. Please check your connection.</p>
        <button className="mt-3 text-sm text-purple-600 hover:text-purple-700">
          Retry
        </button>
      </div>
    );
  }

  const recentPayments = payments?.data || [];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Task / Agent</th>
            <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Amount</th>
            <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Recipient</th>
            <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Status</th>
            <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {recentPayments.length > 0 ? (
            recentPayments.map((payment: Payment) => {
              const StatusIcon = statusIcons[payment.status];
              return (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="py-3 px-2">
                    <div>
                      <p className="font-medium text-gray-900">{payment.task_id}</p>
                      <p className="text-sm text-gray-500">{payment.agent_id}</p>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="font-medium text-gray-900">
                      {payment.amount} {payment.currency}
                    </div>
                    <div className="text-sm text-gray-500 capitalize">{payment.category}</div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="font-mono text-sm text-gray-900 truncate max-w-[120px]">
                      {payment.recipient}
                    </div>
                    {payment.transaction_hash && (
                      <button className="mt-1 flex items-center text-xs text-purple-600 hover:text-purple-700">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View Tx
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[payment.status]}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {payment.status}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="text-sm text-gray-900">
                      {format(new Date(payment.created_at), 'MMM d')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(payment.created_at), 'HH:mm')}
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={5} className="py-8 text-center text-gray-500">
                <div className="flex flex-col items-center">
                  <CreditCard className="w-12 h-12 text-gray-300 mb-3" />
                  <p>No payments found</p>
                  <p className="text-sm mt-1">Payments will appear here when agents make requests</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RecentPayments;