import { AlertCircle, Calendar, Droplet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { recipientService } from '../../services/recipientService';
import Loading from '../common/Loading';
import Modal from '../common/Modal';
import Table from '../common/Table';
import Toast from '../common/Toast';

const TransfusionHistory = ({ recipientId }) => {
  const [transfusions, setTransfusions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTransfusion, setSelectedTransfusion] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchTransfusionHistory();
  }, [recipientId]);

  const fetchTransfusionHistory = async () => {
    try {
      setLoading(true);
      const response = await recipientService.getTransfusionHistory(recipientId);
      
      if (response.success) {
        setTransfusions(response.data.transfusions || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch transfusion history');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (transfusion) => {
    setSelectedTransfusion(transfusion);
    setShowDetails(true);
  };

  const columns = [
    { 
      key: 'date', 
      label: 'Date',
      render: (value) => new Date(value).toLocaleDateString()
    },
    { 
      key: 'bloodType', 
      label: 'Blood Type',
      render: (value) => (
        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
          {value}
        </span>
      )
    },
    { key: 'units', label: 'Units' },
    { 
      key: 'hospitalId.name', 
      label: 'Hospital',
      render: (value, row) => value || 'Unknown Hospital'
    },
    { key: 'reason', label: 'Reason' },
    {
      key: 'complications',
      label: 'Complications',
      render: (value) => value ? (
        <span className="text-red-600">Yes</span>
      ) : (
        <span className="text-green-600">None</span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, row) => (
        <button
          onClick={() => handleViewDetails(row)}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          View Details
        </button>
      )
    }
  ];

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {error && <Toast type="error" message={error} onClose={() => setError('')} />}
      
      <div className="bg-white rounded-lg shadow-md p-6">
       <div className="flex items-center mb-6">
         <Calendar className="w-6 h-6 text-blue-600 mr-2" />
         <h3 className="text-lg font-semibold">Transfusion History</h3>
       </div>

       {transfusions.length === 0 ? (
         <div className="text-center py-8 text-gray-500">
           <Droplet className="w-12 h-12 mx-auto mb-3 text-gray-300" />
           <p>No transfusion history available</p>
         </div>
       ) : (
         <Table
           data={transfusions}
           columns={columns}
           rowKey="_id"
         />
       )}
     </div>

     <Modal
       isOpen={showDetails}
       onClose={() => setShowDetails(false)}
       title="Transfusion Details"
     >
       {selectedTransfusion && (
         <div className="space-y-4">
           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-gray-700">Date</label>
               <p className="text-gray-900">{new Date(selectedTransfusion.date).toLocaleDateString()}</p>
             </div>
             
             <div>
               <label className="block text-sm font-medium text-gray-700">Blood Type</label>
               <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                 {selectedTransfusion.bloodType}
               </span>
             </div>
             
             <div>
               <label className="block text-sm font-medium text-gray-700">Units Transfused</label>
               <p className="text-gray-900">{selectedTransfusion.units}</p>
             </div>
             
             <div>
               <label className="block text-sm font-medium text-gray-700">Hospital</label>
               <p className="text-gray-900">{selectedTransfusion.hospitalId?.name || 'Unknown'}</p>
             </div>
           </div>
           
           {selectedTransfusion.reason && (
             <div>
               <label className="block text-sm font-medium text-gray-700">Reason</label>
               <p className="text-gray-900">{selectedTransfusion.reason}</p>
             </div>
           )}
           
           {selectedTransfusion.complications && (
             <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
               <div className="flex items-center mb-2">
                 <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                 <span className="font-medium text-red-900">Complications</span>
               </div>
               <p className="text-red-800">{selectedTransfusion.complications}</p>
             </div>
           )}
         </div>
       )}
     </Modal>
   </div>
 );
};

export default TransfusionHistory;