import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { forwardRef, useState } from 'react';

const Input = forwardRef(({
  label,
  type = 'text',
  placeholder,
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
  autoComplete,
  autoFocus = false,
  size = 'md',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  leftElement,
  rightElement,
  className = '',
  inputClassName = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const inputId = id || name;
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const baseClasses = `
    block w-full rounded-md border-gray-300 shadow-sm
    focus:border-red-500 focus:ring-red-500
    disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
    read-only:bg-gray-50 read-only:text-gray-500
    ${sizeClasses[size]}
    ${error ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : ''}
    ${(LeftIcon || leftElement) ? 'pl-10' : ''}
    ${(RightIcon || rightElement || isPassword) ? 'pr-10' : ''}
    ${inputClassName}
  `;

  const handleFocus = (e) => {
    setFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setFocused(false);
    if (onBlur) onBlur(e);
  };

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
        {/* Left icon or element */}
        {(LeftIcon || leftElement) && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {LeftIcon ? (
              <LeftIcon className={`h-5 w-5 ${error ? 'text-red-400' : 'text-gray-400'}`} />
            ) : (
              leftElement
            )}
          </div>
        )}

        {/* Input field */}
        <input
          ref={ref}
          type={inputType}
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={baseClasses}
          {...props}
        />

        {/* Right icon, element, or password toggle */}
        {(RightIcon || rightElement || isPassword) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {isPassword ? (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            ) : RightIcon ? (
              <RightIcon className={`h-5 w-5 ${error ? 'text-red-400' : 'text-gray-400'}`} />
            ) : (
              rightElement
            )}
          </div>
        )}
      </div>

      {/* Helper text or error message */}
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

Input.displayName = 'Input';

export default Input;