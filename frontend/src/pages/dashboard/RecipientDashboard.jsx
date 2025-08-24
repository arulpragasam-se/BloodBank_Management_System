import { ClockIcon, DocumentTextIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardStats from '../../components/dashboard/DashboardStats';
import RecentActivity from '../../components/dashboard/RecentActivity';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../layouts/DashboardLayout';

const RecipientDashboard = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasRole('recipient')) {
      navigate('/unauthorized');
    }
  }, [hasRole, navigate]);

  const recipientActions = [
    {
      title: 'My Requests',
      description: 'View your blood requests',
      icon: DocumentTextIcon,
      action: () => navigate('/requests/my-requests'),
      color: 'blue'
    },
    {
      title: 'My Profile',
      description: 'Update your recipient information',
      icon: UserCircleIcon,
      action: () => navigate('/profile'),
      color: 'green'
    },
    {
      title: 'Transfusion History',
      description: 'View your transfusion history',
      icon: ClockIcon,
      action: () => navigate('/recipients/my-history'),
      color: 'purple'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Recipient Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {user?.name}. Manage your blood requests and health information.
          </p>
        </div>

        <DashboardStats />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recipientActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-${action.color}-500 hover:bg-${action.color}-50 transition-colors group`}
                  >
                    <action.icon className={`h-8 w-8 text-gray-400 group-hover:text-${action.color}-500 mx-auto mb-2`} />
                    <h4 className="font-medium text-gray-900">{action.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                  </button>
                ))}
              </div>
            </div>
            <RecentActivity />
          </div>
          
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Blood Type
              </h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {user?.bloodType || 'A+'}
                </div>
                <p className="text-sm text-gray-500">
                  Your blood type
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Requests
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">2 units A+</p>
                    <p className="text-sm text-gray-500">Pending approval</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">1 unit A+</p>
                    <p className="text-sm text-gray-500">Fulfilled 2 days ago</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Fulfilled
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RecipientDashboard;