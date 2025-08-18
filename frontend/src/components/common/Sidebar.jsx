import {
    BeakerIcon,
    BellIcon,
    BuildingOffice2Icon,
    ChartBarIcon,
    DocumentTextIcon,
    HeartIcon,
    HomeIcon,
    MegaphoneIcon,
    UserGroupIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { 
    canManageInventory, 
    canViewReports, 
    canCreateCampaigns,
    isAdmin,
    isHospitalStaff,
    isDonor,
    isRecipient
  } = usePermissions();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      show: true,
    },
    {
      name: 'Donors',
      href: '/donors',
      icon: UserGroupIcon,
      show: isAdmin || isHospitalStaff,
    },
    {
      name: 'Blood Inventory',
      href: '/inventory',
      icon: BeakerIcon,
      show: canManageInventory,
    },
    {
      name: 'Campaigns',
      href: '/campaigns',
      icon: MegaphoneIcon,
      show: true,
    },
    {
      name: 'Hospitals',
      href: '/hospitals',
      icon: BuildingOffice2Icon,
      show: isAdmin || isHospitalStaff,
    },
    {
      name: 'Recipients',
      href: '/recipients',
      icon: HeartIcon,
      show: isAdmin || isHospitalStaff,
    },
    {
      name: 'Blood Requests',
      href: '/requests',
      icon: DocumentTextIcon,
      show: isAdmin || isHospitalStaff,
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: BellIcon,
      show: isAdmin || isHospitalStaff,
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: ChartBarIcon,
      show: canViewReports,
    },
  ];

  const filteredNavigation = navigation.filter(item => item.show);

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BB</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Blood Bank</h2>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-medium text-sm">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.href);

            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  isActive
                    ? 'bg-red-100 text-red-700 border-r-2 border-red-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon
                  className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                    isActive
                      ? 'text-red-600'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>Blood Bank Management System</p>
            <p>Version 1.0.0</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;