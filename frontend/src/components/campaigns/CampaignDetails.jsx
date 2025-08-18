import {
    ArrowLeftIcon,
    CalendarIcon,
    ClockIcon,
    MapPinIcon,
    PencilIcon,
    PlayIcon,
    SpeakerWaveIcon,
    StopIcon,
    UserGroupIcon,
    UserPlusIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotifications';
import { usePermissions } from '../../hooks/usePermissions';
import {
    getCampaignById,
    registerDonor,
    sendCampaignReminders,
    updateCampaign
} from '../../services/campaignService';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { getStatusColor } from '../../utils/helpers';
import ConfirmDialog from '../common/ConfirmDialog';
import Loading from '../common/Loading';
import CampaignStats from './CampaignStats';
import ParticipantsList from './ParticipantsList';

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const { loading, execute } = useApi();
  const { user, isDonor, canCreateCampaigns } = usePermissions();
  const { showSuccess, showError } = useNotification();

  const fetchCampaign = async () => {
    await execute(
      () => getCampaignById(id),
      {
        onSuccess: (response) => {
          setCampaign(response.data.campaign);
        },
        onError: (error) => {
          showError(error.message || 'Failed to fetch campaign details');
          navigate('/campaigns');
        },
      }
    );
  };

  useEffect(() => {
    if (id) {
      fetchCampaign();
    }
  }, [id]);

  const handleRegister = async () => {
   if (!user?.donorProfile) {
     showError('Donor profile not found');
     return;
   }

   await execute(
     () => registerDonor(id, {
       donorId: user.donorProfile._id,
     }),
     {
       onSuccess: () => {
         showSuccess('Successfully registered for campaign');
         fetchCampaign();
         setShowRegisterDialog(false);
       },
       onError: (error) => {
         showError(error.message || 'Failed to register for campaign');
       },
     }
   );
 };

 const handleSendReminders = async () => {
   await execute(
     () => sendCampaignReminders(id),
     {
       onSuccess: (response) => {
         showSuccess(`Reminders sent to ${response.data.donorsContacted} participants`);
         setShowReminderDialog(false);
       },
       onError: (error) => {
         showError(error.message || 'Failed to send reminders');
       },
     }
   );
 };

 const handleStatusChange = async () => {
   await execute(
     () => updateCampaign(id, { status: newStatus }),
     {
       onSuccess: () => {
         showSuccess(`Campaign status updated to ${newStatus}`);
         fetchCampaign();
         setShowStatusDialog(false);
       },
       onError: (error) => {
         showError(error.message || 'Failed to update campaign status');
       },
     }
   );
 };

 const getStatusBadge = (status) => {
   const statusColor = getStatusColor(status);
   return (
     <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${statusColor}-100 text-${statusColor}-800`}>
       {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
     </span>
   );
 };

 const canRegister = isDonor && 
   campaign && 
   (campaign.status === 'active' || campaign.status === 'planned') && 
   !campaign.userRegistered;

 const canManage = canCreateCampaigns && 
   (campaign?.organizer._id === user?.id || user?.role === 'admin');

 const tabs = [
   { id: 'details', label: 'Details' },
   { id: 'participants', label: `Participants (${campaign?.registeredCount || 0})` },
   { id: 'stats', label: 'Statistics' },
 ];

 if (loading) {
   return <Loading size="lg" text="Loading campaign details..." />;
 }

 if (!campaign) {
   return (
     <div className="text-center py-12">
       <h3 className="text-lg font-medium text-gray-900 mb-2">Campaign not found</h3>
       <p className="text-gray-500 mb-6">The campaign you're looking for doesn't exist.</p>
       <Link to="/campaigns" className="btn btn-primary">
         Back to Campaigns
       </Link>
     </div>
   );
 }

 return (
   <div className="max-w-7xl mx-auto space-y-6">
     {/* Header */}
     <div className="flex items-center justify-between">
       <div className="flex items-center space-x-4">
         <button
           onClick={() => navigate('/campaigns')}
           className="btn btn-ghost p-2"
         >
           <ArrowLeftIcon className="h-5 w-5" />
         </button>
         <div>
           <h1 className="text-2xl font-bold text-gray-900">{campaign.title}</h1>
           <p className="text-gray-500">Campaign Details</p>
         </div>
       </div>

       <div className="flex items-center space-x-3">
         {getStatusBadge(campaign.status)}
         
         {canManage && (
           <div className="flex items-center space-x-2">
             <button
               onClick={() => setShowReminderDialog(true)}
               className="btn btn-sm btn-outline-primary inline-flex items-center"
               disabled={campaign.registeredCount === 0}
             >
               <SpeakerWaveIcon className="h-4 w-4 mr-1" />
               Send Reminders
             </button>

             <Link
               to={`/campaigns/${id}/edit`}
               className="btn btn-sm btn-outline-primary inline-flex items-center"
             >
               <PencilIcon className="h-4 w-4 mr-1" />
               Edit
             </Link>

             {campaign.status === 'planned' && (
               <button
                 onClick={() => {
                   setNewStatus('active');
                   setShowStatusDialog(true);
                 }}
                 className="btn btn-sm btn-success inline-flex items-center"
               >
                 <PlayIcon className="h-4 w-4 mr-1" />
                 Start Campaign
               </button>
             )}

             {campaign.status === 'active' && (
               <button
                 onClick={() => {
                   setNewStatus('completed');
                   setShowStatusDialog(true);
                 }}
                 className="btn btn-sm btn-warning inline-flex items-center"
               >
                 <StopIcon className="h-4 w-4 mr-1" />
                 Complete Campaign
               </button>
             )}
           </div>
         )}

         {canRegister && (
           <button
             onClick={() => setShowRegisterDialog(true)}
             className="btn btn-primary inline-flex items-center"
           >
             <UserPlusIcon className="h-4 w-4 mr-2" />
             Register
           </button>
         )}
       </div>
     </div>

     {/* Campaign Overview */}
     <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2">
           <p className="text-gray-700 mb-6">{campaign.description}</p>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="flex items-center text-gray-600">
               <CalendarIcon className="h-5 w-5 mr-3 text-gray-400" />
               <div>
                 <p className="font-medium">Duration</p>
                 <p className="text-sm">
                   {formatDate(campaign.startDate, 'DD/MM/YYYY')} - {formatDate(campaign.endDate, 'DD/MM/YYYY')}
                 </p>
               </div>
             </div>

             <div className="flex items-center text-gray-600">
               <ClockIcon className="h-5 w-5 mr-3 text-gray-400" />
               <div>
                 <p className="font-medium">Time</p>
                 <p className="text-sm">
                   {formatDateTime(campaign.startDate)}
                 </p>
               </div>
             </div>

             <div className="flex items-center text-gray-600">
               <MapPinIcon className="h-5 w-5 mr-3 text-gray-400" />
               <div>
                 <p className="font-medium">Location</p>
                 <p className="text-sm">
                   {campaign.location.venue}
                 </p>
                 <p className="text-xs text-gray-500">
                   {campaign.location.address}, {campaign.location.city}
                 </p>
               </div>
             </div>

             <div className="flex items-center text-gray-600">
               <UserGroupIcon className="h-5 w-5 mr-3 text-gray-400" />
               <div>
                 <p className="font-medium">Participation</p>
                 <p className="text-sm">
                   {campaign.registeredCount} registered
                   {campaign.targetDonors > 0 && ` / ${campaign.targetDonors} target`}
                 </p>
               </div>
             </div>
           </div>

           {/* Target Blood Types */}
           {campaign.targetBloodTypes && campaign.targetBloodTypes.length > 0 && (
             <div className="mt-6">
               <p className="font-medium text-gray-900 mb-2">Target Blood Types</p>
               <div className="flex flex-wrap gap-2">
                 {campaign.targetBloodTypes.map((bloodType) => (
                   <span
                     key={bloodType}
                     className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"
                   >
                     {bloodType}
                   </span>
                 ))}
               </div>
             </div>
           )}
         </div>

         <div className="bg-gray-50 rounded-lg p-4">
           <h3 className="font-medium text-gray-900 mb-4">Campaign Organizer</h3>
           <div className="flex items-center space-x-3">
             <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
               <span className="text-red-600 font-medium">
                 {campaign.organizer.name.charAt(0).toUpperCase()}
               </span>
             </div>
             <div>
               <p className="font-medium text-gray-900">{campaign.organizer.name}</p>
               <p className="text-sm text-gray-500">{campaign.organizer.email}</p>
             </div>
           </div>
         </div>
       </div>
     </div>

     {/* Tabs */}
     <div className="border-b border-gray-200">
       <nav className="-mb-px flex space-x-8">
         {tabs.map((tab) => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={`py-2 px-1 border-b-2 font-medium text-sm ${
               activeTab === tab.id
                 ? 'border-red-500 text-red-600'
                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
             }`}
           >
             {tab.label}
           </button>
         ))}
       </nav>
     </div>

     {/* Tab Content */}
     <div className="bg-white rounded-lg shadow border border-gray-200">
       {activeTab === 'details' && (
         <div className="p-6">
           <div className="prose max-w-none">
             <h3 className="text-lg font-semibold mb-4">About This Campaign</h3>
             <p className="text-gray-700 whitespace-pre-wrap">{campaign.description}</p>
             
             {campaign.notes && (
               <>
                 <h4 className="text-md font-medium mt-6 mb-2">Additional Notes</h4>
                 <p className="text-gray-600">{campaign.notes}</p>
               </>
             )}
           </div>
         </div>
       )}

       {activeTab === 'participants' && (
         <ParticipantsList campaignId={id} canManage={canManage} />
       )}

       {activeTab === 'stats' && (
         <CampaignStats campaign={campaign} />
       )}
     </div>

     {/* Dialogs */}
     <ConfirmDialog
       isOpen={showRegisterDialog}
       onClose={() => setShowRegisterDialog(false)}
       onConfirm={handleRegister}
       title="Register for Campaign"
       message={`Are you sure you want to register for "${campaign.title}"?`}
       confirmText="Register"
       type="info"
       loading={loading}
     />

     <ConfirmDialog
       isOpen={showReminderDialog}
       onClose={() => setShowReminderDialog(false)}
       onConfirm={handleSendReminders}
       title="Send Reminders"
       message={`Send appointment reminders to all registered participants (${campaign.registeredCount} people)?`}
       confirmText="Send Reminders"
       type="info"
       loading={loading}
     />

     <ConfirmDialog
       isOpen={showStatusDialog}
       onClose={() => setShowStatusDialog(false)}
       onConfirm={handleStatusChange}
       title="Update Campaign Status"
       message={`Are you sure you want to ${newStatus === 'active' ? 'start' : 'complete'} this campaign?`}
       confirmText={newStatus === 'active' ? 'Start Campaign' : 'Complete Campaign'}
       type="warning"
       loading={loading}
     />
   </div>
 );
};

export default CampaignDetails;