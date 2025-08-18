const Loading = ({ 
  size = 'md', 
  color = 'red', 
  text = '', 
  fullScreen = false,
  overlay = false 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const colorClasses = {
    red: 'border-red-600',
    blue: 'border-blue-600',
    green: 'border-green-600',
    gray: 'border-gray-600',
  };

  const spinnerClasses = `animate-spin rounded-full border-2 border-gray-200 ${colorClasses[color]} ${sizeClasses[size]}`;

  const content = (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div 
        className={spinnerClasses}
        style={{ borderTopColor: 'transparent' }}
      />
      {text && (
        <p className="text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      {content}
    </div>
  );
};

export const LoadingSkeleton = ({ lines = 3, className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="mb-2">
          <div 
            className="h-4 bg-gray-200 rounded"
            style={{ 
              width: `${Math.random() * 40 + 60}%` 
            }}
          />
        </div>
      ))}
    </div>
  );
};

export const LoadingCard = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow border border-gray-200 p-6 animate-pulse ${className}`}>
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
        </div>
        <div className="flex space-x-4">
          <div className="h-8 bg-gray-200 rounded w-20" />
          <div className="h-8 bg-gray-200 rounded w-20" />
        </div>
      </div>
    </div>
  );
};

export const LoadingTable = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="px-6 py-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  <div 
                    className="h-4 bg-gray-200 rounded animate-pulse"
                    style={{ 
                      width: `${Math.random() * 40 + 60}%` 
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Loading;