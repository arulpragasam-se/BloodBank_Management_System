import {
    CalendarIcon,
    ChartBarIcon,
    HeartIcon,
    UserCheckIcon,
    UserGroupIcon,
    UserPlusIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { getCampaignStats } from '../../services/campaignService';
import StatsCard from '../common/StatsCard';

const CampaignStats = ({ campaign }) => {
  const [stats, setStats] = useState(null);
  const { loading, execute } = useApi();

  const fetchStats = async () => {
    await execute(
      () => getCampaignStats(campaign._id),
      {
        onSuccess: (response) => {
          setStats(response.data.stats);
        },
      }
    );
  };

  useEffect(() => {
    if (campaign) {
      fetchStats();
    }
  }, [campaign]);

  if (loading || !stats) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-gray-200 h-32 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const performanceData = [
    {
      title: 'Registration Rate',
      value: `${stats.performance.registrationRate}%`,
      subtitle: `${stats.registration.totalRegistered} / ${stats.campaign.targetDonors || 'No target'}`,
      icon: UserPlusIcon,
      color: 'blue',
      trend: stats.performance.registrationRate >= 80 ? 'up' : 
             stats.performance.registrationRate >= 50 ? 'neutral' : 'down',
    },
    {
      title: 'Attendance Rate',
      value: `${stats.performance.attendanceRate}%`,
      subtitle: `${stats.registration.attended} attended`,
      icon: UserCheckIcon,
      color: 'green',
      trend: stats.performance.attendanceRate >= 80 ? 'up' : 
             stats.performance.attendanceRate >= 60 ? 'neutral' : 'down',
    },
    {
      title: 'Donation Rate',
      value: `${stats.performance.donationRate}%`,
      subtitle: `${stats.registration.donated} donated`,
      icon: HeartIcon,
      color: 'red',
      trend: stats.performance.donationRate >= 90 ? 'up' : 
             stats.performance.donationRate >= 70 ? 'neutral' : 'down',
    },
  ];

  const registrationData = [
    {
      title: 'Total Registered',
      value: stats.registration.totalRegistered,
      subtitle: 'participants',
      icon: UserGroupIcon,
      color: 'blue',
    },
    {
      title: 'Confirmed',
      value: stats.registration.confirmed,
      subtitle: 'confirmed attendance',
      icon: UserCheckIcon,
      color: 'green',
    },
    {
      title: 'Attended',
      value: stats.registration.attended,
      subtitle: 'actually attended',
      icon: CalendarIcon,
      color: 'purple',
    },
    {
      title: 'Donated',
      value: stats.registration.donated,
      subtitle: 'successful donations',
      icon: HeartIcon,
      color: 'red',
    },
    {
      title: 'Cancelled',
      value: stats.registration.cancelled,
      subtitle: 'cancelled registrations',
      icon: UserGroupIcon,
      color: 'gray',
    },
  ];

  const donationData = [
    {
      title: 'Total Donations',
      value: stats.donations.totalDonations,
      subtitle: 'blood donations',
      icon: HeartIcon,
      color: 'red',
    },
    {
      title: 'Successful Donations',
      value: stats.donations.successfulDonations,
      subtitle: 'passed screening',
      icon: UserCheckIcon,
      color: 'green',
    },
    {
      title: 'Units Collected',
      value: stats.donations.totalUnitsCollected,
      subtitle: 'blood units',
      icon: ChartBarIcon,
      color: 'blue',
    },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Performance Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Performance Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {performanceData.map((stat, index) => (
            <StatsCard
              key={index}
              {...stat}
            />
          ))}
        </div>
      </div>

      {/* Registration Statistics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Registration Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {registrationData.map((stat, index) => (
            <StatsCard
              key={index}
              {...stat}
            />
          ))}
        </div>
      </div>

      {/* Donation Statistics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Donation Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {donationData.map((stat, index) => (
            <StatsCard
              key={index}
              {...stat}
            />
          ))}
        </div>
      </div>

      {/* Blood Type Breakdown */}
      {stats.donations.unitsCollectedByType && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Blood Units Collected by Type
          </h3>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {Object.entries(stats.donations.unitsCollectedByType).map(([bloodType, units]) => (
                <div key={bloodType} className="text-center">
                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${
                    units > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <span className="font-bold text-sm">{bloodType}</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">{units}</div>
                  <div className="text-xs text-gray-500">units</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Campaign Info */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Campaign Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500">Campaign Title</p>
            <p className="font-medium text-gray-900">{stats.campaign.title}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium text-gray-900 capitalize">{stats.campaign.status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Start Date</p>
            <p className="font-medium text-gray-900">
              {new Date(stats.campaign.startDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Target Donors</p>
            <p className="font-medium text-gray-900">{stats.campaign.targetDonors || 'No target'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignStats;