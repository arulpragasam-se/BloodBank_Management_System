import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertsPanel from '../../components/dashboard/AlertsPanel';
import BloodInventoryChart from '../../components/dashboard/BloodInventoryChart';
import DashboardStats from '../../components/dashboard/DashboardStats';
import QuickActions from '../../components/dashboard/QuickActions';
import RecentActivity from '../../components/dashboard/RecentActivity';
import UpcomingCampaigns from '../../components/dashboard/UpcomingCampaigns';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../layouts/DashboardLayout';

const AdminDashboard = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasRole('admin')) {
      navigate('/unauthorized');
    }
  }, [hasRole, navigate]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {user?.name}. Here's what's happening with your blood bank.
          </p>
        </div>

        <DashboardStats />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <BloodInventoryChart />
            <RecentActivity />
          </div>
          
          <div className="space-y-8">
            <QuickActions />
            <AlertsPanel />
            <UpcomingCampaigns />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;