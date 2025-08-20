import { AlertTriangle, Bell, Calendar, Droplet, Heart, Mail, Phone, TestTube } from 'lucide-react';
import { useState } from 'react';

const NotificationItem = ({ notification, onMarkAsRead }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getNotificationIcon = (type) => {
    const icons = {
      appointment_reminder: Calendar,
      eligibility_update: Heart,
      campaign_invitation: Bell,
      blood_request: Droplet,
      low_stock_alert: AlertTriangle,
      expiry_alert: AlertTriangle,
      donation_thanks: Heart,
      test_results: TestTube,
      emergency_request: AlertTriangle
    };
    return icons[type] || Bell;
  };

  const getNotificationColor = (type) => {
    const colors = {
      appointment_reminder: 'text-blue-600 bg-blue-100',
      eligibility_update: 'text-green-600 bg-green-100',
      campaign_invitation: 'text-purple-600 bg-purple-100',
      blood_request: 'text-red-600 bg-red-100',
      low_stock_alert: 'text-orange-600 bg-orange-100',
      expiry_alert: 'text-orange-600 bg-orange-100',
      donation_thanks: 'text-pink-600 bg-pink-100',
      test_results: 'text-indigo-600 bg-indigo-100',
      emergency_request: 'text-red-600 bg-red-100'
    };
    return colors[type] || 'text-gray-600 bg-gray-100';
  };

  const handleMarkAsRead = () => {
    if (!notification.channels?.inApp?.read) {
      onMarkAsRead(notification._id);
    }
  };

  const IconComponent = getNotificationIcon(notification.type);
  const isUnread = !notification.channels?.inApp?.read;

  return (
    <div 
      className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
        isUnread ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start space-x-4">
        <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
          <IconComponent className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={`text-sm font-medium ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                {notification.title}
              </h3>
              <p className={`text-sm mt-1 ${isUnread ? 'text-gray-800' : 'text-gray-600'}`}>
                {notification.message}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              {isUnread && (
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              )}
              <span className="text-xs text-gray-500">
                {new Date(notification.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              {notification.channels?.sms?.sent && (
                <div className="flex items-center">
                  <Phone className="w-3 h-3 mr-1" />
                  <span>SMS</span>
                </div>
              )}
              {notification.channels?.email?.sent && (
                <div className="flex items-center">
                  <Mail className="w-3 h-3 mr-1" />
                  <span>Email</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {notification.data && Object.keys(notification.data).length > 0 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {isExpanded ? 'Show Less' : 'Show Details'}
                </button>
              )}
              
              {isUnread && (
                <button
                  onClick={handleMarkAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Mark as Read
                </button>
              )}
            </div>
          </div>
          
          {isExpanded && notification.data && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <h4 className="text-xs font-medium text-gray-700 mb-2">Details:</h4>
              <div className="space-y-1 text-xs text-gray-600">
                {notification.data.campaignId && (
                  <div>Campaign ID: {notification.data.campaignId}</div>
                )}
                {notification.data.donationId && (
                  <div>Donation ID: {notification.data.donationId}</div>
                )}
                {notification.data.requestId && (
                  <div>Request ID: {notification.data.requestId}</div>
                )}
                {notification.data.inventoryId && (
                  <div>Inventory ID: {notification.data.inventoryId}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;