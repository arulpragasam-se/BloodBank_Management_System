import {
    CalendarIcon,
    CheckCircleIcon,
    ClockIcon,
    HeartIcon,
    MapPinIcon,
    PencilIcon,
    ShareIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CampaignStats from '../../components/campaigns/CampaignStats';
import ParticipantsList from '../../components/campaigns/ParticipantsList';
import Loading from '../../components/common/Loading';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getCampaignById } from '../../services/campaignService';
import { formatDate } from '../../utils/formatters';

const CampaignDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const { execute, loading } = useApi();
  const [campaign, setCampaign] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchCampaignDetails();
  }, [id]);

  const fetchCampaignDetails = async () => {
    try {
      const response = await execute(() => getCampaignById(id));
      if (response?.data) {
        setCampaign(response.data.campaign);
      }
    } catch (error) {
      console.error('Failed to fetch campaign details:', error);
      navigate('/campaigns');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canEdit = campaign && (
    hasPermission('update_campaign') || 
    (user?.role === 'hospital_staff' && campaign.organizer._id === user.userId)
  );

  const canRegister = user?.role === 'donor' && campaign?.status === 'active';

  if (loading || !campaign) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-96">
          <Loading />
        </div>
      </DashboardLayout>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: CalendarIcon },
    { id: 'participants', name: 'Participants', icon: UserGroupIcon },
    { id: 'stats', name: 'Statistics', icon: ClockIcon }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {campaign.title}
                  </h1>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">
                  {campaign.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span>
                      {formatDate(campaign.startDate, 'DD/MM/YYYY')} - {formatDate(campaign.endDate, 'DD/MM/YYYY')}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    <span>{campaign.location.city}, {campaign.location.district}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <UserGroupIcon className="h-4 w-4 mr-2" />
                    <span>
                      {campaign.registeredCount || 0} registered
                      {campaign.targetDonors > 0 && ` / ${campaign.targetDonors} target`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {canEdit && (
                  <Link
                    to={`/campaigns/${campaign._id}/edit`}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Edit
                  </Link>
                )}
                
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                  <ShareIcon className="w-4 h-4 mr-2" />
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Campaign Progress */}
          {campaign.targetDonors > 0 && (
            <div className="px-6 py-4 bg-gray-50">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">Registration Progress</span>
                <span className="text-gray-600">
                  {campaign.registeredCount || 0} / {campaign.targetDonors} donors
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(((campaign.registeredCount || 0) / campaign.targetDonors) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Registration Banner for Donors */}
        {canRegister && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <HeartIcon className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-red-800">
                    Join This Campaign
                  </h3>
                  <p className="text-red-700">
                    Register now and help save lives in your community
                  </p>
                </div>
              </div>
              <Link
                to={`/campaigns/${campaign._id}/register`}
                className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Register Now
              </Link>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow">
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
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Campaign Details */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Campaign Information
                </h3>
                
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Organizer</dt>
                    <dd className="mt-1 text-sm text-gray-900">{campaign.organizer.name}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Venue</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {campaign.location.venue}
                      <br />
                      {campaign.location.address}
                      <br />
                      {campaign.location.city}, {campaign.location.district}
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Duration</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(campaign.startDate, 'DD/MM/YYYY HH:mm')} - {formatDate(campaign.endDate, 'DD/MM/YYYY HH:mm')}
                    </dd>
                  </div>
                  
                  {campaign.targetBloodTypes && campaign.targetBloodTypes.length > 0 && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Target Blood Types</dt>
                      <dd className="mt-1">
                        <div className="flex flex-wrap gap-1">
                          {campaign.targetBloodTypes.map((bloodType) => (
                            <span
                              key={bloodType}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
                            >
                              {bloodType}
                            </span>
                          ))}
                        </div>
                      </dd>
                    </div>
                  )}
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Contact</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {campaign.contactInfo?.phone && (
                        <div>Phone: {campaign.contactInfo.phone}</div>
                      )}
                      {campaign.contactInfo?.email && (
                        <div>Email: {campaign.contactInfo.email}</div>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Statistics
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {campaign.registeredCount || 0}
                    </div>
                    <div className="text-sm text-blue-600">Registered</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {campaign.donatedCount || 0}
                    </div>
                    <div className="text-sm text-green-600">Donated</div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {campaign.unitsCollected || 0}
                    </div>
                    <div className="text-sm text-purple-600">Units Collected</div>
                  </div>
                  
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {(campaign.unitsCollected || 0) * 3}
                    </div>
                    <div className="text-sm text-yellow-600">Lives Saved</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'participants' && (
            <ParticipantsList campaignId={campaign._id} />
          )}

          {activeTab === 'stats' && (
            <CampaignStats campaignId={campaign._id} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CampaignDetailsPage;