import { useEffect, useState } from 'react';
import { notificationService } from '../../services/notificationService';
import Loading from '../common/Loading';
import Pagination from '../common/Pagination';
import Toast from '../common/Toast';
import NotificationItem from './NotificationItem';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, type: filter !== 'all' ? filter : undefined };
      const response = await notificationService.getUserNotifications(params);
      
      if (response.success) {
        setNotifications(response.data.notifications);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, channels: { ...notif.channels, inApp: { ...notif.channels.inApp, read: true } }}
            : notif
        )
      );
    } catch (err) {
      setError(err.message || 'Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({
          ...notif,
          channels: { ...notif.channels, inApp: { ...notif.channels.inApp, read: true }}
        }))
      );
    } catch (err) {
      setError(err.message || 'Failed to mark all notifications as read');
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Notifications' },
    { value: 'appointment_reminder', label: 'Appointment Reminders' },
    { value: 'campaign_invitation', label: 'Campaign Invitations' },
    { value: 'blood_request', label: 'Blood Requests' },
    { value: 'low_stock_alert', label: 'Low Stock Alerts' },
    { value: 'expiry_alert', label: 'Expiry Alerts' },
    { value: 'emergency_request', label: 'Emergency Requests' }
  ];

  const unreadCount = notifications.filter(notif => !notif.channels?.inApp?.read).length;

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {error && <Toast type="error" message={error} onClose={() => setError('')} />}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔔</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
          <p className="text-gray-600">You're all caught up! No new notifications to show.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
            />
          ))}
          
          <Pagination
            currentPage={pagination.current}
            totalPages={pagination.pages}
            onPageChange={fetchNotifications}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationList;