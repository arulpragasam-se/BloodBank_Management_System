import {
    CalendarIcon,
    MapPinIcon,
    PlusIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { getUpcomingCampaigns } from '../../services/campaignService';
import { registerForCampaign } from '../../services/donorService';
import { formatDate } from '../../utils/formatters';

const UpcomingCampaigns = () => {
  const { user } = useAuth();
  const { execute, loading } = useApi();
  const [campaigns, setCampaigns] = useState([]);
  const [registering, setRegistering] = useState(null);

  useEffect(() => {
    fetchUpcomingCampaigns();
  }, []);

  const fetchUpcomingCampaigns = async () => {
    try {
      const response = await execute(
        () => getUpcomingCampaigns({ limit: 5 }),
        { showLoading: false }
      );
      
      if (response?.success) {
        setCampaigns(response.data.campaigns || []);
      }
    } catch (error) {
      console.error('Failed to fetch upcoming campaigns:', error);
    }
  };

  const handleRegister = async (campaignId) => {
    if (user?.role !== 'donor') return;
    
    try {
      setRegistering(campaignId);
      await execute(() => registerForCampaign({
        donorId: user.donorId, // This would come from user profile
        campaignId
      }));
      
      // Refresh campaigns to show updated registration status
      fetchUpcomingCampaigns();
    } catch (error) {
      console.error('Failed to register for campaign:', error);
    } finally {
      setRegistering(null);
    }
  };

  const isRegistered = (campaign) => {
    // Check if current user is registered for the campaign
    return campaign.registeredDonors?.some(
      reg => reg.donorId === user?.donorId
    ) || false;
  };

  const getDaysUntil = (date) => {
    const today = new Date();
    const campaignDate = new Date(date);
    const diffTime = campaignDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (campaign) => {
    const daysUntil = getDaysUntil(campaign.startDate);
    
    if (daysUntil < 0) {
      return <span className="badge badge-secondary">Past</span>;
    } else if (daysUntil === 0) {
      return <span className="badge badge-success">Today</span>;
    } else if (daysUntil === 1) {
      return <span className="badge badge-warning">Tomorrow</span>;
    } else if (daysUntil <= 7) {
      return <span className="badge badge-info">{daysUntil} days</span>;
    } else {
      return <span className="badge badge-secondary">{daysUntil} days</span>;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Upcoming Campaigns</h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
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
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Upcoming Campaigns</h3>
          <Link
            to="/campaigns"
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            View all →
          </Link>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {campaigns.length === 0 ? (
          <div className="p-6 text-center">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-500">No upcoming campaigns</p>
            <p className="text-xs text-gray-400 mt-1">Check back later for new campaigns</p>
          </div>
        ) : (
          campaigns.map((campaign) => (
            <div key={campaign._id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {campaign.title}
                    </h4>
                    {getStatusBadge(campaign)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-xs text-gray-500">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      <span>
                        {formatDate(campaign.startDate, 'DD/MM/YYYY')} - {formatDate(campaign.endDate, 'DD/MM/YYYY')}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      <span className="truncate">
                        {campaign.location.venue}, {campaign.location.city}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <UserGroupIcon className="h-4 w-4 mr-1" />
                      <span>
                        {campaign.registeredCount || 0} registered
                        {campaign.targetDonors > 0 && ` / ${campaign.targetDonors} target`}
                      </span>
                    </div>
                  </div>
                  
                  {campaign.description && (
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                      {campaign.description}
                    </p>
                  )}
                </div>
                
                <div className="ml-4 flex-shrink-0">
                  {user?.role === 'donor' && (
                    <div>
                      {isRegistered(campaign) ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Registered
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRegister(campaign._id)}
                          disabled={registering === campaign._id}
                          className="btn btn-sm btn-primary flex items-center"
                        >
                          {registering === campaign._id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                          ) : (
                            <PlusIcon className="h-4 w-4 mr-1" />
                          )}
                          Register
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Progress bar for target donors */}
              {campaign.targetDonors > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Registration Progress</span>
                    <span>
                      {Math.round((campaign.registeredCount / campaign.targetDonors) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((campaign.registeredCount / campaign.targetDonors) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UpcomingCampaigns;