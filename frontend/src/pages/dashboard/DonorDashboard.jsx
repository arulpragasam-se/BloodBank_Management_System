import { CalendarIcon, HeartIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardStats from '../../components/dashboard/DashboardStats';
import RecentActivity from '../../components/dashboard/RecentActivity';
import UpcomingCampaigns from '../../components/dashboard/UpcomingCampaigns';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../layouts/DashboardLayout';

const DonorDashboard = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasRole('donor')) {
      navigate('/unauthorized');
    }
  }, [hasRole, navigate]);

  const donorActions = [
    {
      title: 'Find Campaigns',
      description: 'Browse available blood donation campaigns',
      icon: CalendarIcon,
      action: () => navigate('/campaigns'),
      color: 'red'
    },
    {
      title: 'My Profile',
      description: 'Update your donor information',
      icon: UserCircleIcon,
      action: () => navigate('/profile'),
      color: 'blue'
    },
    {
      title: 'Donation History',
      description: 'View your donation history',
      icon: HeartIcon,
      action: () => navigate('/donors/my-history'),
      color: 'green'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Donor Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {user?.name}. Thank you for being a life saver!
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
                {donorActions.map((action, index) => (
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
            <UpcomingCampaigns />
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Eligibility Status
              </h3>
              <div className="text-center">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Eligible to Donate
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  You can donate again in 2 months
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DonorDashboard;