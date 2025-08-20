import { Bell, Mail, Phone, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { notificationService } from '../../services/notificationService';
import Loading from '../common/Loading';
import Toast from '../common/Toast';

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    inAppNotifications: true,
    preferences: {
      appointment_reminder: { email: true, sms: true, inApp: true },
      campaign_invitation: { email: true, sms: false, inApp: true },
      blood_request: { email: true, sms: true, inApp: true },
      low_stock_alert: { email: true, sms: false, inApp: true },
      expiry_alert: { email: true, sms: false, inApp: true },
      emergency_request: { email: true, sms: true, inApp: true }
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotificationSettings();
      
      if (response.success) {
        setSettings(response.data.settings || settings);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleGlobalToggle = (channel, enabled) => {
    setSettings(prev => ({ ...prev, [`${channel}Notifications`]: enabled }));
  };

  const handlePreferenceToggle = (notificationType, channel, enabled) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [notificationType]: {
          ...prev.preferences[notificationType],
          [channel]: enabled
        }
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      
      const response = await notificationService.updateNotificationSettings(settings);
      
      if (response.success) {
        setSuccess('Notification settings updated successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const notificationTypes = [
    { key: 'appointment_reminder', label: 'Appointment Reminders' },
    { key: 'campaign_invitation', label: 'Campaign Invitations' },
    { key: 'blood_request', label: 'Blood Requests' },
    { key: 'low_stock_alert', label: 'Low Stock Alerts' },
    { key: 'expiry_alert', label: 'Expiry Alerts' },
    { key: 'emergency_request', label: 'Emergency Requests' }
  ];

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {error && <Toast type="error" message={error} onClose={() => setError('')} />}
      {success && <Toast type="success" message={success} onClose={() => setSuccess('')} />}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <Settings className="w-6 h-6 text-gray-600 mr-2" />
          <h2 className="text-xl font-semibold">Notification Settings</h2>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Global Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Bell className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="font-medium">In-App Notifications</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.inAppNotifications}
                    onChange={(e) => handleGlobalToggle('inApp', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-green-600 mr-3" />
                  <span className="font-medium">Email Notifications</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleGlobalToggle('email', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-orange-600 mr-3" />
                  <span className="font-medium">SMS Notifications</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.smsNotifications}
                    onChange={(e) => handleGlobalToggle('sms', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              {notificationTypes.map((type) => (
                <div key={type.key} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">{type.label}</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.preferences[type.key]?.inApp ?? true}
                        onChange={(e) => handlePreferenceToggle(type.key, 'inApp', e.target.checked)}
                        className="mr-2"
                        disabled={!settings.inAppNotifications}
                      />
                      <Bell className="w-4 h-4 mr-1" />
                      In-App
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.preferences[type.key]?.email ?? true}
                        onChange={(e) => handlePreferenceToggle(type.key, 'email', e.target.checked)}
                        className="mr-2"
                        disabled={!settings.emailNotifications}
                      />
                      <Mail className="w-4 h-4 mr-1" />
                      Email
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.preferences[type.key]?.sms ?? false}
                        onChange={(e) => handlePreferenceToggle(type.key, 'sms', e.target.checked)}
                        className="mr-2"
                        disabled={!settings.smsNotifications}
                      />
                      <Phone className="w-4 h-4 mr-1" />
                      SMS
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;