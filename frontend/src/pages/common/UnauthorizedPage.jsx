import { ArrowLeftIcon, HomeIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const UnauthorizedPage = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="text-center max-w-md">
        {/* Access Denied Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldExclamationIcon className="w-12 h-12 text-red-600" />
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          
          {user ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">Current Role:</span> {user.role}
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                This page requires different permissions than your current role allows.
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                You need to be logged in to access this page.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 mb-8">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                <HomeIcon className="w-5 h-5 mr-2" />
                Go to Dashboard
              </Link>
              <button
                onClick={() => window.history.back()}
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Go Back
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-sm text-red-600 hover:text-red-700 underline"
              >
                Sign out and login with different account
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/"
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                <HomeIcon className="w-5 h-5 mr-2" />
                Go Home
              </Link>
            </>
          )}
        </div>

        {/* Role Information */}
        <div className="text-xs text-gray-500 space-y-2">
          <p className="font-semibold">Access levels:</p>
          <div className="grid grid-cols-2 gap-2 text-left">
            <div>
              <span className="text-red-600">Admin:</span> Full access
            </div>
            <div>
              <span className="text-blue-600">Hospital:</span> Inventory & requests
            </div>
            <div>
              <span className="text-green-600">Donor:</span> Campaigns & profile
            </div>
            <div>
              <span className="text-purple-600">Recipient:</span> Requests & profile
            </div>
          </div>
        </div>
      </div>

      {/* Contact Support */}
      <div className="mt-12 p-4 bg-gray-100 border border-gray-200 rounded-lg max-w-md">
        <div className="text-center">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">
            Need Different Access?
          </h3>
          <p className="text-xs text-gray-600 mb-2">
            Contact our support team if you believe this is an error
          </p>
          <Link
            to="/contact"
            className="inline-block bg-gray-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-gray-700 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;