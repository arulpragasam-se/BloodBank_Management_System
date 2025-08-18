import {
    BeakerIcon,
    BellIcon,
    ChartBarIcon,
    DocumentPlusIcon,
    HeartIcon,
    MegaphoneIcon,
    PlusIcon,
    UserPlusIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';

const QuickActions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    canManageInventory, 
    canCreateCampaigns, 
    canSendNotifications,
    canViewReports,
    isAdmin,
    isHospitalStaff,
    isDonor 
  } = usePermissions();

  const getActionsForRole = () => {
    const baseActions = [
      {
        title: 'View Campaigns',
        description: 'Browse active donation campaigns',
        icon: MegaphoneIcon,
        color: 'bg-green-500',
        onClick: () => navigate('/campaigns'),
        show: true
      }
    ];

    if (isAdmin || isHospitalStaff) {
      return [
        {
          title: 'Add Blood Unit',
          description: 'Register new blood donation',
          icon: BeakerIcon,
          color: 'bg-red-500',
          onClick: () => navigate('/inventory/add'),
          show: canManageInventory
        },
        {
          title: 'Create Campaign',
          description: 'Start new donation campaign',
          icon: MegaphoneIcon,
          color: 'bg-green-500',
          onClick: () => navigate('/campaigns/create'),
          show: canCreateCampaigns
        },
        {
          title: 'Blood Request',
          description: 'Request blood for hospital',
          icon: DocumentPlusIcon,
          color: 'bg-blue-500',
          onClick: () => navigate('/requests/create'),
          show: true
        },
        {
          title: 'Send Notification',
          description: 'Notify donors and staff',
          icon: BellIcon,
          color: 'bg-purple-500',
          onClick: () => navigate('/notifications/send'),
          show: canSendNotifications
        },
        {
          title: 'Generate Report',
          description: 'Create system reports',
          icon: ChartBarIcon,
          color: 'bg-indigo-500',
          onClick: () => navigate('/reports/generate'),
          show: canViewReports
        },
        {
          title: 'Register Donor',
          description: 'Add new donor to system',
          icon: UserPlusIcon,
          color: 'bg-orange-500',
          onClick: () => navigate('/donors/add'),
          show: isAdmin
        }
      ];
    }

    if (isDonor) {
      return [
        ...baseActions,
        {
          title: 'Register for Campaign',
          description: 'Join upcoming campaigns',
          icon: PlusIcon,
          color: 'bg-green-500',
          onClick: () => navigate('/campaigns'),
          show: true
        },
        {
          title: 'Donation History',
          description: 'View my past donations',
          icon: HeartIcon,
          color: 'bg-red-500',
          onClick: () => navigate('/profile'),
          show: true
        },
        {
          title: 'Check Eligibility',
          description: 'Verify donation eligibility',
          icon: CheckCircleIcon,
          color: 'bg-blue-500',
          onClick: () => navigate('/profile'),
          show: true
        }
      ];
    }

    return [
      ...baseActions,
      {
        title: 'My Profile',
        description: 'Update personal information',
        icon: UserCircleIcon,
        color: 'bg-gray-500',
        onClick: () => navigate('/profile'),
        show: true
      }
    ];
  };

  const actions = getActionsForRole().filter(action => action.show);

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        <p className="text-sm text-gray-500 mt-1">Frequently used features</p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            
            return (
              <button
                key={index}
                onClick={action.onClick}
                className="flex items-start p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 text-left group"
              >
                <div className={`flex-shrink-0 w-10 h-10 ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                    {action.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {action.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;