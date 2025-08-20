import { Filter, X } from 'lucide-react';
import { useState } from 'react';
import { BLOOD_TYPES, REQUEST_STATUS, URGENCY_LEVELS } from '../../utils/constants';
import Input from '../forms/Input';
import Select from '../forms/Select';

const RequestFilters = ({ onFiltersChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    status: initialFilters.status || '',
    urgency: initialFilters.urgency || '',
    bloodType: initialFilters.bloodType || '',
    hospitalId: initialFilters.hospitalId || '',
    dateFrom: initialFilters.dateFrom || '',
    dateTo: initialFilters.dateTo || '',
    overdue: initialFilters.overdue || false,
    ...initialFilters
  });

  const [showFilters, setShowFilters] = useState(false);

  const statusOptions = Object.entries(REQUEST_STATUS).map(([key, value]) => ({
    value,
    label: key.replace('_', ' ').toUpperCase()
  }));

  const urgencyOptions = Object.entries(URGENCY_LEVELS).map(([key, value]) => ({
    value,
    label: key.charAt(0) + key.slice(1).toLowerCase()
  }));

  const handleFilterChange = (name, value) => {
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
    onFiltersChange && onFiltersChange(updatedFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      status: '',
      urgency: '',
      bloodType: '',
      hospitalId: '',
      dateFrom: '',
      dateTo: '',
      overdue: false
    };
    setFilters(emptyFilters);
    onFiltersChange && onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== false);

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
              {Object.values(filters).filter(value => value !== '' && value !== false).length}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Status"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            options={statusOptions}
            placeholder="All statuses"
          />

          <Select
            label="Urgency"
            name="urgency"
            value={filters.urgency}
            onChange={handleFilterChange}
            options={urgencyOptions}
            placeholder="All urgency levels"
          />

          <Select
            label="Blood Type"
            name="bloodType"
            value={filters.bloodType}
            onChange={handleFilterChange}
            options={BLOOD_TYPES.map(type => ({ value: type, label: type }))}
            placeholder="All blood types"
          />

          <Input
            label="Hospital ID"
            name="hospitalId"
            value={filters.hospitalId}
            onChange={handleFilterChange}
            placeholder="Filter by hospital"
          />

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

          <div className="flex items-center">
            <input
              type="checkbox"
              id="overdue"
              checked={filters.overdue}
              onChange={(e) => handleFilterChange('overdue', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="overdue" className="text-sm text-gray-700">
              Show overdue only
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestFilters;