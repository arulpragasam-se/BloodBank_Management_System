import { AlertTriangle, CheckCircle, Droplet, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import { inventoryService } from '../../services/inventoryService';
import Loading from '../common/Loading';
import StatsCard from '../common/StatsCard';
import Toast from '../common/Toast';

const InventoryStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getInventoryStats();
      
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch inventory statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!stats) return null;

  const bloodTypeStats = stats.bloodTypeStats || {};
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="space-y-6">
      {error && <Toast type="error" message={error} onClose={() => setError('')} />}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Units"
          value={stats.totalUnits || 0}
          icon={Droplet}
          color="blue"
        />
        <StatsCard
          title="Available Units"
          value={stats.availableUnits || 0}
          icon={Package}
          color="green"
        />
        <StatsCard
          title="Expiring Soon"
          value={stats.expiringSoon || 0}
          icon={AlertTriangle}
          color="orange"
        />
        <StatsCard
          title="Tests Passed"
          value={stats.testsPassed || 0}
          icon={CheckCircle}
          color="purple"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Blood Type Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {bloodTypes.map(type => (
            <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {bloodTypeStats[type]?.total || 0}
              </div>
              <div className="text-sm text-gray-600">{type}</div>
              <div className="text-xs text-green-600">
                {bloodTypeStats[type]?.available || 0} available
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Status Breakdown</h3>
          <div className="space-y-3">
            {[
              { key: 'available', label: 'Available', color: 'bg-green-500' },
              { key: 'reserved', label: 'Reserved', color: 'bg-yellow-500' },
              { key: 'used', label: 'Used', color: 'bg-blue-500' },
              { key: 'expired', label: 'Expired', color: 'bg-red-500' }
            ].map(status => (
              <div key={status.key} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 ${status.color} rounded mr-3`}></div>
                  <span className="text-gray-700">{status.label}</span>
                </div>
                <span className="font-semibold">
                  {stats.statusBreakdown?.[status.key] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Test Results Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Tests Completed</span>
              <span className="font-semibold text-green-600">
                {stats.testsCompleted || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Tests Pending</span>
              <span className="font-semibold text-yellow-600">
                {stats.testsPending || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Tests Failed</span>
              <span className="font-semibold text-red-600">
                {stats.testsFailed || 0}
              </span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Success Rate: {((stats.testsPassed / (stats.testsCompleted || 1)) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryStats;