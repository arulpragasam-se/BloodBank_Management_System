import { BellIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../../hooks/useNotifications';
import { formatTimeAgo } from '../../utils/formatters';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    fetchNotifications, 
    fetchUnreadCount,
    markNotificationAsRead 
  } = useNotification();

  useEffect(() => {
    fetchUnreadCount();
    // Fetch unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications({ limit: 5 });
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification['channels.inApp.read']) {
      await markNotificationAsRead(notification._id);
    }
    setIsOpen(false);
  };

  const getNotificationIcon = (type) => {
    const icons = {
      appointment_reminder: '📅',
      eligibility_update: '✅',
      campaign_invitation: '📢',
      blood_request: '🩸',
      low_stock_alert: '⚠️',
      expiry_alert: '⏰',
      donation_thanks: '🙏',
      test_results: '🧪',
      emergency_request: '🚨',
    };
    return icons[type] || '📋';
  };

  const truncateMessage = (message, maxLength = 60) => {
    return message.length > maxLength 
      ? message.substring(0, maxLength) + '...'
      : message;
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        <BellIcon className="h-6 w-6" />
        
        {/* Notification badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 flex items-center justify-center">
            <span className="text-xs font-medium text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-sm text-red-600 font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <BellIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                      !notification['channels.inApp.read'] ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-lg flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </span>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium text-gray-900 ${
                          !notification['channels.inApp.read'] ? 'font-semibold' : ''
                        }`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {truncateMessage(notification.message)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>

                      {!notification['channels.inApp.read'] && (
                        <div className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;