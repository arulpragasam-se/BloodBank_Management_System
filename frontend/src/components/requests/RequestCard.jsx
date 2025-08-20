import { AlertTriangle, Building, Calendar, Clock, Droplet, User } from 'lucide-react';

const RequestCard = ({ request, onClick }) => {
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-blue-100 text-blue-800 border-blue-200',
      partially_fulfilled: 'bg-orange-100 text-orange-800 border-orange-200',
      fulfilled: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getUrgencyIcon = (urgency) => {
    if (urgency === 'critical' || urgency === 'high') {
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    }
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  const isOverdue = () => {
    return new Date() > new Date(request.requiredBy) && request.status !== 'fulfilled';
  };

  const getAllocatedUnits = () => {
    return request.allocatedBlood?.reduce((total, allocation) => total + allocation.units, 0) || 0;
  };

  const getRemainingUnits = () => {
    return request.unitsRequired - getAllocatedUnits();
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border ${
        isOverdue() ? 'border-red-200' : 'border-gray-200'
      }`}
      onClick={() => onClick && onClick(request)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <Building className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {request.hospitalId?.name || 'Unknown Hospital'}
            </h3>
            <p className="text-gray-600">Request #{request._id.slice(-6)}</p>
          </div>
        </div>
        
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
          {request.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Droplet className="w-4 h-4 mr-2 text-red-600" />
            <span className="text-sm">Blood Type: </span>
            <span className="ml-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
              {request.bloodType}
            </span>
          </div>
          
          <div className="flex items-center">
            {getUrgencyIcon(request.urgencyLevel)}
            <span className="ml-1 text-sm font-medium text-gray-700">
              {request.urgencyLevel.toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="flex items-center text-gray-600">
          <User className="w-4 h-4 mr-2" />
          <span className="text-sm">
            For: {request.recipientId?.name || request.patientCondition}
          </span>
        </div>
        
        <div className="flex items-center text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          <span className={`text-sm ${isOverdue() ? 'text-red-600 font-medium' : ''}`}>
            Required by: {new Date(request.requiredBy).toLocaleDateString()}
          </span>
          {isOverdue() && (
            <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
              OVERDUE
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="text-sm">
          <span className="font-medium">{request.unitsRequired} units</span>
          <span className="text-gray-600"> requested</span>
          {getAllocatedUnits() > 0 && (
            <div className="text-xs text-gray-500">
              {getAllocatedUnits()} allocated, {getRemainingUnits()} remaining
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-500">
          Created: {new Date(request.createdAt).toLocaleDateString()}
        </div>
      </div>

      {request.reason && (
        <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
          Reason: {request.reason}
        </div>
      )}
    </div>
  );
};

export default RequestCard;