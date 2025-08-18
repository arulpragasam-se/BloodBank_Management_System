import { forwardRef } from 'react';

const TextArea = forwardRef(({
  label,
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
  rows = 4,
  cols,
  resize = 'vertical',
  maxLength,
  showCharCount = false,
  autoFocus = false,
  className = '',
  textareaClassName = '',
  ...props
}, ref) => {
  const textareaId = id || name;
  const charCount = value ? value.length : 0;
  const isOverLimit = maxLength && charCount > maxLength;

  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize',
  };

  const baseClasses = `
    block w-full rounded-md border-gray-300 shadow-sm
    focus:border-red-500 focus:ring-red-500
    disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
    read-only:bg-gray-50 read-only:text-gray-500
    px-3 py-2 text-sm
    ${resizeClasses[resize]}
    ${error ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : ''}
    ${textareaClassName}
  `;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label
          htmlFor={textareaId}
          className={`form-label ${required ? 'form-label-required' : ''}`}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <textarea
          ref={ref}
          id={textareaId}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          rows={rows}
          cols={cols}
          maxLength={maxLength}
          autoFocus={autoFocus}
          className={baseClasses}
          {...props}
        />

        {(showCharCount && maxLength) && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white px-1">
            <span className={isOverLimit ? 'text-red-500' : ''}>
              {charCount}/{maxLength}
            </span>
          </div>
        )}
      </div>

      {(error || helperText || (showCharCount && !maxLength)) && (
        <div className="mt-1 flex justify-between">
          <div>
            {error ? (
              <p className="form-error">{error}</p>
            ) : helperText ? (
              <p className="form-help">{helperText}</p>
            ) : null}
          </div>
          
          {(showCharCount && !maxLength) && (
            <p className="text-xs text-gray-400">
              {charCount} characters
            </p>
          )}
        </div>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

export default TextArea;