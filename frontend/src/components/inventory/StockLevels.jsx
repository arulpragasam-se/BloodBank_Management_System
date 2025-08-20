import { useState, useEffect } from 'react';
import { inventoryService } from '../../services/inventoryService';
import Loading from '../common/Loading';
import Toast from '../common/Toast';
import { Droplet, TrendingDown, TrendingUp, Minus } from 'lucide-react';

const StockLevels = () => {
  const [stockLevels, setStockLevels] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStockLevels();
  }, []);

  const fetchStockLevels = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getInventoryStats();
      
      if (response.success) {
        setStockLevels(response.data.bloodTypeStats || {});
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch stock levels');
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (available, total) => {
    const percentage = total > 0 ? (available / total) * 100 : 0;
    
    if (percentage >= 75) return { status: 'high', color: 'text-green-600', icon: TrendingUp };
    if (percentage >= 25) return { status: 'medium', color: 'text-yellow-600', icon: Minus };
    return { status: 'low', color: 'text-red-600', icon: TrendingDown };
  };

  const getStockColor = (available, total) => {
    const percentage = total > 0 ? (available / total) * 100 : 0;
    
    if (percentage >= 75) return 'bg-green-100 border-green-200';
    if (percentage >= 25) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  if (loading) return <Loading />;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <Droplet className="w-6 h-6 text-red-600 mr-2" />
        <h3 className="text-lg font-semibold">Blood Stock Levels</h3>
      </div>

      {error && <Toast type="error" message={error} onClose={() => setError('')} />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {bloodTypes.map((type) => {
          const stock = stockLevels[type] || { total: 0, available: 0 };
          const stockInfo = getStockStatus(stock.available, stock.total);
          const IconComponent = stockInfo.icon;
          const percentage = stock.total > 0 ? (stock.available / stock.total) * 100 : 0;

          return (
            <div 
              key={type} 
              className={`p-4 rounded-lg border ${getStockColor(stock.available, stock.total)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{type}</h4>
                <IconComponent className={`w-5 h-5 ${stockInfo.color}`} />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Available:</span>
                  <span className="font-medium">{stock.available}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Total:</span>
                  <span className="font-medium">{stock.total}</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      percentage >= 75 ? 'bg-green-500' :
                      percentage >= 25 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
                
                <div className="text-xs text-gray-600 text-center">
                  {percentage.toFixed(1)}% available
                </div>
              </div>
              
              {percentage < 25 && stock.total > 0 && (
                <div className="mt-2 text-xs text-red-600 font-medium">
                  ⚠️ Low Stock Alert
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Stock Level Legend:</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span>High (75%+) - Adequate supply</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
            <span>Medium (25-74%) - Monitor closely</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
            <span>Low (<25%) - Urgent restocking needed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockLevels;