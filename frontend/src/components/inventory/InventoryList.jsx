import { useEffect, useState } from 'react';
import { inventoryService } from '../../services/inventoryService';
import FilterDropdown from '../common/FilterDropdown';
import Loading from '../common/Loading';
import Table from '../common/Table';
import Toast from '../common/Toast';
import BloodTypeFilter from './BloodTypeFilter';

const InventoryList = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    bloodType: '',
    status: '',
    expiring: ''
  });
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });

  const fetchInventory = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, ...filters };
      const response = await inventoryService.getAllInventory(params);
      
      if (response.success) {
        setInventory(response.data.inventory);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      reserved: 'bg-yellow-100 text-yellow-800',
      used: 'bg-blue-100 text-blue-800',
      expired: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const timeDiff = expiry.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const columns = [
    { key: 'bloodType', label: 'Blood Type' },
    { key: 'units', label: 'Units' },
    { 
      key: 'collectionDate', 
      label: 'Collection Date',
      render: (value) => new Date(value).toLocaleDateString()
    },
    { 
      key: 'expiryDate', 
      label: 'Expiry Date',
      render: (value) => {
        const days = getDaysUntilExpiry(value);
        const color = days <= 7 ? 'text-red-600' : days <= 14 ? 'text-yellow-600' : 'text-gray-600';
        return (
          <span className={color}>
            {new Date(value).toLocaleDateString()} ({days} days)
          </span>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {value}
        </span>
      )
    },
    { key: 'storageLocation.section', label: 'Storage Section' },
    {
      key: 'testResults',
      label: 'Test Status',
      render: (value) => {
        const allNegative = Object.values(value).every(test => test === 'negative');
        const allComplete = !Object.values(value).includes('pending');
        
        if (allComplete && allNegative) {
          return <span className="text-green-600">✓ Passed</span>;
        } else if (allComplete) {
          return <span className="text-red-600">✗ Failed</span>;
        }
        return <span className="text-yellow-600">⏳ Pending</span>;
      }
    }
  ];

  const statusOptions = [
    { value: 'available', label: 'Available' },
    { value: 'reserved', label: 'Reserved' },
    { value: 'used', label: 'Used' },
    { value: 'expired', label: 'Expired' }
  ];

  const expiryOptions = [
    { value: '7', label: 'Expires in 7 days' },
    { value: '14', label: 'Expires in 14 days' },
    { value: '30', label: 'Expires in 30 days' }
  ];

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {error && <Toast type="error" message={error} onClose={() => setError('')} />}
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <BloodTypeFilter
          value={filters.bloodType}
          onChange={(value) => handleFilterChange('bloodType', value)}
        />
        
        <FilterDropdown
          value={filters.status}
          onChange={(value) => handleFilterChange('status', value)}
          options={statusOptions}
          placeholder="Filter by Status"
        />
        
        <FilterDropdown
          value={filters.expiring}
          onChange={(value) => handleFilterChange('expiring', value)}
          options={expiryOptions}
          placeholder="Filter by Expiry"
        />
      </div>

      <Table
        data={inventory}
        columns={columns}
        pagination={pagination}
        onPageChange={fetchInventory}
        rowKey="_id"
      />
    </div>
  );
};

export default InventoryList;