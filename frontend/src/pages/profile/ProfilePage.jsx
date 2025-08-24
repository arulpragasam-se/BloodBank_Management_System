import {
    ClockIcon,
    CogIcon,
    DocumentTextIcon,
    HeartIcon,
    LockClosedIcon,
    PencilIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import Loading from '../../components/common/Loading';
import ChangePassword from '../../components/profile/ChangePassword';
import EditProfile from '../../components/profile/EditProfile';
import ProfileSettings from '../../components/profile/ProfileSettings';
import UserProfile from '../../components/profile/UserProfile';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getProfile, updateProfile } from '../../services/authService';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { execute, loading } = useApi();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await execute(() => getProfile());
      if (response?.data) {
        setProfile(response.data.user);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const handleProfileUpdate = async (profileData) => {
    try {
      const response = await execute(() => updateProfile(profileData));
      if (response?.data) {
        setProfile(response.data.user);
        updateUser(response.data.user);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const getRoleTabs = () => {
    const baseTabs = [
      { id: 'overview', name: 'Overview', icon: UserCircleIcon },
      { id: 'security', name: 'Security', icon: LockClosedIcon },
      { id: 'settings', name: 'Settings', icon: CogIcon }
    ];

    const roleTabs = {
      donor: [
        { id: 'donations', name: 'Donation History', icon: HeartIcon },
        { id: 'eligibility', name: 'Eligibility Status', icon: DocumentTextIcon }
      ],
      recipient: [
        { id: 'transfusions', name: 'Transfusion History', icon: ClockIcon },
        { id: 'requests', name: 'Blood Requests', icon: DocumentTextIcon }
      ],
      hospital_staff: [
        { id: 'activity', name: 'Activity Log', icon: ClockIcon }
      ],
      admin: [
        { id: 'system', name: 'System Overview', icon: CogIcon }
      ]
    };

    return [
      ...baseTabs.slice(0, 1), // Overview first
      ...(roleTabs[user?.role] || []), // Role-specific tabs
      ...baseTabs.slice(1) // Security and Settings last
    ];
  };

  if (loading || !profile) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-96">
          <Loading />
        </div>
      </DashboardLayout>
    );
  }

  const tabs = getRoleTabs();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-red-600">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {profile.name}
                  </h1>
                  <p className="text-gray-600 mb-2">{profile.email}</p>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      profile.isActive 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {profile.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {profile.role.replace('_', ' ')}
                    </span>
                    {profile.bloodType && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {profile.bloodType}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {!isEditing && activeTab === 'overview' && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {profile.joinDate ? new Date(profile.joinDate).getFullYear() : new Date(profile.createdAt).getFullYear()}
                </div>
                <div className="text-sm text-gray-600">Member Since</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {profile.role === 'donor' ? (profile.totalDonations || 0) : 
                   profile.role === 'recipient' ? (profile.totalTransfusions || 0) : 
                   profile.role === 'hospital_staff' ? (profile.totalRequests || 0) : 
                   (profile.totalActions || 0)}
                </div>
                <div className="text-sm text-gray-600">
                  {profile.role === 'donor' ? 'Donations' : 
                   profile.role === 'recipient' ? 'Transfusions' : 
                   profile.role === 'hospital_staff' ? 'Requests' : 
                   'Actions'}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {profile.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : 'Today'}
                </div>
                <div className="text-sm text-gray-600">Last Login</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {profile.role === 'donor' ? ((profile.totalDonations || 0) * 3) : 
                   profile.role === 'recipient' ? 'N/A' : 
                   profile.role === 'hospital_staff' ? (profile.successfulRequests || 0) : 
                   (profile.systemUptime || '99.9%')}
                </div>
                <div className="text-sm text-gray-600">
                  {profile.role === 'donor' ? 'Lives Saved' : 
                   profile.role === 'recipient' ? 'Health Score' : 
                   profile.role === 'hospital_staff' ? 'Successful' : 
                   'Uptime'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsEditing(false);
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            isEditing ? (
              <EditProfile
                profile={profile}
                onSave={handleProfileUpdate}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <UserProfile profile={profile} />
            )
          )}

          {activeTab === 'donations' && profile.role === 'donor' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Donation History
              </h3>
              <div className="text-center py-8 text-gray-500">
                Donation history will be displayed here
              </div>
            </div>
          )}

          {activeTab === 'eligibility' && profile.role === 'donor' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Eligibility Status
              </h3>
              <div className="text-center py-4">
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium">
                  ✓ Eligible to Donate
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  You can donate again in 2 months
                </p>
              </div>
            </div>
          )}

          {activeTab === 'transfusions' && profile.role === 'recipient' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Transfusion History
              </h3>
              <div className="text-center py-8 text-gray-500">
                Transfusion history will be displayed here
              </div>
            </div>
          )}

          {activeTab === 'requests' && profile.role === 'recipient' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Blood Requests
              </h3>
              <div className="text-center py-8 text-gray-500">
                Blood requests will be displayed here
              </div>
            </div>
          )}

          {activeTab === 'activity' && profile.role === 'hospital_staff' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Activity Log
              </h3>
              <div className="text-center py-8 text-gray-500">
                Activity log will be displayed here
              </div>
            </div>
          )}

          {activeTab === 'system' && profile.role === 'admin' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                System Overview
              </h3>
              <div className="text-center py-8 text-gray-500">
                System overview will be displayed here
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <ChangePassword />
          )}

          {activeTab === 'settings' && (
            <ProfileSettings profile={profile} onUpdate={handleProfileUpdate} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;