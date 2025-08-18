import { useEffect, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { useApi } from '../../hooks/useApi';
import { getInventoryStats } from '../../services/inventoryService';
import { BLOOD_TYPES } from '../../utils/constants';

const BloodInventoryChart = () => {
  const { execute, loading } = useApi();
  const [inventoryData, setInventoryData] = useState([]);
  const [chartType, setChartType] = useState('bar'); // 'bar' or 'pie'

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      const response = await execute(() => getInventoryStats(), { showLoading: false });
      
      if (response?.success) {
        const data = BLOOD_TYPES.map(bloodType => ({
          bloodType,
          units: response.data.stats?.byBloodType?.[bloodType]?.units || 0,
          expiringSoon: response.data.stats?.byBloodType?.[bloodType]?.expiringSoon || 0
        }));
        
        setInventoryData(data);
      }
    } catch (error) {
      console.error('Failed to fetch inventory data:', error);
    }
  };

  const bloodTypeColors = {
    'A+': '#ef4444', 'A-': '#dc2626',
    'B+': '#3b82f6', 'B-': '#2563eb',
    'AB+': '#8b5cf6', 'AB-': '#7c3aed',
    'O+': '#10b981', 'O-': '#059669'
  };

  const totalUnits = inventoryData.reduce((sum, item) => sum + item.units, 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`Blood Type: ${label}`}</p>
          <p className="text-blue-600">{`Units: ${payload[0].value}`}</p>
          {payload[1] && (
            <p className="text-orange-600">{`Expiring Soon: ${payload[1].value}`}</p>
          )}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`${data.name}: ${data.value} units`}</p>
          <p className="text-gray-600">{`${((data.value / totalUnits) * 100).toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Blood Inventory</h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Blood Inventory</h3>
            <p className="text-sm text-gray-500 mt-1">Units by blood type</p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 text-xs rounded-md ${
                chartType === 'bar'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Bar Chart
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={`px-3 py-1 text-xs rounded-md ${
                chartType === 'pie'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pie Chart
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {totalUnits === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <p>No inventory data available</p>
            </div>
          </div>
        ) : (
          <div className="h-64">
            {chartType === 'bar' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="bloodType" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="units" 
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="expiringSoon" 
                    fill="#f97316"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventoryData.filter(item => item.units > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ bloodType, percent }) => 
                      `${bloodType} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="units"
                    nameKey="bloodType"
                  >
                    {inventoryData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={bloodTypeColors[entry.bloodType]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
        
        {/* Legend */}
        {chartType === 'bar' && (
          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded mr-2" />
              <span className="text-sm text-gray-600">Available Units</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded mr-2" />
              <span className="text-sm text-gray-600">Expiring Soon</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BloodInventoryChart;