import { Bell, Lock, Settings, Shield, Trash2, User } from 'lucide-react';
import { useState } from 'react';

const ProfileSettings = ({ onEditProfile, onChangePassword, onNotificationSettings }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const settingsOptions = [
    {
      id: 'edit-profile',
      title: 'Edit Profile',
      description: 'Update your personal information and profile details',
      icon: User,
      action: onEditProfile,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      id: 'change-password',
      title: 'Change Password',
      description: 'Update your password to keep your account secure',
      icon: Lock,
      action: onChangePassword,
      color: 'text-green-600 bg-green-100'
    },
    {
      id: 'notification-settings',
      title: 'Notification Settings',
      description: 'Manage how you receive notifications',
      icon: Bell,
      action: onNotificationSettings,
      color: 'text-yellow-600 bg-yellow-100'
    },
    {
      id: 'privacy-security',
      title: 'Privacy & Security',
      description: 'Manage your privacy settings and security preferences',
      icon: Shield,
      action: () => console.log('Privacy settings'),
      color: 'text-purple-600 bg-purple-100'
    }
  ];

  const handleDeleteAccount = () => {
    // This would typically call an API to delete the account
    console.log('Delete account requested');
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Settings className="w-6 h-6 text-gray-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
      </div>

      <div className="bg-white rounded-lg shadow-md divide-y">
        {settingsOptions.map((option) => {
          const IconComponent = option.icon;
          return (
            <div key={option.id} className="p-6 hover:bg-gray-50 transition-colors">
              <button
                onClick={option.action}
                className="w-full flex items-center text-left"
              >
                <div className={`p-3 rounded-full ${option.color} mr-4`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{option.title}</h3>
                  <p className="text-gray-600 mt-1">{option.description}</p>
                </div>
                <div className="text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-red-900 mb-4">Danger Zone</h3>
        <div className="border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <Trash2 className="w-5 h-5 text-red-600 mt-1 mr-3" />
            <div className="flex-1">
              <h4 className="font-medium text-red-900">Delete Account</h4>
              <p className="text-sm text-red-700 mt-1">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-red-900 mb-4">Confirm Account Deletion</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete your account? This action cannot be undone and will 
              permanently remove all your data from our system.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;