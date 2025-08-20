import { useEffect, useState } from 'react';
import { requestService } from '../../services/requestService';
import Loading from '../common/Loading';
import SearchBar from '../common/SearchBar';
import Table from '../common/Table';
import Toast from '../common/Toast';
import RequestFilters from './RequestFilters';

const BloodRequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    urgency: '',
    bloodType: '',
    hospitalId: ''
  });
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });

  const fetchRequests = async (page = 1) => {
    try {
      setLoading(true);
      const params = { 
        page, 
        search, 
        ...filters
      };
      const response = await requestService.getAllRequests(params);
      
      if (response.success) {
        setRequests(response.data.requests);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch blood requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [search, filters]);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      partially_fulfilled: 'bg-orange-100 text-orange-800',
      fulfilled: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      critical: 'text-red-600'
    };
    return colors[urgency] || 'text-gray-600';
  };

  const isOverdue = (requiredBy, status) => {
    return new Date() > new Date(requiredBy) && status !== 'fulfilled';
  };

  const columns = [
    { 
      key: 'hospitalId.name', 
      label: 'Hospital',
      render: (value, request) => (
        <div>
          <p className="font-medium">{value || 'Unknown Hospital'}</p>
          <p className="text-xs text-gray-500">
            Requested by: {request.requestedBy?.name}
          </p>
        </div>
      )
    },
    { 
      key: 'bloodType', 
      label: 'Blood Type',
      render: (value) => (
        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
          {value}
        </span>
      )
    },
    { 
      key: 'unitsRequired', 
      label: 'Units',
      render: (value, request) => (
        <div>
          <p className="font-medium">{value} units</p>
          {request.allocatedBlood?.length > 0 && (
            <p className="text-xs text-gray-500">
              Allocated: {request.getAllocatedUnits?.()} units
            </p>
          )}
        </div>
      )
    },
    {
      key: 'urgencyLevel',
      label: 'Urgency',
      render: (value) => (
        <span className={`font-medium ${getUrgencyColor(value)}`}>
          {value.toUpperCase()}
        </span>
      )
    },
    { 
      key: 'requiredBy', 
      label: 'Required By',
      render: (value, request) => (
        <div>
          <p className={isOverdue(value, request.status) ? 'text-red-600 font-medium' : ''}>
            {new Date(value).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(value).toLocaleTimeString()}
          </p>
          {isOverdue(value, request.status) && (
            <p className="text-xs text-red-600">OVERDUE</p>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {value.replace('_', ' ').toUpperCase()}
        </span>
      )
    },
    { 
      key: 'createdAt', 
      label: 'Created',
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {error && <Toast type="error" message={error} onClose={() => setError('')} />}
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search blood requests..."
          className="flex-1"
        />
      </div>

      <RequestFilters onFiltersChange={setFilters} />

      <Table
        data={requests}
        columns={columns}
        pagination={pagination}
        onPageChange={fetchRequests}
        rowKey="_id"
        onRowClick={(request) => window.location.href = `/requests/${request._id}`}
      />
    </div>
  );
};

export default BloodRequestList;