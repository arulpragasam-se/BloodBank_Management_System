import {
    ArrowDownIcon,
    ArrowUpIcon,
    MinusIcon
} from '@heroicons/react/24/outline';

const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = 'red',
  loading = false,
  onClick,
  className = '',
}) => {
  const colorClasses = {
    red: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      accent: 'border-red-200',
    },
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      accent: 'border-blue-200',
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      accent: 'border-green-200',
    },
    yellow: {
      bg: 'bg-yellow-50',
      icon: 'text-yellow-600',
      accent: 'border-yellow-200',
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      accent: 'border-purple-200',
    },
    gray: {
      bg: 'bg-gray-50',
      icon: 'text-gray-600',
      accent: 'border-gray-200',
    },
  };

  const colors = colorClasses[color];

  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend) {
      case 'up':
        return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
      case 'neutral':
        return <MinusIcon className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'neutral':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow border border-gray-200 p-6 animate-pulse ${className}`}>
        <div className="flex items-center">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-16 mb-1" />
            <div className="h-3 bg-gray-200 rounded w-20" />
          </div>
          <div className={`p-3 rounded-lg ${colors.bg}`}>
            <div className="h-6 w-6 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const CardContent = () => (
    <div className="flex items-center">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        
        {(subtitle || trend) && (
          <div className="flex items-center space-x-2">
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
            
            {trend && (
              <div className={`flex items-center space-x-1 text-sm ${getTrendColor()}`}>
                {getTrendIcon()}
                {trendValue && <span>{trendValue}</span>}
              </div>
            )}
          </div>
        )}
      </div>
      
      {Icon && (
        <div className={`p-3 rounded-lg ${colors.bg} ${colors.accent} border`}>
          <Icon className={`h-6 w-6 ${colors.icon}`} />
        </div>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
       className={`w-full bg-white rounded-lg shadow border border-gray-200 p-6 text-left hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${className}`}
     >
       <CardContent />
     </button>
   );
 }

 return (
   <div className={`bg-white rounded-lg shadow border border-gray-200 p-6 ${className}`}>
     <CardContent />
   </div>
 );
};

export default StatsCard;