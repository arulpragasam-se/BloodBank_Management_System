import { Calendar, Clock, Droplet, MapPin, TestTube } from 'lucide-react';

const InventoryCard = ({ inventory, onClick }) => {
  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-100 text-green-800 border-green-200',
      reserved: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      used: 'bg-blue-100 text-blue-800 border-blue-200',
      expired: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const timeDiff = expiry.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const getTestStatus = (testResults) => {
    const allNegative = Object.values(testResults).every(test => test === 'negative');
    const allComplete = !Object.values(testResults).includes('pending');
    
    if (allComplete && allNegative) {
      return { status: 'Passed', color: 'text-green-600' };
    } else if (allComplete) {
      return { status: 'Failed', color: 'text-red-600' };
    }
    return { status: 'Pending', color: 'text-yellow-600' };
  };

  const daysUntilExpiry = getDaysUntilExpiry(inventory.expiryDate);
  const testStatus = getTestStatus(inventory.testResults);
  const isExpiringSoon = daysUntilExpiry <= 7;

  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border ${
        isExpiringSoon ? 'border-red-200' : 'border-gray-200'
      }`}
      onClick={() => onClick && onClick(inventory)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <Droplet className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{inventory.bloodType}</h3>
            <p className="text-gray-600">{inventory.units} Units</p>
          </div>
        </div>
        
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(inventory.status)}`}>
          {inventory.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          <span className="text-sm">
            Collected: {new Date(inventory.collectionDate).toLocaleDateString()}
          </span>
        </div>
        
        <div className="flex items-center text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          <span className={`text-sm ${isExpiringSoon ? 'text-red-600 font-medium' : ''}`}>
            Expires: {new Date(inventory.expiryDate).toLocaleDateString()} 
            ({daysUntilExpiry} days)
          </span>
        </div>
        
        {inventory.storageLocation?.section && (
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="text-sm">
              {inventory.storageLocation.section}
              {inventory.storageLocation.shelf && ` - ${inventory.storageLocation.shelf}`}
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="flex items-center">
          <TestTube className="w-4 h-4 mr-1" />
          <span className={`text-sm ${testStatus.color}`}>
            Tests: {testStatus.status}
          </span>
        </div>
        
        {isExpiringSoon && (
          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
            Expiring Soon
          </span>
        )}
      </div>
    </div>
  );
};

export default InventoryCard;