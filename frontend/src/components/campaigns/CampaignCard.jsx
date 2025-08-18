import {
    CalendarIcon,
    ClockIcon,
    EyeIcon,
    MapPinIcon,
    PencilIcon,
    UserGroupIcon,
    UserPlusIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotifications';
import { usePermissions } from '../../hooks/usePermissions';
import { registerDonor } from '../../services/campaignService';
import { formatDate, formatTimeAgo } from '../../utils/formatters';
import { getStatusColor } from '../../utils/helpers';
import ConfirmDialog from '../common/ConfirmDialog';

const CampaignCard = ({ campaign, onUpdate }) => {
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const { user, isDonor, canCreateCampaigns } = usePermissions();
  const { showSuccess, showError } = useNotification();
  const { loading, execute } = useApi();

  const isActive = campaign.isActive;
  const isUpcoming = new Date(campaign.startDate) > new Date();
  const isPast = new Date(campaign.endDate) < new Date();

  const handleRegister = async () => {
    if (!user) return;

    await execute(
      () => registerDonor(campaign._id, {
        donorId: user.donorProfile?._id,
      }),
      {
        onSuccess: () => {
          showSuccess('Successfully registered for campaign');
          onUpdate();
          setShowRegisterDialog(false);
        },
        onError: (error) => {
          showError(error.message || 'Failed to register for campaign');
        },
      }
    );
  };

  const getStatusBadge = () => {
    const statusColor = getStatusColor(campaign.status);
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-800`}>
        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
      </span>
    );
  };

  const getTimeInfo = () => {
    if (isActive) {
      return (
        <div className="flex items-center text-green-600">
          <ClockIcon className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">Active Now</span>
        </div>
      );
    } else if (isUpcoming) {
      return (
        <div className="flex items-center text-blue-600">
          <ClockIcon className="h-4 w-4 mr-1" />
          <span className="text-sm">Starts {formatTimeAgo(campaign.startDate)}</span>
        </div>
      );
    } else if (isPast) {
      return (
        <div className="flex items-center text-gray-500">
          <ClockIcon className="h-4 w-4 mr-1" />
          <span className="text-sm">Ended {formatTimeAgo(campaign.endDate)}</span>
        </div>
      );
    }
  };

  const canRegister = isDonor && (isActive || isUpcoming) && !campaign.userRegistered;

  return (
    <>
      <div className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow duration-200">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {campaign.title}
              </h3>
              {getStatusBadge()}
            </div>
          </div>

          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
            {campaign.description}
          </p>

          {/* Campaign Info */}
          <div className="space-y-2">
            <div className="flex items-center text-gray-500 text-sm">
              <CalendarIcon className="h-4 w-4 mr-2" />
              <span>
                {formatDate(campaign.startDate, 'DD/MM/YYYY')} - {formatDate(campaign.endDate, 'DD/MM/YYYY')}
              </span>
            </div>

            <div className="flex items-center text-gray-500 text-sm">
              <MapPinIcon className="h-4 w-4 mr-2" />
              <span className="truncate">
                {campaign.location.venue}, {campaign.location.city}
              </span>
            </div>

            <div className="flex items-center text-gray-500 text-sm">
              <UserGroupIcon className="h-4 w-4 mr-2" />
              <span>
                {campaign.registeredCount || 0} registered
                {campaign.targetDonors > 0 && ` / ${campaign.targetDonors} target`}
              </span>
            </div>
          </div>

          {/* Target Blood Types */}
          {campaign.targetBloodTypes && campaign.targetBloodTypes.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-1">Target Blood Types:</p>
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
            </div>
          )}

          {/* Time Info */}
          <div className="mt-3">
            {getTimeInfo()}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <Link
              to={`/campaigns/${campaign._id}`}
              className="btn btn-sm btn-outline-primary inline-flex items-center"
            >
              <EyeIcon className="h-4 w-4 mr-1" />
              View Details
            </Link>

            <div className="flex items-center space-x-2">
              {canCreateCampaigns && (
                <Link
                  to={`/campaigns/${campaign._id}/edit`}
                  className="btn btn-sm btn-ghost inline-flex items-center"
                >
                  <PencilIcon className="h-4 w-4" />
                </Link>
              )}

              {canRegister && (
                <button
                  onClick={() => setShowRegisterDialog(true)}
                  className="btn btn-sm btn-primary inline-flex items-center"
                >
                  <UserPlusIcon className="h-4 w-4 mr-1" />
                  Register
                </button>
              )}

              {campaign.userRegistered && (
                <span className="text-sm text-green-600 font-medium">
                  ✓ Registered
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Register Confirmation Dialog */}
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
    </>
  );
};

export default CampaignCard;