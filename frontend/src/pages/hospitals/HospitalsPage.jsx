import { BuildingOfficeIcon, FunnelIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FilterDropdown from '../../components/common/FilterDropdown';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';
import HospitalList from '../../components/hospitals/HospitalList';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { usePagination } from '../../hooks/usePagination';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getAllHospitals } from '../../services/hospitalService';

const HospitalsPage = () => {
  const { user, hasPermission } = useAuth();
  const { execute, loading } = useApi();
  const [hospitals, setHospitals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    district: '',
    type: '',
    size: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    requests: 0,
    staff: 0
  });

  const {
    currentPage,
    totalPages,
    totalItems,
    handlePageChange,
    updatePagination
  } = usePagination();

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending Approval' }
  ];

  const districtOptions = [
    { value: '', label: 'All Districts' },
    { value: 'Colombo', label: 'Colombo' },
    { value: 'Gampaha', label: 'Gampaha' },
    { value: 'Kalutara', label: 'Kalutara' },
    { value: 'Kandy', label: 'Kandy' },
    { value: 'Galle', label: 'Galle' },
    { value: 'Matara', label: 'Matara' },
    { value: 'Hambantota', label: 'Hambantota' },
    { value: 'Jaffna', label: 'Jaffna' },
    { value: 'Anuradhapura', label: 'Anuradhapura' }
  ];

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'government', label: 'Government' },
    { value: 'private', label: 'Private' },
    { value: 'semi_government', label: 'Semi-Government' },
    { value: 'specialized', label: 'Specialized' }
  ];

  const sizeOptions = [
    { value: '', label: 'All Sizes' },
    { value: 'small', label: 'Small (< 100 beds)' },
    { value: 'medium', label: 'Medium (100-300 beds)' },
    { value: 'large', label: 'Large (300-500 beds)' },
    { value: 'major', label: 'Major (> 500 beds)' }
  ];

  useEffect(() => {
    fetchHospitals();
  }, [currentPage, searchTerm, filters]);

  const fetchHospitals = async () => {
    try {
      const queryParams = {
        page: currentPage,
        limit: 12,
        search: searchTerm,
        ...filters
      };

      const response = await execute(() => getAllHospitals(queryParams));
      
      if (response?.data) {
        setHospitals(response.data.hospitals || []);
        setStats(response.data.stats || stats);
        updatePagination(
          response.data.pagination?.total || 0,
          Math.ceil((response.data.pagination?.total || 0) / 12)
        );
      }
    } catch (error) {
      console.error('Failed to fetch hospitals:', error);
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
      status: '',
      district: '',
      type: '',
      size: ''
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
            <h1 className="text-3xl font-bold text-gray-900">Hospital Management</h1>
            <p className="mt-2 text-gray-600">
              Manage partner hospitals and coordinate blood supply
            </p>
          </div>
          
          {hasPermission('create_hospital') && (
            <Link
              to="/hospitals/add"
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Hospital
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Hospitals</p>
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
                <p className="text-sm font-medium text-gray-600">Active Partners</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <div className="w-6 h-6 text-yellow-600">📋</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.requests}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <div className="w-6 h-6 text-purple-600">👥</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold text-gray-900">{stats.staff}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <SearchBar
                placeholder="Search hospitals by name, location..."
                value={searchTerm}
                onChange={handleSearch}
                icon={MagnifyingGlassIcon}
              />
            </div>
            
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
              label="Type"
              options={typeOptions}
              value={filters.type}
              onChange={(value) => handleFilterChange('type', value)}
            />
            
            <FilterDropdown
              label="Size"
              options={sizeOptions}
              value={filters.size}
              onChange={(value) => handleFilterChange('size', value)}
            />
          </div>
          
          {(searchTerm || Object.values(filters).some(f => f)) && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {totalItems} hospitals found
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

        {/* Hospital Type Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Hospital Distribution
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-50 rounded-lg p-4 mb-2">
                <div className="text-2xl font-bold text-blue-600">28</div>
                <div className="text-sm text-blue-600">Government</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-green-50 rounded-lg p-4 mb-2">
                <div className="text-2xl font-bold text-green-600">15</div>
                <div className="text-sm text-green-600">Private</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-50 rounded-lg p-4 mb-2">
                <div className="text-2xl font-bold text-purple-600">8</div>
                <div className="text-sm text-purple-600">Semi-Government</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-50 rounded-lg p-4 mb-2">
                <div className="text-2xl font-bold text-yellow-600">12</div>
                <div className="text-sm text-yellow-600">Specialized</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Blood Requests Alert */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 text-yellow-600">⚠️</div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-yellow-800">
                Urgent Blood Requests
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                There are 5 urgent blood requests from hospitals that need immediate attention.
              </p>
              <div className="mt-3">
                <Link
                  to="/requests"
                  className="inline-flex items-center px-3 py-1 bg-yellow-600 text-white text-sm font-medium rounded hover:bg-yellow-700 transition-colors"
                >
                  View Requests
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Hospitals List */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8">
              <Loading />
            </div>
          ) : hospitals.length > 0 ? (
            <>
              <HospitalList hospitals={hospitals} />
              
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
                No hospitals found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || Object.values(filters).some(f => f)
                  ? "Try adjusting your search or filters"
                  : "There are no registered hospitals yet"
                }
              </p>
              {hasPermission('create_hospital') && (
                <Link
                  to="/hospitals/add"
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Add First Hospital
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HospitalsPage;