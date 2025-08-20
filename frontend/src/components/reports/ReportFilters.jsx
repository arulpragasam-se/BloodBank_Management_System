import { Filter, X } from 'lucide-react';
import { useState } from 'react';
import { BLOOD_TYPES } from '../../utils/constants';
import Input from '../forms/Input';
import Select from '../forms/Select';

const ReportFilters = ({ onFiltersChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    dateFrom: initialFilters.dateFrom || '',
    dateTo: initialFilters.dateTo || '',
    bloodType: initialFilters.bloodType || '',
    status: initialFilters.status || '',
    hospitalId: initialFilters.hospitalId || '',
    ...initialFilters
  });

  const [showFilters, setShowFilters] = useState(false);

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'fulfilled', label: 'Fulfilled' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const handleFilterChange = (name, value) => {
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
    onFiltersChange && onFiltersChange(updatedFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      dateFrom: '',
      dateTo: '',
      bloodType: '',
      status: '',
      hospitalId: ''
    };
    setFilters(emptyFilters);
    onFiltersChange && onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              {Object.values(filters).filter(value => value !== '').length}
            </span>
          )}
        </button>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </button>
        )}
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Date From"
            name="dateFrom"
            type="date"
            value={filters.dateFrom}
            onChange={handleFilterChange}
          />

          <Input
            label="Date To"
            name="dateTo"
            type="date"
            value={filters.dateTo}
            onChange={handleFilterChange}
          />

          <Select
            label="Blood Type"
            name="bloodType"
            value={filters.bloodType}
            onChange={handleFilterChange}
            options={BLOOD_TYPES.map(type => ({ value: type, label: type }))}
            placeholder="All blood types"
          />

          <Select
            label="Status"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            options={statusOptions}
            placeholder="All statuses"
          />

          <Input
            label="Hospital ID"
            name="hospitalId"
            value={filters.hospitalId}
            onChange={handleFilterChange}
            placeholder="Filter by hospital"
          />
        </div>
      )}
    </div>
  );
};

export default ReportFilters;