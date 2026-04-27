import React from 'react';
import { 
  DollarSign, 
  CreditCard, 
  CheckCircle, 
  AlertCircle,
  Clock
} from 'lucide-react';
import RecentPayments from './RecentPayments';
import AuditEvents from './AuditEvents';
import StatisticsChart from './StatisticsChart';

const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Total Payments',
      value: '1,248',
      change: '+12.5%',
      icon: DollarSign,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      title: 'Active Agents',
      value: '8',
      change: '+2',
      icon: CreditCard,
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
    {
      title: 'Approval Rate',
      value: '94.2%',
      change: '+3.1%',
      icon: CheckCircle,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
    },
    {
      title: 'Policy Violations',
      value: '12',
      change: '-4',
      icon: AlertCircle,
      color: 'bg-amber-500',
      textColor: 'text-amber-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitor and manage all payment activities across AI Agents</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className={`text-sm font-medium mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change} from last week
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Payments */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Payments</h2>
                <button className="text-sm font-medium text-purple-600 hover:text-purple-700">
                  View all →
                </button>
              </div>
            </div>
            <div className="p-6">
              <RecentPayments />
            </div>
          </div>
        </div>

        {/* Audit Events */}
        <div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Audit Events</h2>
                <Clock className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="p-6">
              <AuditEvents />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Payment Statistics</h2>
            <div className="flex items-center space-x-4">
              <button className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1 rounded-lg hover:bg-gray-50">
                Daily
              </button>
              <button className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-lg">
                Weekly
              </button>
              <button className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1 rounded-lg hover:bg-gray-50">
                Monthly
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <StatisticsChart />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;