import {
    CheckCircleIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    UserPlusIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../../hooks/useNotifications';
import { usePagination } from '../../hooks/usePagination';
import { deleteDonor, getAllDonors } from '../../services/donorService';
import { BLOOD_TYPES } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import ConfirmDialog from '../common/ConfirmDialog';
import FilterDropdown from '../common/FilterDropdown';
import SearchBar from '../common/SearchBar';
import Table, { TableAction, TableActions } from '../common/Table';

const DonorList = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    bloodType: '',
    isEligible: '',
  });
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, donor: null });
  
  const { showSuccess, showError } = useNotification();
  const pagination = usePagination({ initialLimit: 10 });

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        ...filters,
      };

      const response = await getAllDonors(params);
      if (response.success) {
        setDonors(response.data.donors);
        pagination.setTotal(response.data.pagination.total);
      }
    } catch (error) {
      showError(error.message || 'Failed to fetch donors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [pagination.page, pagination.limit, searchTerm, filters]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    pagination.firstPage();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    pagination.firstPage();
  };

  const handleDeleteClick = (donor) => {
    setDeleteDialog({ isOpen: true, donor });
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await deleteDonor(deleteDialog.donor._id);
      if (response.success) {
        showSuccess('Donor deleted successfully');
        fetchDonors();
      }
    } catch (error) {
      showError(error.message || 'Failed to delete donor');
    }
  };

  const bloodTypeOptions = BLOOD_TYPES.map(type => ({
    label: type,
    value: type,
  }));

  const eligibilityOptions = [
    { label: 'Eligible', value: 'true' },
    { label: 'Not Eligible', value: 'false' },
  ];

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (_, donor) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-red-600 font-medium text-sm">
              {donor.userId?.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {donor.userId?.name}
            </div>
            <div className="text-sm text-gray-500">
              {donor.userId?.email}
            </div>
          </div>
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
      title: 'Age',
      key: 'age',
      render: (_, donor) => {
        const age = new Date().getFullYear() - new Date(donor.dateOfBirth).getFullYear();
        return <span className="text-sm text-gray-900">{age} years</span>;
      },
    },
    {
      title: 'Weight',
      key: 'weight',
      render: (weight) => (
        <span className="text-sm text-gray-900">{weight} kg</span>
      ),
    },
    {
      title: 'Total Donations',
      key: 'totalDonations',
      render: (totalDonations) => (
        <span className="text-sm font-medium text-gray-900">{totalDonations || 0}</span>
      ),
    },
    {
      title: 'Last Donation',
      key: 'lastDonationDate',
      render: (lastDonationDate) => (
        <span className="text-sm text-gray-500">
          {lastDonationDate ? formatDate(lastDonationDate, 'DD/MM/YYYY') : 'Never'}
        </span>
      ),
    },
    {
      title: 'Eligibility',
      key: 'isEligible',
      render: (isEligible) => (
        <div className="flex items-center">
          {isEligible ? (
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-1" />
          ) : (
            <XCircleIcon className="h-5 w-5 text-red-500 mr-1" />
          )}
          <span className={`text-sm font-medium ${isEligible ? 'text-green-700' : 'text-red-700'}`}>
            {isEligible ? 'Eligible' : 'Not Eligible'}
          </span>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      sortable: false,
      render: (_, donor) => (
        <TableActions>
          <Link to={`/donors/${donor._id}`}>
            <TableAction
              icon={EyeIcon}
              label="View Details"
              variant="default"
            />
          </Link>
          <Link to={`/donors/${donor._id}/edit`}>
            <TableAction
              icon={PencilIcon}
              label="Edit Donor"
              variant="primary"
            />
          </Link>
          <TableAction
            icon={TrashIcon}
            label="Delete Donor"
            variant="danger"
            onClick={() => handleDeleteClick(donor)}
          />
        </TableActions>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donors</h1>
          <p className="text-gray-600">Manage blood donors and their information</p>
        </div>
        <Link
          to="/donors/add"
          className="btn btn-primary"
        >
          <UserPlusIcon className="h-5 w-5 mr-2" />
          Add Donor
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SearchBar
            placeholder="Search donors..."
            value={searchTerm}
            onChange={handleSearch}
          />
          
          <FilterDropdown
            label="Blood Type"
            options={bloodTypeOptions}
            value={filters.bloodType}
            onChange={(value) => handleFilterChange('bloodType', value)}
            placeholder="All blood types"
          />
          
          <FilterDropdown
            label="Eligibility"
            options={eligibilityOptions}
            value={filters.isEligible}
            onChange={(value) => handleFilterChange('isEligible', value)}
            placeholder="All donors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          data={donors}
          loading={loading}
          emptyMessage="No donors found"
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, donor: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Donor"
        message={`Are you sure you want to delete ${deleteDialog.donor?.userId?.name}? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default DonorList;