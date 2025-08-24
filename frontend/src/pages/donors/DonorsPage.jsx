import { FunnelIcon, MagnifyingGlassIcon, PlusIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FilterDropdown from '../../components/common/FilterDropdown';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';
import DonorList from '../../components/donors/DonorList';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { usePagination } from '../../hooks/usePagination';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getAllDonors } from '../../services/donorService';

const DonorsPage = () => {
  const { user, hasPermission } = useAuth();
  const { execute, loading } = useApi();
  const [donors, setDonors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    bloodType: '',
    status: '',
    district: '',
    gender: '',
    eligibility: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    eligible: 0,
    active: 0,
    lastDonation: 0
  });

  const {
    currentPage,
    totalPages,
    totalItems,
    handlePageChange,
    updatePagination
  } = usePagination();

  const bloodTypeOptions = [
    { value: '', label: 'All Blood Types' },
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' }
  ];

  const districtOptions = [
    { value: '', label: 'All Districts' },
    { value: 'Colombo', label: 'Colombo' },
    { value: 'Gampaha', label: 'Gampaha' },
    { value: 'Kalutara', label: 'Kalutara' },
    { value: 'Kandy', label: 'Kandy' },
    { value: 'Galle', label: 'Galle' },
    { value: 'Matara', label: 'Matara' }
  ];

  const genderOptions = [
    { value: '', label: 'All Genders' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' }
  ];

  const eligibilityOptions = [
    { value: '', label: 'All Eligibility' },
    { value: 'eligible', label: 'Eligible' },
    { value: 'not_eligible', label: 'Not Eligible' },
    { value: 'pending', label: 'Pending Review' }
  ];

  useEffect(() => {
    fetchDonors();
  }, [currentPage, searchTerm, filters]);

  const fetchDonors = async () => {
    try {
      const queryParams = {
        page: currentPage,
        limit: 12,
        search: searchTerm,
        ...filters
      };

      const response = await execute(() => getAllDonors(queryParams));
      
      if (response?.data) {
        setDonors(response.data.donors || []);
        setStats(response.data.stats || stats);
        updatePagination(
          response.data.pagination?.total || 0,
          Math.ceil((response.data.pagination?.total || 0) / 12)
        );
      }
    } catch (error) {
      console.error('Failed to fetch donors:', error);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    handlePageChange(1);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    handlePageChange(1);
  };

  const clearFilters = () => {
    setFilters({
      bloodType: '',
      status: '',
      district: '',
      gender: '',
      eligibility: ''
    });
    setSearchTerm('');
    handlePageChange(1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Donor Management</h1>
            <p className="mt-2 text-gray-600">
              Manage registered donors and track their donation history
            </p>
          </div>
          
          {hasPermission('create_donor') && (
            <Link
              to="/donors/add"
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Donor
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <UserGroupIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Donors</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <div className="w-6 h-6 text-green-600">✅</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Eligible Donors</p>
                <p className="text-2xl font-bold text-gray-900">{stats.eligible}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <div className="w-6 h-6 text-yellow-600">👤</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Donors</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <div className="w-6 h-6 text-red-600">💉</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Donated This Month</p>
                <p className="text-2xl font-bold text-gray-900">{stats.lastDonation}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            <div className="lg:col-span-2">
              <SearchBar
                placeholder="Search donors by name, email, phone..."
                value={searchTerm}
                onChange={handleSearch}
                icon={MagnifyingGlassIcon}
              />
            </div>
            
            <FilterDropdown
              label="Blood Type"
              options={bloodTypeOptions}
              value={filters.bloodType}
              onChange={(value) => handleFilterChange('bloodType', value)}
            />
            
            <FilterDropdown
              label="Status"
              options={statusOptions}
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
            />
            
            <FilterDropdown
              label="District"
              options={districtOptions}
              value={filters.district}
              onChange={(value) => handleFilterChange('district', value)}
            />
            
            <FilterDropdown
              label="Gender"
              options={genderOptions}
              value={filters.gender}
              onChange={(value) => handleFilterChange('gender', value)}
            />
            
            <FilterDropdown
              label="Eligibility"
              options={eligibilityOptions}
              value={filters.eligibility}
              onChange={(value) => handleFilterChange('eligibility', value)}
            />
          </div>
          
          {(searchTerm || Object.values(filters).some(f => f)) && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {totalItems} donors found
              </span>
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Blood Type Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Blood Type Distribution
          </h3>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bloodType) => (
              <div key={bloodType} className="text-center">
                <div className="bg-red-50 rounded-lg p-3 mb-2">
                  <div className="text-lg font-bold text-red-600">{bloodType}</div>
                </div>
                <div className="text-sm text-gray-600">
                  {Math.floor(Math.random() * 100) + 50} donors
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Donors List */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8">
              <Loading />
            </div>
          ) : donors.length > 0 ? (
            <>
              <DonorList donors={donors} />
              
              {totalPages > 1 && (
                <div className="border-t border-gray-200 px-6 py-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FunnelIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No donors found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || Object.values(filters).some(f => f)
                  ? "Try adjusting your search or filters"
                  : "There are no registered donors yet"
                }
              </p>
              {hasPermission('create_donor') && (
                <Link
                  to="/donors/add"
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Add First Donor
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DonorsPage;