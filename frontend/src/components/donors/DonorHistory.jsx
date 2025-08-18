import {
    BeakerIcon,
    CalendarIcon,
    CheckCircleIcon,
    HeartIcon,
    MapPinIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useNotification } from '../../hooks/useNotifications';
import { usePagination } from '../../hooks/usePagination';
import { getDonorHistory } from '../../services/donorService';
import { formatDate, formatDateTime } from '../../utils/formatters';
import Loading from '../common/Loading';
import Table from '../common/Table';

const DonorHistory = ({ donorId }) => {
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useNotification();
  const pagination = usePagination({ initialLimit: 10 });

  useEffect(() => {
    fetchHistory();
  }, [donorId, pagination.page, pagination.limit]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await getDonorHistory(donorId, {
        page: pagination.page,
        limit: pagination.limit,
      });
      
      if (response.success) {
        setDonations(response.data.donations);
        setStats(response.data.stats);
        pagination.setTotal(response.data.pagination.total);
      }
    } catch (error) {
      showError(error.message || 'Failed to fetch donation history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      collected: 'text-blue-600 bg-blue-100',
      tested: 'text-yellow-600 bg-yellow-100',
      processed: 'text-green-600 bg-green-100',
      stored: 'text-green-600 bg-green-100',
      discarded: 'text-red-600 bg-red-100',
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const columns = [
    {
      title: 'Date',
      key: 'donationDate',
      render: (donationDate) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {formatDate(donationDate, 'DD/MM/YYYY')}
          </div>
          <div className="text-gray-500">
            {formatDateTime(donationDate).split(' ')[1]}
          </div>
        </div>
      ),
    },
    {
      title: 'Campaign',
      key: 'campaignId',
      render: (_, donation) => (
        <div className="text-sm">
          {donation.campaignId ? (
            <div>
              <div className="font-medium text-gray-900">
                {donation.campaignId.title}
              </div>
              <div className="text-gray-500 flex items-center">
                <MapPinIcon className="h-3 w-3 mr-1" />
                {donation.campaignId.location?.venue}
              </div>
            </div>
          ) : (
            <span className="text-gray-500">Regular donation</span>
          )}
        </div>
      ),
    },
    {
      title: 'Blood Type',
      key: 'bloodType',
      render: (bloodType) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium blood-type-${bloodType?.toLowerCase().replace('+', '-positive').replace('-', '-negative')}`}>
          {bloodType}
        </span>
      ),
    },
    {
      title: 'Units Collected',
      key: 'unitsCollected',
      render: (units) => (
        <div className="flex items-center text-sm font-medium text-gray-900">
          <BeakerIcon className="h-4 w-4 mr-1 text-gray-400" />
          {units} unit{units !== 1 ? 's' : ''}
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (status) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      ),
    },
    {
      title: 'Pre-screening',
      key: 'preScreening',
      render: (preScreening) => (
        <div className="flex items-center">
          {preScreening?.passed ? (
            <>
              <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-700">Passed</span>
            </>
          ) : (
            <>
              <XCircleIcon className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-sm text-red-700">Failed</span>
            </>
          )}
        </div>
      ),
    },
    {
      title: 'Collected By',
      key: 'collectedBy',
      render: (collectedBy) => (
        <span className="text-sm text-gray-900">
          {collectedBy?.name || 'Unknown'}
        </span>
      ),
    },
  ];

  if (loading && donations.length === 0) {
    return <Loading text="Loading donation history..." />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Donations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDonations}</p>
              </div>
              <HeartIcon className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Successful Donations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.successfulDonations}</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Units</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUnitsCollected}</p>
              </div>
              <BeakerIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Last Donation</p>
                <p className="text-lg font-bold text-gray-900">
                  {stats.lastDonation 
                    ? formatDate(stats.lastDonation, 'DD/MM/YYYY')
                    : 'Never'
                  }
                </p>
              </div>
              <CalendarIcon className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>
      )}

      {/* Donations Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Donation History</h2>
        </div>
        
        <Table
          columns={columns}
          data={donations}
          loading={loading}
          emptyMessage="No donations found"
          pagination={{
            currentPage: pagination.page,
            totalPages: pagination.totalPages,
            totalItems: pagination.total,
            itemsPerPage: pagination.limit,
            onPageChange: pagination.goToPage,
            onItemsPerPageChange: pagination.changeLimit,
          }}
        />
      </div>
    </div>
  );
};

export default DonorHistory;