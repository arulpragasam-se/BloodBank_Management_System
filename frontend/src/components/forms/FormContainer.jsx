import { forwardRef } from 'react';

const FormContainer = forwardRef(({
  onSubmit,
  children,
  className = '',
  title,
  subtitle,
  footer,
  loading = false,
  ...props
}, ref) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit && !loading) {
      onSubmit(e);
    }
  };

  return (
    <div className={`bg-white shadow rounded-lg ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-200">
          {title && (
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
          )}
        </div>
      )}

      <form
        ref={ref}
        onSubmit={handleSubmit}
        noValidate
        className="px-6 py-4"
        {...props}
      >
        <fieldset disabled={loading} className="space-y-6">
          {children}
        </fieldset>
      </form>

      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  );
});

FormContainer.displayName = 'FormContainer';

export const FormSection = ({ title, subtitle, children, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {(title || subtitle) && (
      <div className="border-b border-gray-200 pb-2">
        {title && (
          <h3 className="text-md font-medium text-gray-900">{title}</h3>
        )}
        {subtitle && (
          <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
        )}
      </div>
    )}
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

export const FormRow = ({ children, className = '' }) => (
  <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${className}`}>
    {children}
  </div>
);

export const FormActions = ({ 
  children, 
  align = 'right', 
  className = '',
  sticky = false 
}) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div 
      className={`
        flex items-center space-x-3 pt-6 border-t border-gray-200
        ${alignClasses[align]}
        ${sticky ? 'sticky bottom-0 bg-white z-10 py-4' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export const FormGrid = ({ 
  children, 
  columns = 1, 
  gap = 4, 
  className = '' 
}) => {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const gapClasses = {
    2: 'gap-2',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
  };

  return (
    <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

export default FormContainer;