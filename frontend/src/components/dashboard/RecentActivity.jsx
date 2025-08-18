import {
    BeakerIcon,
    ClockIcon,
    DocumentTextIcon,
    HeartIcon,
    MegaphoneIcon,
    UserPlusIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { formatTimeAgo } from '../../utils/formatters';

const RecentActivity = () => {
  const { user } = useAuth();
  const { execute, loading } = useApi();
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      // This would be replaced with actual API calls to get recent activities
      // For now, using mock data
      const mockActivities = [
        {
          id: 1,
          type: 'blood_donation',
          title: 'Blood donation received',
          description: 'O+ blood type, 450ml collected',
          user: 'John Doe',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          icon: BeakerIcon,
          color: 'text-red-600',
          bgColor: 'bg-red-100'
        },
        {
          id: 2,
          type: 'donor_registration',
          title: 'New donor registered',
          description: 'Sarah Wilson joined as blood donor',
          user: 'System',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          icon: UserPlusIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        },
        {
          id: 3,
          type: 'blood_request',
          title: 'Urgent blood request',
          description: 'AB- blood needed at City Hospital',
          user: 'Dr. Smith',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          icon: DocumentTextIcon,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100'
        },
        {
          id: 4,
          type: 'campaign_created',
          title: 'New campaign launched',
          description: 'Monthly Blood Drive Campaign started',
          user: 'Admin',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
          icon: MegaphoneIcon,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        },
        {
          id: 5,
          type: 'blood_distributed',
          title: 'Blood unit distributed',
          description: 'A+ blood sent to General Hospital',
          user: 'System',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          icon: HeartIcon,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100'
        }
      ];

      setActivities(mockActivities);
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
    }
  };

  const getActivityLink = (activity) => {
    const linkMap = {
      blood_donation: '/inventory',
      donor_registration: '/donors',
      blood_request: '/requests',
      campaign_created: '/campaigns',
      blood_distributed: '/inventory'
    };
    return linkMap[activity.type] || '#';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <p className="text-sm text-gray-500 mt-1">Latest system activities</p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {activities.length === 0 ? (
          <div className="p-6 text-center">
            <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-500">No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = activity.icon;
            
            return (
              <Link
                key={activity.id}
                to={getActivityLink(activity)}
                className="block p-6 hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-10 h-10 ${activity.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${activity.color}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-500 mt-1">
                      {activity.description}
                    </p>
                    
                    {activity.user && (
                      <p className="text-xs text-gray-400 mt-1">
                        by {activity.user}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
      
      {activities.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <Link
            to="/activity"
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            View all activity →
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;