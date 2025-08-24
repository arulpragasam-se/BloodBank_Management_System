import { CalendarIcon, MapPinIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CampaignCard from '../../components/campaigns/CampaignCard';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { usePagination } from '../../hooks/usePagination';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getUserCampaigns } from '../../services/campaignService';
import { formatDate } from '../../utils/formatters';

const MyCampaignsPage = () => {
  const { user } = useAuth();
  const { execute, loading } = useApi();
  const [campaigns, setCampaigns] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    planned: 0
  });

  const {
    currentPage,
    totalPages,
    totalItems,
    handlePageChange,
    updatePagination
  } = usePagination();

  useEffect(() => {
    fetchMyCampaigns();
  }, [currentPage, activeTab]);

  const fetchMyCampaigns = async () => {
    try {
      const queryParams = {
        page: currentPage,
        limit: 10,
        status: activeTab === 'all' ? '' : activeTab,
        userId: user.userId
      };

      const response = await execute(() => getUserCampaigns(queryParams));
      
      if (response?.data) {
        setCampaigns(response.data.campaigns || []);
        setStats(response.data.stats || stats);
        updatePagination(
          response.data.pagination?.total || 0,
          Math.ceil((response.data.pagination?.total || 0) / 10)
        );
      }
    } catch (error) {
      console.error('Failed to fetch my campaigns:', error);
    }
  };

  const tabs = [
    { id: 'all', name: 'All Campaigns', count: stats.total },
    { id: 'active', name: 'Active', count: stats.active },
    { id: 'planned', name: 'Planned', count: stats.planned },
    { id: 'completed', name: 'Completed', count: stats.completed }
  ];

  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case 'active':
        return "You don't have any active campaigns running";
      case 'planned':
        return "You don't have any planned campaigns";
      case 'completed':
        return "You haven't completed any campaigns yet";
      default:
        return "You haven't created any campaigns yet";
    }
  };

  const renderUserRole = () => {
    if (user?.role === 'donor') {
      return (
        <div className="space-y-6">
          {/* Donor Registration History */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              My Campaign Registrations
            </h2>
            
            {campaigns.length > 0 ? (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {campaign.title}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            {formatDate(campaign.startDate, 'DD/MM/YYYY')}
                          </div>
                          <div className="flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-2" />
                            {campaign.location.venue}, {campaign.location.city}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          campaign.registrationStatus === 'confirmed' 
                            ? 'bg-green-100 text-green-800'
                            : campaign.registrationStatus === 'attended'
                            ? 'bg-blue-100 text-blue-800'
                            : campaign.registrationStatus === 'donated'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {campaign.registrationStatus || 'Registered'}
                        </span>
                        <div className="mt-2">
                          <Link
                            to={`/campaigns/${campaign._id}`}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No campaign registrations
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  You haven't registered for any campaigns yet.
                </p>
                <div className="mt-6">
                  <Link
                    to="/campaigns"
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Browse Campaigns
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // For admin and hospital staff
    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <div className="w-6 h-6 text-green-600">✅</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <div className="w-6 h-6 text-yellow-600">📋</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Planned</p>
                <p className="text-2xl font-bold text-gray-900">{stats.planned}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <div className="w-6 h-6 text-purple-600">🏆</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                  {tab.count > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loading />
              </div>
            ) : campaigns.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {campaigns.map((campaign) => (
                    <CampaignCard
                      key={campaign._id}
                      campaign={campaign}
                      showActions={true}
                      showStats={true}
                    />
                  ))}
                </div>
                
                {totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No campaigns found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {getEmptyStateMessage()}
                </p>
                <div className="mt-6">
                  <Link
                    to="/campaigns/create"
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Create Campaign
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.role === 'donor' ? 'My Campaign Registrations' : 'My Campaigns'}
            </h1>
            <p className="mt-2 text-gray-600">
              {user?.role === 'donor' 
                ? 'View your registered campaigns and donation history'
                : 'Manage your created blood donation campaigns'
              }
            </p>
          </div>
          
          {user?.role !== 'donor' && (
            <Link
              to="/campaigns/create"
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Campaign
            </Link>
          )}
        </div>

        {renderUserRole()}
      </div>
    </DashboardLayout>
  );
};

export default MyCampaignsPage;