import { ChevronDownIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';

const FilterDropdown = ({
  label = 'Filter',
  options = [],
  value = '',
  onChange,
  multiple = false,
  placeholder = 'Select...',
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState(
    multiple ? (Array.isArray(value) ? value : []) : value
  );
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (optionValue) => {
    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue];
      
      setSelectedValues(newValues);
      onChange(newValues);
    } else {
      setSelectedValues(optionValue);
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const getDisplayText = () => {
    if (multiple) {
      if (selectedValues.length === 0) return placeholder;
      if (selectedValues.length === 1) {
        const option = options.find(opt => opt.value === selectedValues[0]);
        return option?.label || selectedValues[0];
      }
      return `${selectedValues.length} selected`;
    } else {
      if (!selectedValues) return placeholder;
      const option = options.find(opt => opt.value === selectedValues);
      return option?.label || selectedValues;
    }
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    const newValue = multiple ? [] : '';
    setSelectedValues(newValue);
    onChange(newValue);
  };

  const hasSelection = multiple ? selectedValues.length > 0 : selectedValues;

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          relative w-full cursor-pointer rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left 
          shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 
          disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
          ${isOpen ? 'border-red-500 ring-1 ring-red-500' : ''}
        `}
      >
        <div className="flex items-center">
          <FunnelIcon className="h-4 w-4 text-gray-400 mr-2" />
          <span className="block truncate text-sm">{getDisplayText()}</span>
        </div>
        
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          {hasSelection && (
            <button
              type="button"
              onClick={clearSelection}
              className="pointer-events-auto rounded-full p-0.5 hover:bg-gray-100 mr-1"
            >
              <span className="sr-only">Clear selection</span>
              <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                <path
                  d="m1 1 10 10M11 1 1 11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
          <ChevronDownIcon 
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">No options available</div>
          ) : (
            options.map((option) => {
              const isSelected = multiple 
                ? selectedValues.includes(option.value)
                : selectedValues === option.value;

              return (
                <div
                  key={option.value}
                  onClick={() => handleOptionClick(option.value)}
                  className={`
                    relative cursor-pointer select-none py-2 pl-3 pr-9 text-sm
                    ${isSelected 
                      ? 'bg-red-100 text-red-900' 
                      : 'text-gray-900 hover:bg-gray-100'
                    }
                  `}
                >
                  <div className="flex items-center">
                    {multiple && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // Handled by parent click
                        className="mr-2 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                    )}
                    <span className={`block truncate ${isSelected ? 'font-medium' : 'font-normal'}`}>
                      {option.label}
                    </span>
                  </div>

                  {!multiple && isSelected && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-red-600">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;