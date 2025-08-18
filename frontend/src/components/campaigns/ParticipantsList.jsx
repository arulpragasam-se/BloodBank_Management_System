import {
    EnvelopeIcon,
    PhoneIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotifications';
import { getCampaignById, updateDonorStatus } from '../../services/campaignService';
import { formatDateTime } from '../../utils/formatters';
import { getStatusColor } from '../../utils/helpers';
import ConfirmDialog from '../common/ConfirmDialog';
import FilterDropdown from '../common/FilterDropdown';
import Table from '../common/Table';

const ParticipantsList = ({ campaignId, canManage }) => {
  const [participants, setParticipants] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  const { loading, execute } = useApi();
  const { showSuccess, showError } = useNotification();

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'registered', label: 'Registered' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'attended', label: 'Attended' },
    { value: 'donated', label: 'Donated' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const fetchParticipants = async () => {
    await execute(
      () => getCampaignById(campaignId),
      {
        onSuccess: (response) => {
          const registeredDonors = response.data.campaign.registeredDonors || [];
          setParticipants(registeredDonors);
          setFilteredParticipants(registeredDonors);
        },
      }
    );
  };

  useEffect(() => {
    fetchParticipants();
  }, [campaignId]);

  useEffect(() => {
    if (statusFilter) {
      setFilteredParticipants(
        participants.filter(p => p.status === statusFilter)
      );
    } else {
      setFilteredParticipants(participants);
    }
  }, [participants, statusFilter]);

  const handleStatusChange = async () => {
    if (!selectedParticipant) return;

    await execute(
      () => updateDonorStatus(campaignId, selectedParticipant.donorId._id, {
        status: newStatus,
      }),
      {
        onSuccess: () => {
          showSuccess('Participant status updated successfully');
          fetchParticipants();
          setShowStatusDialog(false);
          setSelectedParticipant(null);
        },
        onError: (error) => {
          showError(error.message || 'Failed to update participant status');
        },
      }
    );
  };

  const openStatusDialog = (participant, status) => {
    setSelectedParticipant(participant);
    setNewStatus(status);
    setShowStatusDialog(true);
  };

  const getStatusBadge = (status) => {
    const statusColor = getStatusColor(status);
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-800`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const columns = [
    {
      key: 'donor',
      title: 'Donor',
      render: (_, participant) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <UserIcon className="h-4 w-4 text-red-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {participant.donorId?.userId?.name || 'Unknown'}
            </p>
            <p className="text-sm text-gray-500">
              {participant.donorId?.bloodType}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      title: 'Contact',
      render: (_, participant) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm text-gray-600">
            <EnvelopeIcon className="h-4 w-4 mr-1" />
            {participant.donorId?.userId?.email || 'N/A'}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <PhoneIcon className="h-4 w-4 mr-1" />
            {participant.donorId?.userId?.phone || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      key: 'registrationDate',
      title: 'Registered',
      render: (_, participant) => (
        <div className="text-sm text-gray-600">
          {formatDateTime(participant.registrationDate)}
        </div>
      ),
    },
    {
      key: 'appointmentTime',
      title: 'Appointment',
      render: (_, participant) => (
        <div className="text-sm text-gray-600">
          {participant.appointmentTime 
            ? formatDateTime(participant.appointmentTime)
            : 'Not scheduled'
          }
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (_, participant) => getStatusBadge(participant.status),
    },
  ];

  if (canManage) {
    columns.push({
      key: 'actions',
      title: 'Actions',
      render: (_, participant) => (
        <div className="flex items-center space-x-2">
          {participant.status === 'registered' && (
            <button
              onClick={() => openStatusDialog(participant, 'confirmed')}
              className="btn btn-sm btn-success"
            >
              Confirm
            </button>
          )}
          
          {participant.status === 'confirmed' && (
            <button
              onClick={() => openStatusDialog(participant, 'attended')}
              className="btn btn-sm btn-primary"
            >
              Mark Attended
            </button>
          )}
          
          {participant.status === 'attended' && (
            <button
              onClick={() => openStatusDialog(participant, 'donated')}
              className="btn btn-sm btn-success"
            >
              Mark Donated
            </button>
          )}
          
          {['registered', 'confirmed'].includes(participant.status) && (
            <button
              onClick={() => openStatusDialog(participant, 'cancelled')}
              className="btn btn-sm btn-danger"
            >
              Cancel
            </button>
          )}
        </div>
      ),
    });
  }

  return (
    <div className="p-6 space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Participants ({filteredParticipants.length})
        </h3>
        
        <div className="flex items-center space-x-4">
          <FilterDropdown
            label="Status"
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Filter by status"
          />
        </div>
      </div>

      {/* Participants Table */}
      <Table
        columns={columns}
        data={filteredParticipants}
        loading={loading}
        emptyMessage="No participants found"
      />

      {/* Status Update Dialog */}
      <ConfirmDialog
        isOpen={showStatusDialog}
        onClose={() => setShowStatusDialog(false)}
        onConfirm={handleStatusChange}
        title="Update Participant Status"
        message={`Are you sure you want to update ${selectedParticipant?.donorId?.userId?.name}'s status to "${newStatus}"?`}
        confirmText="Update Status"
        type="info"
        loading={loading}
      />
    </div>
  );
};

export default ParticipantsList;