import {
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    Cog6ToothIcon,
    MoonIcon,
    SunIcon,
    UserCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import NotificationBell from './NotificationBell';

const Header = ({ onToggleSidebar, sidebarOpen }) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setProfileDropdownOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 lg:hidden"
          >
            {sidebarOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>

          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BB</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">Blood Bank</h1>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>

          {/* Notifications */}
          <NotificationBell />

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center space-x-2 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <div className="flex items-center space-x-2">
                <UserCircleIcon className="h-6 w-6" />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                </div>
              </div>
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-gray-500">{user?.email}</p>
                  </div>
                  
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <UserCircleIcon className="h-4 w-4 mr-2" />
                    Profile
                  </button>
                  
                  <button
                    onClick={() => navigate('/settings')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Cog6ToothIcon className="h-4 w-4 mr-2" />
                    Settings
                  </button>
                  
                  <hr className="my-1" />
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile profile dropdown overlay */}
      {profileDropdownOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setProfileDropdownOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;