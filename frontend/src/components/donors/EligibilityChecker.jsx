import {
    CalendarIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useNotification } from '../../hooks/useNotifications';
import { checkEligibility } from '../../services/donorService';
import { calculateAge, formatDate } from '../../utils/formatters';

const EligibilityChecker = ({ donor, onEligibilityUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const { showSuccess, showError } = useNotification();

  const handleCheckEligibility = async () => {
    try {
      setLoading(true);
      const response = await checkEligibility(donor._id);
      
      if (response.success) {
        setEligibilityResult(response.data.eligibility);
        showSuccess('Eligibility checked successfully');
        
        if (onEligibilityUpdate) {
          onEligibilityUpdate(response.data.donor);
        }
      }
    } catch (error) {
      showError(error.message || 'Failed to check eligibility');
    } finally {
      setLoading(false);
    }
  };

  const getEligibilityIcon = () => {
    if (!eligibilityResult) return null;
    
    if (eligibilityResult.isEligible) {
      return <CheckCircleIcon className="h-12 w-12 text-green-500" />;
    } else {
      return <XCircleIcon className="h-12 w-12 text-red-500" />;
    }
  };

  const getEligibilityColor = () => {
    if (!eligibilityResult) return 'gray';
    return eligibilityResult.isEligible ? 'green' : 'red';
  };

  const age = calculateAge(donor.dateOfBirth);
  const daysSinceLastDonation = donor.lastDonationDate 
    ? Math.floor((new Date() - new Date(donor.lastDonationDate)) / (1000 * 60 * 60 * 24))
    : null;

  const eligibilityCriteria = [
    {
      label: 'Age Requirement',
      requirement: '18-65 years',
      status: age >= 18 && age <= 65,
      current: `${age} years`,
    },
    {
      label: 'Weight Requirement',
      requirement: 'At least 50 kg',
      status: donor.weight >= 50,
      current: `${donor.weight} kg`,
    },
    {
      label: 'Donation Interval',
      requirement: 'At least 84 days since last donation',
      status: !donor.lastDonationDate || daysSinceLastDonation >= 84,
      current: donor.lastDonationDate 
        ? `${daysSinceLastDonation} days ago`
        : 'Never donated',
    },
    {
      label: 'Medical History',
      requirement: 'No restricting conditions',
      status: !donor.medicalHistory?.diseases?.some(disease => 
        ['hiv', 'hepatitis', 'cancer', 'heart disease'].some(restricted => 
          disease.toLowerCase().includes(restricted)
        )
      ),
      current: donor.medicalHistory?.diseases?.length 
        ? `${donor.medicalHistory.diseases.length} conditions listed`
        : 'No conditions listed',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Eligibility Assessment
        </h3>
        
        <button
          onClick={handleCheckEligibility}
          disabled={loading}
          className="btn btn-primary btn-sm"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Checking...
            </div>
          ) : (
            'Check Eligibility'
          )}
        </button>
      </div>

      {/* Current Status */}
      <div className={`mb-6 p-4 rounded-lg border ${
        donor.isEligible 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center space-x-3">
          {donor.isEligible ? (
            <CheckCircleIcon className="h-6 w-6 text-green-500" />
          ) : (
            <XCircleIcon className="h-6 w-6 text-red-500" />
          )}
          <div className="flex-1">
            <h4 className={`font-medium ${
              donor.isEligible ? 'text-green-700' : 'text-red-700'
            }`}>
              Current Status: {donor.isEligible ? 'Eligible' : 'Not Eligible'}
            </h4>
            {donor.eligibilityNotes && (
              <p className={`text-sm mt-1 ${
                donor.isEligible ? 'text-green-600' : 'text-red-600'
              }`}>
                {donor.eligibilityNotes}
              </p>
            )}
          </div>
        </div>
        
        {!donor.isEligible && donor.nextEligibleDate && (
          <div className="mt-3 flex items-center space-x-2 text-sm text-red-600">
            <CalendarIcon className="h-4 w-4" />
            <span>Next eligible date: {formatDate(donor.nextEligibleDate, 'DD/MM/YYYY')}</span>
          </div>
        )}
      </div>

      {/* Eligibility Criteria */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900 mb-4">
          Eligibility Criteria
        </h4>
        
        {eligibilityCriteria.map((criteria, index) => (
          <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              {criteria.status ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {criteria.label}
                </p>
                <p className="text-xs text-gray-500">
                  Required: {criteria.requirement}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className={`text-sm font-medium ${
                criteria.status ? 'text-green-700' : 'text-red-700'
              }`}>
                {criteria.current}
              </p>
              <p className={`text-xs ${
                criteria.status ? 'text-green-600' : 'text-red-600'
              }`}>
                {criteria.status ? 'Meets requirement' : 'Does not meet requirement'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Latest Check Result */}
      {eligibilityResult && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Latest Eligibility Check
          </h4>
          
          <div className={`p-4 rounded-lg border ${
            eligibilityResult.isEligible 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start space-x-3">
              {getEligibilityIcon()}
              <div className="flex-1">
                <h5 className={`font-medium mb-2 ${
                  eligibilityResult.isEligible ? 'text-green-700' : 'text-red-700'
                }`}>
                  {eligibilityResult.isEligible 
                    ? 'Donor is eligible for blood donation' 
                    : 'Donor is not eligible for blood donation'
                  }
                </h5>
                
                {eligibilityResult.issues && eligibilityResult.issues.length > 0 && (
                  <div className="space-y-1">
                    <p className={`text-sm font-medium ${
                      eligibilityResult.isEligible ? 'text-green-600' : 'text-red-600'
                    }`}>
                      Issues found:
                    </p>
                    <ul className={`text-sm space-y-1 ${
                      eligibilityResult.isEligible ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {eligibilityResult.issues.map((issue, index) => (
                        <li key={index} className="flex items-start space-x-1">
                          <span>•</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {eligibilityResult.nextEligibleDate && (
                  <div className="mt-3 flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span className={`text-sm ${
                      eligibilityResult.isEligible ? 'text-green-600' : 'text-red-600'
                    }`}>
                      Next eligible: {formatDate(eligibilityResult.nextEligibleDate, 'DD/MM/YYYY')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Important Notes */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <h5 className="font-medium text-blue-700 mb-2">Important Notes</h5>
            <ul className="text-sm text-blue-600 space-y-1">
              <li>• Final eligibility is determined during pre-donation screening</li>
              <li>• Additional medical checks may be required before donation</li>
              <li>• Donors should be in good health on the day of donation</li>
              <li>• Some medications may temporarily affect eligibility</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Medical History Warnings */}
      {donor.medicalHistory && (
        <div className="mt-4">
          {(donor.medicalHistory.allergies?.length > 0 || 
            donor.medicalHistory.medications?.length > 0 ||
            donor.medicalHistory.diseases?.length > 0) && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <h5 className="font-medium text-yellow-700 mb-2">
                    Medical History Review Required
                  </h5>
                  <div className="text-sm text-yellow-600 space-y-1">
                    {donor.medicalHistory.allergies?.length > 0 && (
                      <p>• Allergies: {donor.medicalHistory.allergies.join(', ')}</p>
                    )}
                    {donor.medicalHistory.medications?.length > 0 && (
                      <p>• Current medications: {donor.medicalHistory.medications.join(', ')}</p>
                    )}
                    {donor.medicalHistory.diseases?.length > 0 && (
                      <p>• Medical conditions: {donor.medicalHistory.diseases.join(', ')}</p>
                    )}
                  </div>
                  <p className="text-sm text-yellow-600 mt-2">
                    Medical staff should review this information before donation.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EligibilityChecker;