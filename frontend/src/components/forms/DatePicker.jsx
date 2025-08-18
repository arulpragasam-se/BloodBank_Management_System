import { CalendarIcon } from '@heroicons/react/24/outline';
import { forwardRef } from 'react';

const DatePicker = forwardRef(({
  label,
  value,
  onChange,
  onBlur,
  onFocus,
  name,
  id,
  error,
  helperText,
  required = false,
  disabled = false,
  readOnly = false,
  min,
  max,
  placeholder,
  showTime = false,
  autoFocus = false,
  className = '',
  inputClassName = '',
  ...props
}, ref) => {
  const inputId = id || name;
  const inputType = showTime ? 'datetime-local' : 'date';

  const formatValue = (val) => {
    if (!val) return '';
    
    const date = new Date(val);
    if (isNaN(date.getTime())) return '';
    
    if (showTime) {
      // Format for datetime-local input (YYYY-MM-DDTHH:MM)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } else {
      // Format for date input (YYYY-MM-DD)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange(e, newValue ? new Date(newValue) : null);
    }
  };

  const baseClasses = `
    block w-full rounded-md border-gray-300 shadow-sm pl-10 pr-3 py-2 text-sm
    focus:border-red-500 focus:ring-red-500
    disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
    read-only:bg-gray-50 read-only:text-gray-500
    ${error ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500' : ''}
    ${inputClassName}
  `;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`form-label ${required ? 'form-label-required' : ''}`}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <CalendarIcon className={`h-5 w-5 ${error ? 'text-red-400' : 'text-gray-400'}`} />
        </div>

        <input
          ref={ref}
          type={inputType}
          id={inputId}
          name={name}
          value={formatValue(value)}
          onChange={handleChange}
          onBlur={onBlur}
          onFocus={onFocus}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          min={min}
          max={max}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={baseClasses}
          {...props}
        />
      </div>

      {(error || helperText) && (
        <div className="mt-1">
          {error ? (
            <p className="form-error">{error}</p>
          ) : (
            <p className="form-help">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
});

DatePicker.displayName = 'DatePicker';

export default DatePicker;