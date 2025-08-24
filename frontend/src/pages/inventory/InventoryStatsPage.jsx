import { useEffect, useState } from 'react';
import Loading from '../../components/common/Loading';
import ExpiryAlerts from '../../components/inventory/ExpiryAlerts';
import StockLevels from '../../components/inventory/StockLevels';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getInventoryStats } from '../../services/inventoryService';
import { formatDate } from '../../utils/formatters';

const InventoryStatsPage = () => {
  const { hasPermission } = useAuth();
  const { execute, loading } = useApi();
  const [stats, setStats] = useState({
    totalUnits: 0,
    expiringIn7Days: 0,
    expiringIn3Days: 0,
    lowStockItems: 0,
    byBloodType: {},
    trends: {}
  });
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      const response = await execute(() => getInventoryStats({ period: timeRange }));
      if (response?.data) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch inventory statistics:', error);
    }
  };

  const timeRangeOptions = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 3 months' },
    { value: '365', label: 'Last year' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory Statistics</h1>
            <p className="mt-2 text-gray-600">
              Comprehensive analytics and insights for blood inventory management
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Time Range:</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {timeRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-96">
            <Loading />
          </div>
        ) : (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Blood Units</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalUnits}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <div className="w-8 h-8 text-blue-600">🩸</div>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-gray-500">
                    Updated {formatDate(new Date(), 'DD/MM/YYYY HH:mm')}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Available Units</p>
                    <p className="text-3xl font-bold text-green-600">
                      {stats.availableUnits || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <div className="w-8 h-8 text-green-600">✅</div>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-green-600">
                    {((stats.availableUnits || 0) / stats.totalUnits * 100).toFixed(1)}% of total
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.expiringIn7Days}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <div className="w-8 h-8 text-yellow-600">⏰</div>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-yellow-600">
                    {stats.expiringIn3Days} critical (3 days)
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Low Stock Alerts</p>
                    <p className="text-3xl font-bold text-red-600">{stats.lowStockItems}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <div className="w-8 h-8 text-red-600">📉</div>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-red-600">
                    Requires attention
                  </span>
                </div>
              </div>
            </div>

            {/* Stock Levels by Blood Type */}
            <StockLevels stats={stats} showDetailed={true} />

            {/* Expiry Alerts */}
            <ExpiryAlerts showDetailed={true} />

            {/* Detailed Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Usage Trends */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Usage Trends
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Units Used This Period</span>
                    <span className="font-semibold">{stats.trends?.unitsUsed || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Daily Usage</span>
                    <span className="font-semibold">
                      {(stats.trends?.unitsUsed / parseInt(timeRange) || 0).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Peak Usage Day</span>
                    <span className="font-semibold">
                      {stats.trends?.peakDay || 'Monday'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Wastage Rate</span>
                    <span className="font-semibold text-yellow-600">
                      {stats.trends?.wastageRate || '2.1'}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Collection vs Usage */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Collection vs Usage
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Units Collected</span>
                    <span className="font-semibold text-green-600">
                      {stats.trends?.unitsCollected || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Units Distributed</span>
                    <span className="font-semibold text-blue-600">
                      {stats.trends?.unitsDistributed || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Net Change</span>
                    <span className={`font-semibold ${
                      (stats.trends?.unitsCollected - stats.trends?.unitsDistributed) >= 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {((stats.trends?.unitsCollected || 0) - (stats.trends?.unitsDistributed || 0)) >= 0 ? '+' : ''}
                      {(stats.trends?.unitsCollected || 0) - (stats.trends?.unitsDistributed || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Turnover Rate</span>
                    <span className="font-semibold">
                      {stats.trends?.turnoverRate || '85'}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Blood Type Performance */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Blood Type Performance Analysis
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Blood Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usage Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Days Supply
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(stats.byBloodType || {}).map(([bloodType, data]) => {
                      const daysSupply = Math.floor((data.units || 0) / Math.max((data.dailyUsage || 1), 1));
                      const status = daysSupply < 7 ? 'Critical' : daysSupply < 14 ? 'Low' : daysSupply < 30 ? 'Adequate' : 'Good';
                      const statusColor = daysSupply < 7 ? 'text-red-600' : daysSupply < 14 ? 'text-yellow-600' : daysSupply < 30 ? 'text-blue-600' : 'text-green-600';
                      
                      return (
                        <tr key={bloodType}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {bloodType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {data.units || 0} units
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {(data.dailyUsage || 0).toFixed(1)} units/day
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {daysSupply} days
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${statusColor}`}>
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Monthly Trends Chart Placeholder */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Monthly Inventory Trends
              </h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 text-gray-400">📊</div>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Inventory Trends Chart
                  </h4>
                  <p className="text-gray-600">
                    Visual representation of inventory levels, collection, and usage over time
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                Inventory Management Recommendations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">Immediate Actions</h4>
                  <ul className="space-y-1 text-sm text-blue-700">
                    {stats.expiringIn3Days > 0 && (
                      <li>• Priority distribution of {stats.expiringIn3Days} units expiring in 3 days</li>
                    )}
                    {stats.lowStockItems > 0 && (
                      <li>• Organize donation campaigns for {stats.lowStockItems} low-stock blood types</li>
                    )}
                    <li>• Contact regular donors for emergency donations if needed</li>
                    <li>• Review storage conditions and temperature logs</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">Strategic Planning</h4>
                  <ul className="space-y-1 text-sm text-blue-700">
                    <li>• Schedule campaigns for blood types with high usage rates</li>
                    <li>• Optimize inventory levels based on historical patterns</li>
                    <li>• Implement FIFO (First In, First Out) rotation system</li>
                    <li>• Consider partnerships with nearby blood banks for sharing</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InventoryStatsPage;