import { PlusIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { usePermissions } from '../../hooks/usePermissions';
import { getAllCampaigns } from '../../services/campaignService';
import { CAMPAIGN_STATUS } from '../../utils/constants';
import FilterDropdown from '../common/FilterDropdown';
import Pagination from '../common/Pagination';
import SearchBar from '../common/SearchBar';
import CampaignCard from './CampaignCard';

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 12,
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    bloodType: '',
    upcoming: '',
  });

  const { loading, execute } = useApi();
  const { canCreateCampaigns } = usePermissions();

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: CAMPAIGN_STATUS.PLANNED, label: 'Planned' },
    { value: CAMPAIGN_STATUS.ACTIVE, label: 'Active' },
    { value: CAMPAIGN_STATUS.COMPLETED, label: 'Completed' },
    { value: CAMPAIGN_STATUS.CANCELLED, label: 'Cancelled' },
  ];

  const bloodTypeOptions = [
    { value: '', label: 'All Blood Types' },
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' },
  ];

  const upcomingOptions = [
    { value: '', label: 'All Campaigns' },
    { value: 'true', label: 'Upcoming Only' },
  ];

  const fetchCampaigns = async (params = {}) => {
    await execute(
      () => getAllCampaigns({
        ...filters,
        ...params,
        page: pagination.current,
        limit: pagination.limit,
      }),
      {
        onSuccess: (response) => {
          setCampaigns(response.data.campaigns);
          setPagination(response.data.pagination);
        },
      }
    );
  };

  useEffect(() => {
    fetchCampaigns();
  }, [filters, pagination.current, pagination.limit]);

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page }));
  };

  const handleLimitChange = (limit) => {
    setPagination(prev => ({ ...prev, limit, current: 1 }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blood Donation Campaigns</h1>
          <p className="mt-1 text-sm text-gray-500">
            Organize and manage blood donation campaigns
          </p>
        </div>
        
        {canCreateCampaigns && (
          <div className="mt-4 sm:mt-0">
            <Link
              to="/campaigns/create"
              className="btn btn-primary inline-flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Campaign
            </Link>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SearchBar
            placeholder="Search campaigns..."
            value={filters.search}
            onChange={handleSearch}
            className="md:col-span-1"
          />
          
          <FilterDropdown
            label="Status"
            options={statusOptions}
            value={filters.status}
            onChange={(value) => handleFilterChange('status', value)}
            placeholder="Filter by status"
          />
          
          <FilterDropdown
            label="Blood Type"
            options={bloodTypeOptions}
            value={filters.bloodType}
            onChange={(value) => handleFilterChange('bloodType', value)}
            placeholder="Filter by blood type"
          />
          
          <FilterDropdown
            label="Timing"
            options={upcomingOptions}
            value={filters.upcoming}
            onChange={(value) => handleFilterChange('upcoming', value)}
            placeholder="Filter by timing"
          />
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow border border-gray-200 p-6 animate-pulse">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
                </div>
                <div className="flex space-x-4">
                  <div className="h-8 bg-gray-200 rounded w-20" />
                  <div className="h-8 bg-gray-200 rounded w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {Object.values(filters).some(Boolean)
              ? 'Try adjusting your search criteria.'
              : 'Get started by creating a new campaign.'}
          </p>
          {canCreateCampaigns && !Object.values(filters).some(Boolean) && (
            <div className="mt-6">
              <Link
                to="/campaigns/create"
                className="btn btn-primary inline-flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Campaign
              </Link>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Campaign Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign._id}
                campaign={campaign}
                onUpdate={fetchCampaigns}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <Pagination
              currentPage={pagination.current}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleLimitChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default CampaignList;