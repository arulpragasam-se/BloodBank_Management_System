import {
    CalendarIcon,
    CheckCircleIcon,
    EyeIcon,
    HeartIcon,
    UserIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { calculateAge, formatDate } from '../../utils/formatters';

const DonorCard = ({ donor, onClick, showActions = true }) => {
  const age = calculateAge(donor.dateOfBirth);
  
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-semibold text-lg">
                {donor.userId?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {donor.userId?.name}
              </h3>
              <p className="text-sm text-gray-500">{donor.userId?.email}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium blood-type-${donor.bloodType?.toLowerCase().replace('+', '-positive').replace('-', '-negative')}`}>
              {donor.bloodType}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <UserIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{age} years old</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{donor.weight} kg</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <HeartIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {donor.totalDonations || 0} donations
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {donor.lastDonationDate 
                ? formatDate(donor.lastDonationDate, 'DD/MM/YYYY')
                : 'Never donated'
              }
            </span>
          </div>
        </div>

        {/* Eligibility Status */}
        <div className="mb-4">
          <div className={`flex items-center space-x-2 p-3 rounded-lg ${
            donor.isEligible 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {donor.isEligible ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : (
              <XCircleIcon className="h-5 w-5 text-red-500" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                donor.isEligible ? 'text-green-700' : 'text-red-700'
              }`}>
                {donor.isEligible ? 'Eligible for Donation' : 'Not Eligible'}
              </p>
              {donor.eligibilityNotes && (
                <p className={`text-xs mt-1 ${
                  donor.isEligible ? 'text-green-600' : 'text-red-600'
                }`}>
                  {donor.eligibilityNotes}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Next Eligible Date */}
        {!donor.isEligible && donor.nextEligibleDate && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">
              <CalendarIcon className="h-4 w-4 inline mr-1" />
              Next eligible: {formatDate(donor.nextEligibleDate, 'DD/MM/YYYY')}
            </p>
          </div>
        )}

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Phone:</span> {donor.userId?.phone}
          </div>
          {donor.address?.city && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Location:</span> {donor.address.city}
              {donor.address.district && `, ${donor.address.district}`}
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <Link
              to={`/donors/${donor._id}`}
              className="flex-1 btn btn-outline-primary btn-sm"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              View Details
            </Link>
            
            {onClick && (
              <button
                onClick={() => onClick(donor)}
                className="flex-1 btn btn-primary btn-sm"
              >
                Select
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorCard;