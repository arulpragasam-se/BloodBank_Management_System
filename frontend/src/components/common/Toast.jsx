import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

const Toast = ({
  id,
  type = 'info',
  title,
  message,
  duration = 5000,
  onClose,
  position = 'top-right',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const typeConfig = {
    success: {
      icon: CheckCircleIcon,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-400',
    },
    error: {
      icon: XCircleIcon,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-400',
    },
    warning: {
      icon: ExclamationTriangleIcon,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-400',
    },
    info: {
      icon: InformationCircleIcon,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-400',
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };

  useEffect(() => {
    setIsVisible(true);

    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  return (
    <div
      className={`fixed z-50 max-w-sm w-full transform transition-all duration-300 ease-in-out ${
        positionClasses[position]
      } ${
        isVisible && !isLeaving
          ? 'translate-y-0 opacity-100 scale-100'
          : 'translate-y-2 opacity-0 scale-95'
      }`}
    >
      <div
        className={`rounded-lg border p-4 shadow-lg ${config.bgColor} ${config.borderColor}`}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 ${config.iconColor}`} />
          </div>
          
          <div className="ml-3 flex-1">
            {title && (
              <h3 className={`text-sm font-medium ${config.textColor}`}>
                {title}
              </h3>
            )}
            {message && (
              <div className={`text-sm ${config.textColor} ${title ? 'mt-1' : ''}`}>
                {message}
              </div>
            )}
          </div>
          
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className={`inline-flex rounded-md ${config.bgColor} ${config.textColor} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600`}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ToastContainer = ({ toasts = [], onRemove, position = 'top-right' }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          position={position}
          onClose={onRemove}
        />
      ))}
    </div>
  );
};

export default Toast;