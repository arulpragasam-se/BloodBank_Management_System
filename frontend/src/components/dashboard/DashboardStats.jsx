import {
    BeakerIcon,
    ChartBarIcon,
    CheckCircleIcon,
    DocumentTextIcon,
    HeartIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { getAllCampaigns } from '../../services/campaignService';
import { getAllDonors } from '../../services/donorService';
import { getInventoryStats } from '../../services/inventoryService';
import { getAllRequests } from '../../services/requestService';
import StatsCard from '../common/StatsCard';

const DashboardStats = () => {
  const { user } = useAuth();
  const { execute, loading } = useApi();
  const [stats, setStats] = useState({
    donors: { total: 0, eligible: 0, trend: 'neutral' },
    inventory: { total: 0, expiring: 0, lowStock: 0 },
    requests: { pending: 0, urgent: 0, fulfilled: 0 },
    campaigns: { active: 0, upcoming: 0, completed: 0 }
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [donorsRes, inventoryRes, requestsRes, campaignsRes] = await Promise.all([
        execute(() => getAllDonors({ limit: 1 }), { showLoading: false }),
        execute(() => getInventoryStats(), { showLoading: false }),
        execute(() => getAllRequests({ limit: 1 }), { showLoading: false }),
        execute(() => getAllCampaigns({ limit: 1 }), { showLoading: false })
      ]);

      setStats({
        donors: {
          total: donorsRes?.data?.pagination?.total || 0,
          eligible: donorsRes?.data?.donors?.filter(d => d.isEligible)?.length || 0,
          trend: 'up'
        },
        inventory: {
          total: inventoryRes?.data?.stats?.totalUnits || 0,
          expiring: inventoryRes?.data?.stats?.expiringIn7Days || 0,
          lowStock: inventoryRes?.data?.stats?.lowStockItems || 0
        },
        requests: {
          pending: requestsRes?.data?.pagination?.total || 0,
          urgent: requestsRes?.data?.requests?.filter(r => r.urgencyLevel === 'critical')?.length || 0,
          fulfilled: requestsRes?.data?.requests?.filter(r => r.status === 'fulfilled')?.length || 0
        },
        campaigns: {
          active: campaignsRes?.data?.campaigns?.filter(c => c.status === 'active')?.length || 0,
          upcoming: campaignsRes?.data?.campaigns?.filter(c => c.status === 'planned')?.length || 0,
          completed: campaignsRes?.data?.campaigns?.filter(c => c.status === 'completed')?.length || 0
        }
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  };

  const getStatsForRole = () => {
    const baseStats = [
      {
        title: 'Total Blood Units',
        value: stats.inventory.total,
        subtitle: `${stats.inventory.expiring} expiring soon`,
        icon: BeakerIcon,
        color: 'blue',
        trend: stats.inventory.total > 100 ? 'up' : 'down',
        trendValue: `${stats.inventory.lowStock} low stock`
      },
      {
        title: 'Active Campaigns',
        value: stats.campaigns.active,
        subtitle: `${stats.campaigns.upcoming} upcoming`,
        icon: ChartBarIcon,
        color: 'green',
        trend: 'up',
        trendValue: `${stats.campaigns.completed} completed`
      }
    ];

    if (user?.role === 'admin' || user?.role === 'hospital_staff') {
      return [
        {
          title: 'Total Donors',
          value: stats.donors.total,
          subtitle: `${stats.donors.eligible} eligible`,
          icon: UserGroupIcon,
          color: 'red',
          trend: 'up',
          trendValue: '+12% this month'
        },
        ...baseStats,
        {
          title: 'Blood Requests',
          value: stats.requests.pending,
          subtitle: `${stats.requests.urgent} urgent`,
          icon: DocumentTextIcon,
          color: stats.requests.urgent > 0 ? 'yellow' : 'gray',
          trend: stats.requests.urgent > 0 ? 'up' : 'neutral',
          trendValue: `${stats.requests.fulfilled} fulfilled`
        }
      ];
    }

    if (user?.role === 'donor') {
      return [
        ...baseStats,
        {
          title: 'My Donations',
          value: 5, // This would come from user's donation history
          subtitle: 'Last: 2 months ago',
          icon: HeartIcon,
          color: 'red',
          trend: 'up',
          trendValue: 'Eligible to donate'
        },
        {
          title: 'Lives Saved',
          value: 15, // Estimated based on donations
          subtitle: 'Through my donations',
          icon: CheckCircleIcon,
          color: 'green',
          trend: 'up',
          trendValue: '3 lives per donation'
        }
      ];
    }

    if (user?.role === 'recipient') {
      return [
        ...baseStats,
        {
          title: 'My Requests',
          value: 3, // User's blood requests
          subtitle: '1 pending',
          icon: DocumentTextIcon,
          color: 'blue',
          trend: 'neutral',
          trendValue: '2 fulfilled'
        },
        {
          title: 'Transfusions',
          value: 8, // User's transfusion history
          subtitle: 'Total received',
          icon: HeartIcon,
          color: 'purple',
          trend: 'up',
          trendValue: 'Last: 6 months ago'
        }
      ];
    }

    return baseStats;
  };

  const statsToShow = getStatsForRole();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsToShow.map((stat, index) => (
        <StatsCard
          key={index}
          title={stat.title}
          value={stat.value}
          subtitle={stat.subtitle}
          icon={stat.icon}
          color={stat.color}
          trend={stat.trend}
          trendValue={stat.trendValue}
          loading={loading}
        />
      ))}
    </div>
  );
};

export default DashboardStats;