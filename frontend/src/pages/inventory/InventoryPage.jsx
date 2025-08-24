import { BeakerIcon, ExclamationTriangleIcon, FunnelIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FilterDropdown from '../../components/common/FilterDropdown';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';
import BloodTypeFilter from '../../components/inventory/BloodTypeFilter';
import ExpiryAlerts from '../../components/inventory/ExpiryAlerts';
import InventoryList from '../../components/inventory/InventoryList';
import StockLevels from '../../components/inventory/StockLevels';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { usePagination } from '../../hooks/usePagination';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getAllInventory, getInventoryStats } from '../../services/inventoryService';

const InventoryPage = () => {
  const { user, hasPermission } = useAuth();
  const { execute, loading } = useApi();
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({
    totalUnits: 0,
    expiringIn7Days: 0,
    expiringIn3Days: 0,
    lowStockItems: 0,
    byBloodType: {}
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    bloodType: '',
    status: '',
    location: '',
    expiring: ''
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
    { value: 'available', label: 'Available' },
    { value: 'reserved', label: 'Reserved' },
    { value: 'used', label: 'Used' },
    { value: 'expired', label: 'Expired' }
  ];

  const locationOptions = [
    { value: '', label: 'All Locations' },
    { value: 'main_storage', label: 'Main Storage' },
    { value: 'emergency_stock', label: 'Emergency Stock' },
    { value: 'processing', label: 'Processing' },
    { value: 'quarantine', label: 'Quarantine' }
  ];

  const expiringOptions = [
    { value: '', label: 'All Items' },
    { value: '1', label: 'Expiring in 1 day' },
    { value: '3', label: 'Expiring in 3 days' },
    { value: '7', label: 'Expiring in 7 days' },
    { value: '14', label: 'Expiring in 14 days' }
  ];

  useEffect(() => {
    fetchInventory();
    fetchStats();
  }, [currentPage, searchTerm, filters]);

  const fetchInventory = async () => {
    try {
      const queryParams = {
        page: currentPage,
        limit: 15,
        search: searchTerm,
        ...filters
      };

      const response = await execute(() => getAllInventory(queryParams));
      
      if (response?.data) {
        setInventory(response.data.inventory || []);
        updatePagination(
          response.data.pagination?.total || 0,
          Math.ceil((response.data.pagination?.total || 0) / 15)
        );
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await execute(() => getInventoryStats(), { showLoading: false });
      if (response?.data) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch inventory stats:', error);
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
      location: '',
      expiring: ''
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
            <h1 className="text-3xl font-bold text-gray-900">Blood Inventory Management</h1>
            <p className="mt-2 text-gray-600">
              Monitor blood stock levels, expiry dates, and inventory status
            </p>
          </div>
          
          {hasPermission('manage_inventory') && (
            <Link
              to="/inventory/add"
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Blood Stock
            </Link>
          )}
        </div>

        {/* Alert Banners */}
        {(stats.expiringIn3Days > 0 || stats.lowStockItems > 0) && (
          <div className="space-y-4">
            {stats.expiringIn3Days > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-sm font-semibold text-red-800">
                      Critical Expiry Alert
                    </h3>
                    <p className="mt-1 text-sm text-red-700">
                      {stats.expiringIn3Days} blood units are expiring within 3 days. Immediate action required.
                    </p>
                    <div className="mt-3">
                      <button
                        onClick={() => handleFilterChange('expiring', '3')}
                        className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors"
                      >
                        View Expiring Items
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {stats.lowStockItems > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-sm font-semibold text-yellow-800">
                      Low Stock Warning
                    </h3>
                    <p className="mt-1 text-sm text-yellow-700">
                      {stats.lowStockItems} blood types are running low on stock. Consider organizing donation campaigns.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BeakerIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Units</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUnits}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <div className="w-6 h-6 text-green-600">✅</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {inventory.filter(item => item.status === 'available').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <div className="w-6 h-6 text-yellow-600">⏰</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-gray-900">{stats.expiringIn7Days}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <div className="w-6 h-6 text-red-600">📊</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">{stats.lowStockItems}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Levels by Blood Type */}
        <StockLevels stats={stats} />

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <SearchBar
                placeholder="Search by batch number, donor ID..."
                value={searchTerm}
                onChange={handleSearch}
                icon={MagnifyingGlassIcon}
              />
            </div>
            
            <BloodTypeFilter
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
              label="Location"
              options={locationOptions}
              value={filters.location}
              onChange={(value) => handleFilterChange('location', value)}
            />
            
            <FilterDropdown
              label="Expiring"
              options={expiringOptions}
              value={filters.expiring}
              onChange={(value) => handleFilterChange('expiring', value)}
            />
          </div>
          
          {(searchTerm || Object.values(filters).some(f => f)) && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {totalItems} items found
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

        {/* Expiry Alerts */}
        <ExpiryAlerts />

        {/* Inventory List */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8">
              <Loading />
            </div>
          ) : inventory.length > 0 ? (
            <>
              <InventoryList inventory={inventory} onUpdate={fetchInventory} />
              
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
                No inventory items found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || Object.values(filters).some(f => f)
                  ? "Try adjusting your search or filters"
                  : "There are no blood inventory items yet"
                }
              </p>
              {hasPermission('manage_inventory') && (
                <Link
                  to="/inventory/add"
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Add First Item
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InventoryPage;