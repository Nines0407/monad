import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const paymentData = [
  { day: 'Mon', payments: 42, amount: 1250 },
  { day: 'Tue', payments: 38, amount: 980 },
  { day: 'Wed', payments: 56, amount: 2100 },
  { day: 'Thu', payments: 47, amount: 1560 },
  { day: 'Fri', payments: 62, amount: 1890 },
  { day: 'Sat', payments: 34, amount: 870 },
  { day: 'Sun', payments: 28, amount: 650 },
];

const categoryData = [
  { category: 'API', count: 124, percent: 40 },
  { category: 'Compute', count: 78, percent: 25 },
  { category: 'Storage', count: 62, percent: 20 },
  { category: 'Data', count: 31, percent: 10 },
  { category: 'Other', count: 15, percent: 5 },
];

const StatisticsChart: React.FC = () => {
  const [chartType, setChartType] = React.useState<'line' | 'bar'>('line');

  return (
    <div className="space-y-8">
      {/* Payment Trends */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Payment Trends (Last 7 Days)</h3>
          <div className="flex space-x-2">
            <button 
              onClick={() => setChartType('line')}
              className={`px-3 py-1 text-sm rounded-lg ${chartType === 'line' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Line
            </button>
            <button 
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 text-sm rounded-lg ${chartType === 'bar' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Bar
            </button>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={paymentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  formatter={(value) => [`${value}`, chartType === 'line' ? 'Payments' : 'Amount']}
                  labelFormatter={(label) => `Day: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="payments" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            ) : (
              <BarChart data={paymentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Bar dataKey="amount" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Categories</h3>
        <div className="space-y-3">
          {categoryData.map((item) => (
            <div key={item.category} className="flex items-center">
              <div className="w-24 text-sm font-medium text-gray-700">{item.category}</div>
              <div className="flex-1">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
              <div className="w-16 text-right">
                <span className="text-sm font-medium text-gray-900">{item.count}</span>
                <span className="text-xs text-gray-500 ml-1">({item.percent}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
          <p className="text-sm font-medium text-blue-700">Avg. Payment Amount</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">$1,240</p>
          <p className="text-xs text-blue-600 mt-1">+8.2% from last week</p>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
          <p className="text-sm font-medium text-green-700">Success Rate</p>
          <p className="text-2xl font-bold text-green-900 mt-1">96.7%</p>
          <p className="text-xs text-green-600 mt-1">+1.4% from last week</p>
        </div>
      </div>
    </div>
  );
};

export default StatisticsChart;