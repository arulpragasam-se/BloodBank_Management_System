import {
    ChevronDownIcon,
    ChevronUpIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { LoadingTable } from './Loading';
import Pagination from './Pagination';

const Table = ({
  columns = [],
  data = [],
  loading = false,
  sortable = true,
  pagination = null,
  onSort,
  onRowClick,
  emptyMessage = 'No data available',
  className = '',
  striped = true,
  hover = true,
}) => {
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    if (!sortable || !field) return;

    let direction = 'asc';
    if (sortField === field && sortDirection === 'asc') {
      direction = 'desc';
    }

    setSortField(field);
    setSortDirection(direction);

    if (onSort) {
      onSort(field, direction);
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' 
      ? <ChevronUpIcon className="h-4 w-4" />
      : <ChevronDownIcon className="h-4 w-4" />;
  };

  if (loading) {
    return <LoadingTable rows={5} columns={columns.length} />;
  }

  return (
    <div className={`overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          {/* Header */}
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key || index}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable !== false && sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  } ${column.headerClassName || ''}`}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable !== false && sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className={`bg-white divide-y divide-gray-200 ${striped ? 'divide-y-2' : ''}`}>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <svg
                      className="h-12 w-12 text-gray-400 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-sm text-gray-500">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`
                    ${striped && rowIndex % 2 === 1 ? 'bg-gray-50' : 'bg-white'}
                    ${hover ? 'hover:bg-gray-100' : ''}
                    ${onRowClick ? 'cursor-pointer' : ''}
                    transition-colors duration-150
                  `}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={`${rowIndex}-${column.key || colIndex}`}
                      className={`px-6 py-4 whitespace-nowrap text-sm ${column.className || 'text-gray-900'}`}
                    >
                      {column.render ? column.render(row[column.key], row, rowIndex) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={pagination.onPageChange}
          onItemsPerPageChange={pagination.onItemsPerPageChange}
        />
      )}
    </div>
  );
};

export const TableAction = ({ icon: Icon, label, onClick, variant = 'default' }) => {
  const variants = {
    default: 'text-gray-600 hover:text-gray-900',
    primary: 'text-red-600 hover:text-red-700',
    danger: 'text-red-600 hover:text-red-700',
    success: 'text-green-600 hover:text-green-700',
  };

  return (
    <button
      onClick={onClick}
      className={`p-1 rounded-md ${variants[variant]} hover:bg-gray-100 transition-colors duration-150`}
      title={label}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
};

export const TableActions = ({ children, align = 'right' }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`flex items-center space-x-2 ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
      {children}
    </div>
  );
};

export default Table;