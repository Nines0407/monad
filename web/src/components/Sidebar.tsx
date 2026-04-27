import React from 'react';
import { 
  Home, 
  CreditCard, 
  FileText, 
  BarChart3, 
  Settings,
  Shield,
  Database,
  Users
} from 'lucide-react';

const menuItems = [
  { icon: Home, label: 'Dashboard', active: true },
  { icon: CreditCard, label: 'Payments', count: 24 },
  { icon: FileText, label: 'Audit Events', count: 156 },
  { icon: BarChart3, label: 'Statistics' },
  { icon: Shield, label: 'Policy Decisions' },
  { icon: Database, label: 'Session Keys' },
  { icon: Users, label: 'Manual Approvals' },
  { icon: Settings, label: 'Settings' },
];

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-120px)]">
      <div className="p-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Navigation
        </h2>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <a
              key={item.label}
              href="#"
              className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                item.active
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
              </div>
              {item.count && (
                <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                  {item.count}
                </span>
              )}
            </a>
          ))}
        </nav>
      </div>
      
      <div className="mt-6 px-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Quick Actions
        </h2>
        <div className="space-y-3">
          <button className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            <CreditCard className="w-4 h-4" />
            <span>New Payment</span>
          </button>
          <button className="w-full flex items-center justify-center space-x-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors">
            <FileText className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>
      
      <div className="mt-8 px-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">System Health</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">API Status</span>
              <span className="font-medium text-green-600">✓ Healthy</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Database</span>
              <span className="font-medium text-green-600">✓ Connected</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Last Audit</span>
              <span className="font-medium">5 min ago</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;