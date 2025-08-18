import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRef, useState } from 'react';
import { useDebouncedCallback } from '../../hooks/useDebounce';

const SearchBar = ({
  placeholder = 'Search...',
  value = '',
  onChange,
  onClear,
  debounceMs = 300,
  disabled = false,
  autoFocus = false,
  className = '',
  size = 'md',
}) => {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef(null);

  const { debouncedCallback } = useDebouncedCallback(
    (searchValue) => {
      if (onChange) {
        onChange(searchValue);
      }
    },
    debounceMs
  );

  const sizeClasses = {
    sm: 'h-8 pl-8 pr-8 text-sm',
    md: 'h-10 pl-10 pr-10 text-sm',
    lg: 'h-12 pl-12 pr-12 text-base',
  };

  const iconSizeClasses = {
    sm: 'h-4 w-4 left-2',
    md: 'h-5 w-5 left-3',
    lg: 'h-6 w-6 left-3',
  };

  const clearIconSizeClasses = {
    sm: 'h-4 w-4 right-2',
    md: 'h-5 w-5 right-3',
    lg: 'h-6 w-6 right-3',
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    debouncedCallback(newValue);
  };

  const handleClear = () => {
    setLocalValue('');
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange('');
    }
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search icon */}
      <div className={`absolute inset-y-0 flex items-center pointer-events-none text-gray-400 ${iconSizeClasses[size]}`}>
        <MagnifyingGlassIcon />
      </div>

      {/* Input field */}
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={`
          block w-full rounded-md border-gray-300 
          focus:border-red-500 focus:ring-red-500 
          disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
          ${sizeClasses[size]}
          ${className}
        `}
      />

      {/* Clear button */}
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className={`absolute inset-y-0 flex items-center text-gray-400 hover:text-gray-600 ${clearIconSizeClasses[size]}`}
        >
          <XMarkIcon />
        </button>
      )}
    </div>
  );
};

export default SearchBar;