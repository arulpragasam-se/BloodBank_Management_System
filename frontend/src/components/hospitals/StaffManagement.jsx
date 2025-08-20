import { Plus, Trash2, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { hospitalService } from '../../services/hospitalService';
import ConfirmDialog from '../common/ConfirmDialog';
import Modal from '../common/Modal';
import Toast from '../common/Toast';
import Input from '../forms/Input';
import Select from '../forms/Select';

const StaffManagement = ({ hospitalId }) => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newStaff, setNewStaff] = useState({
    userId: '',
    position: '',
    department: ''
  });

  const positions = [
    { value: 'doctor', label: 'Doctor' },
    { value: 'nurse', label: 'Nurse' },
    { value: 'lab_technician', label: 'Lab Technician' },
    { value: 'blood_bank_officer', label: 'Blood Bank Officer' },
    { value: 'administrator', label: 'Administrator' }
  ];

  useEffect(() => {
    fetchStaffMembers();
  }, [hospitalId]);

  const fetchStaffMembers = async () => {
    try {
      const response = await hospitalService.getHospitalById(hospitalId);
      if (response.success) {
        setStaffMembers(response.data.hospital.staffMembers || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch staff members');
    }
  };

  const handleAddStaff = async () => {
    try {
      setLoading(true);
      const response = await hospitalService.addStaffMember(hospitalId, newStaff);
      
      if (response.success) {
        setShowAddModal(false);
        setNewStaff({ userId: '', position: '', department: '' });
        fetchStaffMembers();
      }
    } catch (err) {
      setError(err.message || 'Failed to add staff member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStaff = async () => {
    try {
      setLoading(true);
      const response = await hospitalService.removeStaffMember(hospitalId, selectedStaff.userId._id);
      
      if (response.success) {
        setShowDeleteDialog(false);
        setSelectedStaff(null);
        fetchStaffMembers();
      }
    } catch (err) {
      setError(err.message || 'Failed to remove staff member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {error && <Toast type="error" message={error} onClose={() => setError('')} />}
      
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Staff Management</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Staff
        </button>
      </div>

      <div className="space-y-4">
        {staffMembers.length > 0 ? (
          staffMembers.map((staff, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center">
                <User className="w-8 h-8 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium">{staff.userId?.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-600">{staff.position}</p>
                  <p className="text-xs text-gray-500">{staff.department}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">{staff.userId?.email}</span>
                <button
                  onClick={() => {
                    setSelectedStaff(staff);
                    setShowDeleteDialog(true);
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No staff members assigned to this hospital
          </div>
        )}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Staff Member"
      >
        <div className="space-y-4">
          <Input
            label="User ID"
            value={newStaff.userId}
            onChange={(name, value) => setNewStaff(prev => ({ ...prev, userId: value }))}
            placeholder="Enter user ID"
            required
          />
          
          <Select
            label="Position"
            value={newStaff.position}
            onChange={(name, value) => setNewStaff(prev => ({ ...prev, position: value }))}
            options={positions}
            placeholder="Select position"
            required
          />
          
          <Input
            label="Department"
            value={newStaff.department}
            onChange={(name, value) => setNewStaff(prev => ({ ...prev, department: value }))}
            placeholder="Enter department"
          />
          
          <div className="flex justify-end space-x-4 pt-4">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleAddStaff}
              disabled={loading || !newStaff.userId || !newStaff.position}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Staff'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleRemoveStaff}
        title="Remove Staff Member"
        message={`Are you sure you want to remove ${selectedStaff?.userId?.name} from this hospital?`}
        loading={loading}
      />
    </div>
  );
};

export default StaffManagement;