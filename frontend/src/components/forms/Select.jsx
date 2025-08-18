import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { forwardRef } from 'react';

const Select = forwardRef(({
  label,
  options = [],
  value,
  onChange,
  onBlur,
  onFocus,
  name,
  id,
  error,
  helperText,
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  multiple = false,
  size = 'md',
  className = '',
  selectClassName = '',
  ...props
}, ref) => {
  const selectId = id || name;

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const baseClasses = `
    block w-full rounded-md border-gray-300 shadow-sm bg-white
    focus:border-red-500 focus:ring-red-500
    disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
    ${sizeClasses[size]}
    ${error ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500' : ''}
    ${!multiple ? 'pr-10' : ''}
    ${selectClassName}
  `;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className={`form-label ${required ? 'form-label-required' : ''}`}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          required={required}
          disabled={disabled}
          multiple={multiple}
          className={baseClasses}
          {...props}
        >
          {!multiple && placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          
          {options.map((option) => {
            const optionValue = typeof option === 'object' ? option.value : option;
            const optionLabel = typeof option === 'object' ? option.label : option;
            const optionDisabled = typeof option === 'object' ? option.disabled : false;

            return (
              <option
                key={optionValue}
                value={optionValue}
                disabled={optionDisabled}
              >
                {optionLabel}
              </option>
            );
          })}
        </select>

        {!multiple && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronDownIcon className={`h-5 w-5 ${error ? 'text-red-400' : 'text-gray-400'}`} />
          </div>
        )}
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

Select.displayName = 'Select';

export const SelectOption = ({ value, label, disabled = false, children }) => (
  <option value={value} disabled={disabled}>
    {children || label}
  </option>
);

export const SelectGroup = ({ label, children }) => (
  <optgroup label={label}>
    {children}
  </optgroup>
);

export default Select;