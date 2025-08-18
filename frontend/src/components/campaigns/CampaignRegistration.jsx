import {
    CalendarIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    MapPinIcon,
    UserGroupIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from '../../hooks/useForm';
import { useNotification } from '../../hooks/useNotifications';
import { getCampaignById, registerDonor } from '../../services/campaignService';
import { checkEligibility, getDonorById } from '../../services/donorService';
import { formatDate } from '../../utils/formatters';
import Loading from '../common/Loading';
import FormContainer from '../forms/FormContainer';
import Input from '../forms/Input';
import TextArea from '../forms/TextArea';

const CampaignRegistration = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { loading, execute } = useApi();

  const [campaign, setCampaign] = useState(null);
  const [donorProfile, setDonorProfile] = useState(null);
  const [eligibilityCheck, setEligibilityCheck] = useState(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  const validationRules = {
    appointmentTime: { type: 'string' },
    specialRequests: { type: 'string', maxLength: 500 },
    emergencyContactName: { required: true, type: 'string', minLength: 2, maxLength: 50 },
    emergencyContactPhone: { required: true, type: 'phone' },
    consent: { required: true },
  };

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    setFieldValue,
    getFieldProps,
    isSubmitting,
  } = useForm({
    initialValues: {
      appointmentTime: '',
      specialRequests: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      consent: false,
    },
    validationRules,
    onSubmit: async (formData) => {
      if (!eligibilityCheck?.isEligible) {
        showError('You must be eligible to donate before registering');
        return;
      }

      await execute(
        () => registerDonor(campaign._id, {
          donorId: donorProfile._id,
          appointmentTime: formData.appointmentTime || null,
          specialRequests: formData.specialRequests,
          emergencyContact: {
            name: formData.emergencyContactName,
            phone: formData.emergencyContactPhone,
          },
        }),
        {
          onSuccess: () => {
            showSuccess('Successfully registered for campaign!');
            navigate(`/campaigns/${campaign._id}`);
          },
          onError: (error) => {
            showError(error.message || 'Failed to register for campaign');
          },
        }
      );
    },
  });

  const fetchData = async () => {
    if (!id || !user) return;

    // Fetch campaign details
    await execute(
      () => getCampaignById(id),
      {
        onSuccess: (response) => {
          setCampaign(response.data.campaign);
        },
        onError: (error) => {
          showError('Campaign not found');
          navigate('/campaigns');
        },
      }
    );

    // Fetch donor profile if user is a donor
    if (user.role === 'donor') {
      await execute(
        () => getDonorById(user.donorProfile?._id),
        {
          onSuccess: (response) => {
            setDonorProfile(response.data.donor);
            // Pre-fill emergency contact if available
            if (response.data.donor.emergencyContact) {
              setFieldValue('emergencyContactName', response.data.donor.emergencyContact.name || '');
              setFieldValue('emergencyContactPhone', response.data.donor.emergencyContact.phone || '');
            }
          },
        }
      );
    }
  };

  const performEligibilityCheck = async () => {
    if (!donorProfile) return;

    setCheckingEligibility(true);
    await execute(
      () => checkEligibility(donorProfile._id),
      {
        onSuccess: (response) => {
          setEligibilityCheck(response.data.eligibility);
        },
        onError: (error) => {
          showError('Failed to check eligibility');
        },
        showLoading: false,
      }
    );
    setCheckingEligibility(false);
  };

  useEffect(() => {
    fetchData();
  }, [id, user]);

  useEffect(() => {
    if (donorProfile) {
      performEligibilityCheck();
    }
  }, [donorProfile]);

  if (loading || !campaign) {
    return <Loading fullScreen text="Loading campaign details..." />;
  }

  // Check if campaign is available for registration
  const isActive = campaign.isActive;
  const isUpcoming = new Date(campaign.startDate) > new Date();
  const canRegister = isActive || isUpcoming;

  if (!canRegister) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-yellow-800">
                Registration Not Available
              </h3>
              <p className="text-yellow-700 mt-1">
                This campaign is no longer accepting registrations.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigate(`/campaigns/${campaign._id}`)}
              className="btn btn-outline-primary"
            >
              View Campaign Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (user?.role !== 'donor') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <XCircleIcon className="h-6 w-6 text-red-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-red-800">
                Donor Registration Required
              </h3>
              <p className="text-red-700 mt-1">
                You must be registered as a donor to participate in campaigns.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(`/campaigns/${campaign._id}`)}
          className="btn btn-ghost mb-4 inline-flex items-center"
        >
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Campaign
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900">
          Register for Campaign
        </h1>
        <p className="mt-2 text-gray-600">
          Complete your registration for "{campaign.title}"
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Campaign Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Campaign Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">{campaign.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-gray-600 text-sm">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <span>
                    {formatDate(campaign.startDate, 'DD/MM/YYYY')} - {formatDate(campaign.endDate, 'DD/MM/YYYY')}
                  </span>
                </div>

                <div className="flex items-center text-gray-600 text-sm">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  <div>
                    <p>{campaign.location.venue}</p>
                    <p className="text-xs">{campaign.location.address}</p>
                    <p className="text-xs">{campaign.location.city}, {campaign.location.district}</p>
                  </div>
                </div>

                <div className="flex items-center text-gray-600 text-sm">
                  <UserGroupIcon className="h-4 w-4 mr-2" />
                  <span>
                    {campaign.registeredCount || 0} registered
                    {campaign.targetDonors > 0 && ` / ${campaign.targetDonors} target`}
                  </span>
                </div>
              </div>

              {campaign.targetBloodTypes && campaign.targetBloodTypes.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Target Blood Types:</p>
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
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="lg:col-span-2">
          {/* Eligibility Check */}
          {donorProfile && (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Eligibility Check
              </h2>
              
              {checkingEligibility ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3" />
                  <span className="text-gray-600">Checking eligibility...</span>
                </div>
              ) : eligibilityCheck ? (
                <div className={`p-4 rounded-lg ${
                  eligibilityCheck.isEligible 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-start">
                    {eligibilityCheck.isEligible ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                    )}
                    <div>
                      <h3 className={`font-medium ${
                        eligibilityCheck.isEligible ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {eligibilityCheck.isEligible ? 'Eligible to Donate' : 'Not Eligible to Donate'}
                      </h3>
                      {!eligibilityCheck.isEligible && eligibilityCheck.issues && (
                        <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                          {eligibilityCheck.issues.map((issue, index) => (
                            <li key={index}>{issue}</li>
                          ))}
                        </ul>
                      )}
                      {eligibilityCheck.nextEligibleDate && (
                        <p className="mt-2 text-sm text-red-700">
                          Next eligible date: {formatDate(eligibilityCheck.nextEligibleDate, 'DD/MM/YYYY')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">Unable to check eligibility</div>
              )}
            </div>
          )}

          {/* Registration Form */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Registration Form
            </h2>

            <FormContainer onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Appointment Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Appointment Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    {...getFieldProps('appointmentTime')}
                    min={new Date(campaign.startDate).toISOString().slice(0, 16)}
                    max={new Date(campaign.endDate).toISOString().slice(0, 16)}
                    className="form-input"
                  />
                  {errors.appointmentTime && (
                    <p className="form-error">{errors.appointmentTime}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Select your preferred time within the campaign period
                  </p>
                </div>

                {/* Emergency Contact */}
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-4">
                    Emergency Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Contact Name"
                      required
                      {...getFieldProps('emergencyContactName')}
                      error={errors.emergencyContactName}
                      placeholder="Full name"
                    />
                    
                    <Input
                      label="Contact Phone"
                      required
                      {...getFieldProps('emergencyContactPhone')}
                      error={errors.emergencyContactPhone}
                      placeholder="+94 XX XXX XXXX"
                    />
                  </div>
                </div>

                {/* Special Requests */}
                <TextArea
                  label="Special Requests or Medical Information (Optional)"
                  {...getFieldProps('specialRequests')}
                  error={errors.specialRequests}
                  placeholder="Any special requirements or medical information we should know about"
                  rows={3}
                />

                {/* Consent */}
                <div className="space-y-4">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="consent"
                      checked={values.consent}
                      onChange={(e) => setFieldValue('consent', e.target.checked)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mt-1"
                    />
                    <label htmlFor="consent" className="ml-3 block text-sm text-gray-900">
                      I confirm that I am in good health and eligible to donate blood. I understand that:
                      <ul className="mt-2 list-disc list-inside text-gray-600 space-y-1">
                        <li>I must be between 18-65 years old and weigh at least 50kg</li>
                        <li>I have not donated blood in the last 12-16 weeks</li>
                        <li>I will undergo a health screening before donation</li>
                        <li>I can withdraw from donation at any time</li>
                        <li>My personal information will be kept confidential</li>
                      </ul>
                    </label>
                  </div>
                  {errors.consent && (
                    <p className="form-error">{errors.consent}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => navigate(`/campaigns/${campaign._id}`)}
                      className="btn btn-secondary"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting || !eligibilityCheck?.isEligible}
                      className="btn btn-primary"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Registering...
                        </div>
                      ) : (
                        'Complete Registration'
                      )}
                    </button>
                  </div>
                  
                  {!eligibilityCheck?.isEligible && (
                    <p className="mt-2 text-sm text-red-600 text-right">
                      You must be eligible to donate before registering
                    </p>
                  )}
                </div>
              </div>
            </FormContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignRegistration;