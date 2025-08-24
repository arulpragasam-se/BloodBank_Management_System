import { FunnelIcon, MagnifyingGlassIcon, PlusIcon, UserIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FilterDropdown from '../../components/common/FilterDropdown';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';
import RecipientList from '../../components/recipients/RecipientList';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { usePagination } from '../../hooks/usePagination';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getAllRecipients } from '../../services/recipientService';

const RecipientsPage = () => {
  const { user, hasPermission } = useAuth();
  const { execute, loading } = useApi();
  const [recipients, setRecipients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    bloodType: '',
    status: '',
    district: '',
    medicalCondition: '',
    urgency: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    recentTransfusions: 0,
    pendingRequests: 0
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
    { value: 'critical', label: 'Critical' },
    { value: 'stable', label: 'Stable' }
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

  const medicalConditionOptions = [
    { value: '', label: 'All Conditions' },
    { value: 'thalassemia', label: 'Thalassemia' },
    { value: 'anemia', label: 'Anemia' },
    { value: 'leukemia', label: 'Leukemia' },
    { value: 'surgery', label: 'Surgical Procedure' },
    { value: 'trauma', label: 'Trauma/Accident' },
    { value: 'cancer', label: 'Cancer Treatment' },
    { value: 'kidney_disease', label: 'Kidney Disease' },
    { value: 'other', label: 'Other' }
  ];

  const urgencyOptions = [
    { value: '', label: 'All Urgency' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  useEffect(() => {
    fetchRecipients();
  }, [currentPage, searchTerm, filters]);

  const fetchRecipients = async () => {
    try {
      const queryParams = {
        page: currentPage,
        limit: 12,
        search: searchTerm,
        ...filters
      };

      const response = await execute(() => getAllRecipients(queryParams));
      
      if (response?.data) {
        setRecipients(response.data.recipients || []);
        setStats(response.data.stats || stats);
        updatePagination(
          response.data.pagination?.total || 0,
          Math.ceil((response.data.pagination?.total || 0) / 12)
        );
      }
    } catch (error) {
      console.error('Failed to fetch recipients:', error);
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
      medicalCondition: '',
      urgency: ''
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
            <h1 className="text-3xl font-bold text-gray-900">Recipient Management</h1>
            <p className="mt-2 text-gray-600">
              Manage blood recipients and track their transfusion history
            </p>
          </div>
          
          {hasPermission('create_recipient') && (
            <Link
              to="/recipients/add"
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Recipient
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <UserIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Recipients</p>
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
                <p className="text-sm font-medium text-gray-600">Active Recipients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <div className="w-6 h-6 text-purple-600">💉</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recent Transfusions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recentTransfusions}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <div className="w-6 h-6 text-yellow-600">📋</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Critical Patients Alert */}
        {stats.criticalPatients > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 text-red-600">🚨</div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-red-800">
                  Critical Patients Alert
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  {stats.criticalPatients} recipients require immediate blood transfusion. Review their cases urgently.
                </p>
                <div className="mt-3">
                  <button
                    onClick={() => handleFilterChange('urgency', 'critical')}
                    className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors"
                  >
                    View Critical Cases
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            <div className="lg:col-span-2">
              <SearchBar
                placeholder="Search recipients by name, ID, condition..."
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
              label="Condition"
              options={medicalConditionOptions}
              value={filters.medicalCondition}
              onChange={(value) => handleFilterChange('medicalCondition', value)}
            />
            
            <FilterDropdown
              label="Urgency"
              options={urgencyOptions}
              value={filters.urgency}
              onChange={(value) => handleFilterChange('urgency', value)}
            />
          </div>
          
          {(searchTerm || Object.values(filters).some(f => f)) && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {totalItems} recipients found
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
            Recipients by Blood Type
          </h3>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bloodType) => (
              <div key={bloodType} className="text-center">
                <div className="bg-purple-50 rounded-lg p-3 mb-2">
                  <div className="text-lg font-bold text-purple-600">{bloodType}</div>
                </div>
                <div className="text-sm text-gray-600">
                  {Math.floor(Math.random() * 50) + 10} recipients
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Medical Conditions Overview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Common Medical Conditions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">34</div>
              <div className="text-sm text-red-600">Thalassemia</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">28</div>
              <div className="text-sm text-blue-600">Anemia</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">19</div>
              <div className="text-sm text-green-600">Cancer Treatment</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">15</div>
              <div className="text-sm text-yellow-600">Surgical Cases</div>
            </div>
          </div>
        </div>

        {/* Recipients List */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8">
              <Loading />
            </div>
          ) : recipients.length > 0 ? (
            <>
              <RecipientList recipients={recipients} />
              
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
                No recipients found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || Object.values(filters).some(f => f)
                  ? "Try adjusting your search or filters"
                  : "There are no registered recipients yet"
                }
              </p>
              {hasPermission('create_recipient') && (
                <Link
                  to="/recipients/add"
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Add First Recipient
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RecipientsPage;