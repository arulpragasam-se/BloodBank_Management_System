import { AlertTriangle, Clock, Droplet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { requestService } from '../../services/requestService';
import Loading from '../common/Loading';
import Toast from '../common/Toast';
import RequestCard from './RequestCard';

const UrgentRequests = () => {
  const [urgentRequests, setUrgentRequests] = useState([]);
  const [overdueRequests, setOverdueRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUrgentRequests();
  }, []);

  const fetchUrgentRequests = async () => {
    try {
      setLoading(true);
      
      // Fetch urgent requests
      const urgentResponse = await requestService.getAllRequests({
        urgency: 'critical,high',
        status: 'pending,approved'
      });
      
      // Fetch overdue requests
      const overdueResponse = await requestService.getAllRequests({
        overdue: true,
        status: 'pending,approved,partially_fulfilled'
      });

      if (urgentResponse.success) {
        setUrgentRequests(urgentResponse.data.requests || []);
      }
      
      if (overdueResponse.success) {
        setOverdueRequests(overdueResponse.data.requests || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch urgent requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestClick = (request) => {
    window.location.href = `/requests/${request._id}`;
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {error && <Toast type="error" message={error} onClose={() => setError('')} />}
      
      {/* Overdue Requests */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <Clock className="w-6 h-6 text-red-600 mr-2" />
          <h3 className="text-lg font-semibold text-red-900">Overdue Requests</h3>
          <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
            {overdueRequests.length}
          </span>
        </div>
        
        {overdueRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No overdue requests</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overdueRequests.map((request) => (
              <RequestCard
                key={request._id}
                request={request}
                onClick={handleRequestClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Critical & High Priority Requests */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-6 h-6 text-orange-600 mr-2" />
          <h3 className="text-lg font-semibold text-orange-900">High Priority Requests</h3>
          <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
            {urgentRequests.length}
          </span>
        </div>
        
        {urgentRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No high priority requests</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {urgentRequests.map((request) => (
              <RequestCard
                key={request._id}
                request={request}
                onClick={handleRequestClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-red-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-red-900">{overdueRequests.length}</p>
              <p className="text-red-700">Overdue Requests</p>
            </div>
          </div>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-orange-900">
                {urgentRequests.filter(r => r.urgencyLevel === 'critical').length}
              </p>
              <p className="text-orange-700">Critical Requests</p>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center">
            <Droplet className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-yellow-900">
                {urgentRequests.filter(r => r.urgencyLevel === 'high').length}
              </p>
              <p className="text-yellow-700">High Priority</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Recommendations */}
      {(overdueRequests.length > 0 || urgentRequests.length > 0) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-medium text-blue-900 mb-3">Recommended Actions:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            {overdueRequests.length > 0 && (
              <li>• Immediately review and process {overdueRequests.length} overdue request(s)</li>
            )}
            {urgentRequests.filter(r => r.urgencyLevel === 'critical').length > 0 && (
              <li>• Priority attention needed for {urgentRequests.filter(r => r.urgencyLevel === 'critical').length} critical request(s)</li>
            )}
            <li>• Check blood inventory levels for requested types</li>
            <li>• Contact hospitals for status updates if needed</li>
            <li>• Consider emergency procurement if stock is insufficient</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UrgentRequests;