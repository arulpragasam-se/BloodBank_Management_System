import { BellIcon, FunnelIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FilterDropdown from '../../components/common/FilterDropdown';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';
import NotificationList from '../../components/notifications/NotificationList';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { usePagination } from '../../hooks/usePagination';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getAllNotifications, markAllAsRead } from '../../services/notificationService';

const NotificationsPage = () => {
  const { user, hasPermission } = useAuth();
  const { execute, loading } = useApi();
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    priority: '',
    channel: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    sent: 0,
    failed: 0
  });

  const {
    currentPage,
    totalPages,
    totalItems,
    handlePageChange,
    updatePagination
  } = usePagination();

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'appointment_reminder', label: 'Appointment Reminder' },
    { value: 'eligibility_update', label: 'Eligibility Update' },
    { value: 'campaign_invitation', label: 'Campaign Invitation' },
    { value: 'blood_request', label: 'Blood Request' },
    { value: 'low_stock_alert', label: 'Low Stock Alert' },
    { value: 'expiry_alert', label: 'Expiry Alert' },
    { value: 'donation_thanks', label: 'Donation Thanks' },
    { value: 'test_results', label: 'Test Results' },
    { value: 'emergency_request', label: 'Emergency Request' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'read', label: 'Read' },
    { value: 'unread', label: 'Unread' },
    { value: 'sent', label: 'Sent' },
    { value: 'failed', label: 'Failed' }
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const channelOptions = [
    { value: '', label: 'All Channels' },
    { value: 'in_app', label: 'In-App' },
    { value: 'sms', label: 'SMS' },
    { value: 'email', label: 'Email' }
  ];

  useEffect(() => {
    fetchNotifications();
  }, [currentPage, searchTerm, filters]);

  const fetchNotifications = async () => {
    try {
      const queryParams = {
        page: currentPage,
        limit: 15,
        search: searchTerm,
        ...filters
      };

      const response = await execute(() => getAllNotifications(queryParams));
      
      if (response?.data) {
        setNotifications(response.data.notifications || []);
        setStats(response.data.stats || stats);
        updatePagination(
          response.data.pagination?.total || 0,
          Math.ceil((response.data.pagination?.total || 0) / 15)
        );
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    handlePageChange(1);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    handlePageChange(1);
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      status: '',
      priority: '',
      channel: ''
    });
    setSearchTerm('');
    handlePageChange(1);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await execute(() => markAllAsRead());
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="mt-2 text-gray-600">
              Manage system notifications and communication history
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {stats.unread > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
              >
                Mark All Read
              </button>
            )}
            
            {hasPermission('send_notifications') && (
              <Link
                to="/notifications/send"
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Send Notification
              </Link>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BellIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <div className="w-6 h-6 text-yellow-600">🔔</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unread}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <div className="w-6 h-6 text-green-600">✅</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sent Successfully</p>
                <p className="text-2xl font-bold text-gray-900">{stats.sent}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <div className="w-6 h-6 text-red-600">❌</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {hasPermission('send_bulk_notifications') && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/notifications/send?type=emergency"
                className="p-4 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <div className="text-red-600 font-semibold mb-2">🚨 Emergency Alert</div>
                <p className="text-sm text-gray-600">Send urgent notifications to all eligible donors</p>
              </Link>
              
              <Link
                to="/notifications/send?type=campaign"
                className="p-4 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <div className="text-blue-600 font-semibold mb-2">📢 Campaign Invitation</div>
                <p className="text-sm text-gray-600">Invite donors to upcoming blood campaigns</p>
              </Link>
              
              <Link
                to="/notifications/send?type=reminder"
                className="p-4 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <div className="text-green-600 font-semibold mb-2">⏰ Appointment Reminder</div>
                <p className="text-sm text-gray-600">Send reminders for scheduled appointments</p>
              </Link>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <SearchBar
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={handleSearch}
                icon={MagnifyingGlassIcon}
              />
            </div>
            
            <FilterDropdown
              label="Type"
              options={typeOptions}
              value={filters.type}
              onChange={(value) => handleFilterChange('type', value)}
            />
            
            <FilterDropdown
              label="Status"
              options={statusOptions}
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
            />
            
            <FilterDropdown
              label="Priority"
              options={priorityOptions}
              value={filters.priority}
              onChange={(value) => handleFilterChange('priority', value)}
            />
            
            <FilterDropdown
              label="Channel"
              options={channelOptions}
              value={filters.channel}
              onChange={(value) => handleFilterChange('channel', value)}
            />
          </div>
          
          {(searchTerm || Object.values(filters).some(f => f)) && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {totalItems} notifications found
              </span>
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Notification Types Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Notification Types Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-lg font-bold text-red-600">42</div>
              <div className="text-sm text-red-600">Emergency</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">156</div>
              <div className="text-sm text-blue-600">Campaign</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">89</div>
              <div className="text-sm text-green-600">Reminders</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-lg font-bold text-yellow-600">67</div>
              <div className="text-sm text-yellow-600">Alerts</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">234</div>
              <div className="text-sm text-purple-600">General</div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8">
              <Loading />
            </div>
          ) : notifications.length > 0 ? (
            <>
              <NotificationList 
                notifications={notifications} 
                onUpdate={fetchNotifications}
              />
              
              {totalPages > 1 && (
                <div className="border-t border-gray-200 px-6 py-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FunnelIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No notifications found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || Object.values(filters).some(f => f)
                  ? "Try adjusting your search or filters"
                  : "There are no notifications yet"
                }
              </p>
              {hasPermission('send_notifications') && (
                <Link
                  to="/notifications/send"
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Send First Notification
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;