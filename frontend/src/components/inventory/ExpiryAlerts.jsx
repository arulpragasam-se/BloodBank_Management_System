import { AlertTriangle, Clock, Droplet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { inventoryService } from '../../services/inventoryService';
import Loading from '../common/Loading';
import Toast from '../common/Toast';

const ExpiryAlerts = () => {
  const [expiringInventory, setExpiringInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDays, setSelectedDays] = useState(7);

  useEffect(() => {
    fetchExpiringInventory();
  }, [selectedDays]);

  const fetchExpiringInventory = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getExpiringInventory(selectedDays);
      
      if (response.success) {
        setExpiringInventory(response.data.inventory || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch expiring inventory');
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const timeDiff = expiry.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const getUrgencyColor = (days) => {
    if (days <= 3) return 'bg-red-100 border-red-200 text-red-800';
    if (days <= 7) return 'bg-orange-100 border-orange-200 text-orange-800';
    return 'bg-yellow-100 border-yellow-200 text-yellow-800';
  };

  if (loading) return <Loading />;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <AlertTriangle className="w-6 h-6 text-orange-600 mr-2" />
          <h3 className="text-lg font-semibold">Expiry Alerts</h3>
        </div>
        
        <select
          value={selectedDays}
          onChange={(e) => setSelectedDays(parseInt(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={7}>Next 7 days</option>
          <option value={14}>Next 14 days</option>
          <option value={30}>Next 30 days</option>
        </select>
      </div>

      {error && <Toast type="error" message={error} onClose={() => setError('')} />}

      {expiringInventory.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No blood units expiring in the next {selectedDays} days</p>
        </div>
      ) : (
        <div className="space-y-3">
          {expiringInventory.map((item) => {
            const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
            return (
              <div 
                key={item._id} 
                className={`p-4 rounded-lg border ${getUrgencyColor(daysUntilExpiry)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Droplet className="w-5 h-5 mr-3" />
                    <div>
                      <p className="font-medium">
                        {item.bloodType} - {item.units} Units
                      </p>
                      <p className="text-sm opacity-75">
                        Donor ID: {item.donorId}
                      </p>
                      {item.storageLocation?.section && (
                        <p className="text-xs opacity-75">
                          Location: {item.storageLocation.section}
                          {item.storageLocation.shelf && `-${item.storageLocation.shelf}`}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold">
                      {daysUntilExpiry} {daysUntilExpiry === 1 ? 'day' : 'days'}
                    </div>
                    <div className="text-sm opacity-75">
                      {new Date(item.expiryDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                {daysUntilExpiry <= 3 && (
                  <div className="mt-2 text-sm font-medium">
                    ⚠️ Critical: Immediate action required
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {expiringInventory.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Recommended Actions:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Prioritize units expiring in 3 days or less</li>
            <li>• Contact hospitals for urgent blood requests</li>
            <li>• Check if units can be used for testing purposes</li>
            <li>• Update inventory status if units are no longer viable</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ExpiryAlerts;