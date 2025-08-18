import {
    CalendarIcon,
    ChartBarIcon,
    ClockIcon,
    HeartIcon,
    TrendingUpIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useNotification } from '../../hooks/useNotifications';
import { getDonorStats } from '../../services/donorService';
import { formatDate, formatNumber } from '../../utils/formatters';
import Loading from '../common/Loading';
import StatsCard from '../common/StatsCard';

const DonorStats = ({ donorId, className = '' }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useNotification();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getDonorStats(donorId);
        if (response.success) {
          setStats(response.data.stats);
        }
      } catch (error) {
        showError(error.message || 'Failed to fetch donor statistics');
      } finally {
        setLoading(false);
      }
    };

    if (donorId) {
      fetchStats();
    }
  }, [donorId, showError]);

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Loading key={index} />
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">No statistics available</p>
      </div>
    );
  }

  const calculateLivesSaved = (donations) => {
    // Assuming each donation can save up to 3 lives
    return donations * 3;
  };

  const getContributionLevel = (totalDonations) => {
    if (totalDonations >= 50) return { level: 'Platinum', color: 'purple' };
    if (totalDonations >= 25) return { level: 'Gold', color: 'yellow' };
    if (totalDonations >= 10) return { level: 'Silver', color: 'gray' };
    if (totalDonations >= 5) return { level: 'Bronze', color: 'yellow' };
    return { level: 'New Donor', color: 'blue' };
  };

  const contributionLevel = getContributionLevel(stats.donationStats.totalDonations);
  const livesSaved = calculateLivesSaved(stats.donationStats.totalDonations);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Donations"
          value={formatNumber(stats.donationStats.totalDonations)}
          subtitle="Lifetime contributions"
          icon={HeartIcon}
          color="red"
        />

        <StatsCard
          title="Successful Donations"
          value={formatNumber(stats.donationStats.successfulDonations)}
          subtitle={`${stats.donationStats.totalDonations > 0 ? Math.round((stats.donationStats.successfulDonations / stats.donationStats.totalDonations) * 100) : 0}% success rate`}
          icon={CheckCircleIcon}
          color="green"
        />

        <StatsCard
          title="Blood Units Donated"
          value={formatNumber(stats.donationStats.totalUnitsContributed)}
          subtitle="Total units contributed"
          icon={UserGroupIcon}
          color="blue"
        />

        <StatsCard
          title="Lives Potentially Saved"
          value={formatNumber(livesSaved)}
          subtitle="Estimated impact"
          icon={TrendingUpIcon}
          color="purple"
        />
      </div>

      {/* Personal Information & Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Age"
          value={`${stats.personalInfo.age} years`}
          subtitle={stats.personalInfo.bloodType}
          icon={UserGroupIcon}
          color="gray"
        />

        <StatsCard
          title="Weight"
          value={`${stats.personalInfo.weight} kg`}
          subtitle="Current weight"
          icon={ChartBarIcon}
          color="blue"
        />

        <StatsCard
          title="Eligibility Status"
          value={stats.personalInfo.isEligible ? "Eligible" : "Not Eligible"}
          subtitle={stats.personalInfo.isEligible ? "Ready to donate" : "Check requirements"}
          icon={stats.personalInfo.isEligible ? CheckCircleIcon : XCircleIcon}
          color={stats.personalInfo.isEligible ? "green" : "red"}
        />

        <StatsCard
          title="Contribution Level"
          value={contributionLevel.level}
          subtitle="Based on donations"
          icon={TrendingUpIcon}
          color={contributionLevel.color}
        />
      </div>

      {/* Donation Timeline & Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Last Donation"
          value={stats.donationStats.lastDonationDate ? "Recent" : "Never"}
          subtitle={stats.donationStats.lastDonationDate 
            ? formatDate(stats.donationStats.lastDonationDate, 'DD/MM/YYYY')
            : "No donations yet"
          }
          icon={CalendarIcon}
          color="blue"
        />

        <StatsCard
          title="Next Eligible Date"
          value={stats.donationStats.nextEligibleDate ? "Scheduled" : "Available"}
          subtitle={stats.donationStats.nextEligibleDate 
            ? formatDate(stats.donationStats.nextEligibleDate, 'DD/MM/YYYY')
            : "Can donate now"
          }
          icon={ClockIcon}
          color={stats.donationStats.nextEligibleDate ? "yellow" : "green"}
        />

        <StatsCard
          title="Campaign Participation"
          value={formatNumber(stats.campaignStats.totalCampaigns)}
          subtitle={`${stats.campaignStats.activeCampaigns} active`}
          icon={CalendarIcon}
          color="purple"
        />

        <StatsCard
          title="Years Contributing"
          value={formatNumber(stats.impactStats.yearsContributing)}
          subtitle="Member since registration"
          icon={ChartBarIcon}
          color="gray"
        />
      </div>

      {/* Blood Type Compatibility & Impact */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <HeartIcon className="h-5 w-5 mr-2 text-red-600" />
          Donation Impact & Recognition
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Impact Summary */}
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-600 mb-2">
              {livesSaved}
            </div>
            <div className="text-sm text-red-700 font-medium">
              Lives Potentially Saved
            </div>
            <div className="text-xs text-red-600 mt-1">
              Each donation can save up to 3 lives
            </div>
          </div>

          {/* Contribution Level Details */}
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-lg font-bold text-purple-600 mb-2">
              {contributionLevel.level}
            </div>
            <div className="text-sm text-purple-700 font-medium">
              Donor Level
            </div>
            <div className="text-xs text-purple-600 mt-1">
              {stats.donationStats.totalDonations} total donations
            </div>
          </div>

          {/* Milestones */}
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-lg font-bold text-blue-600 mb-2">
              {stats.impactStats.yearsContributing > 0 ? `${stats.impactStats.yearsContributing}+` : '<1'}
            </div>
            <div className="text-sm text-blue-700 font-medium">
              Years of Service
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Committed blood donor
            </div>
          </div>
        </div>
      </div>

      {/* Donation Frequency Chart (Simple representation) */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2 text-blue-600" />
          Donation Pattern
        </h3>
        
        <div className="space-y-4">
          {/* Success Rate Bar */}
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Success Rate</span>
              <span>
                {stats.donationStats.totalDonations > 0 
                  ? Math.round((stats.donationStats.successfulDonations / stats.donationStats.totalDonations) * 100)
                  : 0
                }%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{ 
                  width: `${stats.donationStats.totalDonations > 0 
                    ? (stats.donationStats.successfulDonations / stats.donationStats.totalDonations) * 100
                    : 0
                  }%` 
                }}
              />
            </div>
          </div>

          {/* Campaign Participation */}
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Campaign Participation</span>
              <span>{stats.campaignStats.totalCampaigns} campaigns</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-purple-500 h-3 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min((stats.campaignStats.totalCampaigns / 10) * 100, 100)}%` 
                }}
              />
            </div>
          </div>

          {/* Contribution Progress to Next Level */}
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress to Next Level</span>
              <span>
                {stats.donationStats.totalDonations >= 50 ? 'Max Level' : 
                 stats.donationStats.totalDonations >= 25 ? `${50 - stats.donationStats.totalDonations} to Platinum` :
                 stats.donationStats.totalDonations >= 10 ? `${25 - stats.donationStats.totalDonations} to Gold` :
                 stats.donationStats.totalDonations >= 5 ? `${10 - stats.donationStats.totalDonations} to Silver` :
                 `${5 - stats.donationStats.totalDonations} to Bronze`
                }
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-yellow-500 h-3 rounded-full transition-all duration-300"
                style={{ 
                  width: `${
                    stats.donationStats.totalDonations >= 50 ? 100 :
                    stats.donationStats.totalDonations >= 25 ? ((stats.donationStats.totalDonations - 25) / 25) * 100 :
                    stats.donationStats.totalDonations >= 10 ? ((stats.donationStats.totalDonations - 10) / 15) * 100 :
                    stats.donationStats.totalDonations >= 5 ? ((stats.donationStats.totalDonations - 5) / 5) * 100 :
                    (stats.donationStats.totalDonations / 5) * 100
                  }%` 
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorStats;