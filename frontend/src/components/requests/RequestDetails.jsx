import {
    AlertTriangle,
    Building,
    Calendar,
    CheckCircle,
    Droplet,
    User,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { requestService } from '../../services/requestService';
import ConfirmDialog from '../common/ConfirmDialog';
import Loading from '../common/Loading';
import Modal from '../common/Modal';
import Toast from '../common/Toast';

const RequestDetails = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [processData, setProcessData] = useState({
    action: '',
    notes: '',
    rejectionReason: ''
  });

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      const response = await requestService.getRequestById(id);
      
      if (response.success) {
        setRequest(response.data.request);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch request details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      partially_fulfilled: 'bg-orange-100 text-orange-800',
      fulfilled: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

  const handleProcessRequest = async () => {
    try {
      setActionLoading(true);
      let response;

      if (processData.action === 'approve') {
        response = await requestService.approveRequest(id, { notes: processData.notes });
      } else if (processData.action === 'fulfill') {
        response = await requestService.fulfillRequest(id, { notes: processData.notes });
      }

      if (response.success) {
        setShowProcessModal(false);
        fetchRequestDetails();
      }
    } catch (err) {
      setError(err.message || 'Failed to process request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    try {
      setActionLoading(true);
      const response = await requestService.rejectRequest(id, {
        rejectionReason: processData.rejectionReason
      });

      if (response.success) {
        setShowRejectDialog(false);
        fetchRequestDetails();
      }
    } catch (err) {
      setError(err.message || 'Failed to reject request');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!request) return <div>Request not found</div>;

  return (
    <div className="space-y-6">
      {error && <Toast type="error" message={error} onClose={() => setError('')} />}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Blood Request #{request._id.slice(-6)}
            </h1>
            <p className="text-gray-600">
              Created: {new Date(request.createdAt).toLocaleString()}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
              {request.status.replace('_', ' ').toUpperCase()}
            </span>
            
            {isOverdue() && (
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                OVERDUE
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Request Details</h3>
            
            <div className="flex items-center">
              <Building className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="font-medium">{request.hospitalId?.name || 'Unknown Hospital'}</p>
                <p className="text-sm text-gray-600">Hospital</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <User className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="font-medium">{request.requestedBy?.name}</p>
                <p className="text-sm text-gray-600">Requested by</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Droplet className="w-5 h-5 text-red-400 mr-3" />
              <div>
                <p className="font-medium text-red-600">{request.bloodType}</p>
                <p className="text-sm text-gray-600">Blood Type</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className={`font-medium ${isOverdue() ? 'text-red-600' : ''}`}>
                  {new Date(request.requiredBy).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Required by</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Requirements</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Units Required</span>
                <span className="font-bold text-lg">{request.unitsRequired}</span>
              </div>
              
              {getAllocatedUnits() > 0 && (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Units Allocated</span>
                    <span className="font-medium text-blue-600">{getAllocatedUnits()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Units Remaining</span>
                    <span className="font-medium text-orange-600">{getRemainingUnits()}</span>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-orange-400 mr-3" />
              <div>
                <p className="font-medium">{request.urgencyLevel.toUpperCase()}</p>
                <p className="text-sm text-gray-600">Urgency Level</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Patient Condition</h4>
            <p className="text-gray-700 bg-gray-50 p-3 rounded">{request.patientCondition}</p>
          </div>
          
          {request.reason && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Reason for Request</h4>
              <p className="text-gray-700 bg-gray-50 p-3 rounded">{request.reason}</p>
            </div>
          )}
          
          {request.notes && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Additional Notes</h4>
              <p className="text-gray-700 bg-gray-50 p-3 rounded">{request.notes}</p>
            </div>
          )}
        </div>

        {request.status === 'pending' && (
          <div className="flex justify-end space-x-4 mt-6 pt-6 border-t">
            <button
              onClick={() => {
                setProcessData({ ...processData, action: 'approve' });
                setShowProcessModal(true);
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve Request
            </button>
            
            <button
              onClick={() => setShowRejectDialog(true)}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject Request
            </button>
          </div>
        )}

        {request.status === 'approved' && (
          <div className="flex justify-end space-x-4 mt-6 pt-6 border-t">
            <button
              onClick={() => {
                setProcessData({ ...processData, action: 'fulfill' });
                setShowProcessModal(true);
              }}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark as Fulfilled
            </button>
          </div>
        )}
      </div>

      {request.allocatedBlood?.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Allocated Blood Units</h3>
          <div className="space-y-3">
            {request.allocatedBlood.map((allocation, index) => (
              <div key={index} className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <p className="font-medium">Inventory ID: {allocation.inventoryId}</p>
                  <p className="text-sm text-gray-600">
                    Allocated: {new Date(allocation.allocationDate).toLocaleDateString()}
                  </p>
                </div>
                <span className="font-medium">{allocation.units} units</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        isOpen={showProcessModal}
        onClose={() => setShowProcessModal(false)}
        title={`${processData.action === 'approve' ? 'Approve' : 'Fulfill'} Request`}
      >
        <div className="space-y-4">
          <p>
            Are you sure you want to {processData.action} this blood request?
          </p>
          
          <textarea
            value={processData.notes}
            onChange={(e) => setProcessData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Add notes (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          
          <div className="flex justify-end space-x-4">
            <button
             onClick={handleProcessRequest}
             disabled={actionLoading}
             className={`px-4 py-2 text-white rounded-md disabled:opacity-50 ${
               processData.action === 'approve' 
                 ? 'bg-blue-600 hover:bg-blue-700' 
                 : 'bg-green-600 hover:bg-green-700'
             }`}
           >
             {actionLoading ? 'Processing...' : `${processData.action === 'approve' ? 'Approve' : 'Fulfill'} Request`}
           </button>
         </div>
       </div>
     </Modal>

     <ConfirmDialog
       isOpen={showRejectDialog}
       onClose={() => setShowRejectDialog(false)}
       onConfirm={handleRejectRequest}
       title="Reject Blood Request"
       message="Please provide a reason for rejecting this request:"
       loading={actionLoading}
     >
       <textarea
         value={processData.rejectionReason}
         onChange={(e) => setProcessData(prev => ({ ...prev, rejectionReason: e.target.value }))}
         placeholder="Enter rejection reason..."
         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
         rows={3}
         required
       />
     </ConfirmDialog>
   </div>
 );
};

export default RequestDetails;