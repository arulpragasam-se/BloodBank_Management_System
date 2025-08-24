import { ArrowLeftIcon, HomeIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-6xl md:text-9xl font-bold text-red-600 mb-4">
            404
          </div>
          <div className="w-24 h-24 mx-auto mb-6">
            <svg
              className="w-full h-full text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-3-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Sorry, we couldn't find the page you're looking for.
          </p>
          <p className="text-gray-500">
            The page might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            <HomeIcon className="w-5 h-5 mr-2" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Go Back
          </button>
        </div>

        {/* Help Links */}
        <div className="text-sm text-gray-500">
          <p className="mb-2">Need help? Try these instead:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/donors"
              className="text-red-600 hover:text-red-700 underline"
            >
              Find Donors
            </Link>
            <Link
              to="/campaigns"
              className="text-red-600 hover:text-red-700 underline"
            >
              Blood Campaigns
            </Link>
            <Link
              to="/contact"
              className="text-red-600 hover:text-red-700 underline"
            >
              Contact Support
            </Link>
            <Link
              to="/about"
              className="text-red-600 hover:text-red-700 underline"
            >
              About Us
            </Link>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="mt-12 p-4 bg-red-50 border border-red-200 rounded-lg max-w-md">
        <div className="text-center">
          <h3 className="text-sm font-semibold text-red-800 mb-1">
            Emergency Blood Request?
          </h3>
          <p className="text-xs text-red-700 mb-2">
            Don't wait - call our emergency hotline
          </p>
          <a
            href="tel:+94112345678"
            className="inline-block bg-red-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            Call +94 11 234 5678
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;