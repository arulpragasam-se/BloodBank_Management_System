import {
    CalendarIcon,
    CheckCircleIcon,
    EnvelopeIcon,
    HeartIcon,
    PencilIcon,
    PhoneIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Loading from '../../components/common/Loading';
import DonorHistory from '../../components/donors/DonorHistory';
import EligibilityChecker from '../../components/donors/EligibilityChecker';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../layouts/DashboardLayout';
import { checkDonorEligibility, getDonorById } from '../../services/donorService';
import { calculateAge, formatDate } from '../../utils/formatters';

const DonorDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const { execute, loading } = useApi();
  const [donor, setDonor] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [eligibilityStatus, setEligibilityStatus] = useState(null);

  useEffect(() => {
    fetchDonorDetails();
    if (hasPermission('view_donor_eligibility')) {
      checkEligibility();
    }
  }, [id]);

  const fetchDonorDetails = async () => {
    try {
      const response = await execute(() => getDonorById(id));
      if (response?.data) {
        setDonor(response.data.donor);
      }
    } catch (error) {
      console.error('Failed to fetch donor details:', error);
      navigate('/donors');
    }
  };

  const checkEligibility = async () => {
    try {
      const response = await execute(() => checkDonorEligibility(id));
      if (response?.data) {
        setEligibilityStatus(response.data.eligibility);
      }
    } catch (error) {
      console.error('Failed to check eligibility:', error);
    }
  };

  const canEdit = donor && (
    hasPermission('update_donor') || 
    (user?.role === 'donor' && donor.userId === user.userId)
  );

  if (loading || !donor) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-96">
          <Loading />
        </div>
      </DashboardLayout>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: CalendarIcon },
    { id: 'history', name: 'Donation History', icon: HeartIcon },
    { id: 'eligibility', name: 'Eligibility', icon: CheckCircleIcon }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-red-600">
                    {donor.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {donor.name}
                    </h1>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      donor.isActive 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {donor.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {eligibilityStatus && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        eligibilityStatus.isEligible 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {eligibilityStatus.isEligible ? 'Eligible' : 'Not Eligible'}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <EnvelopeIcon className="h-4 w-4 mr-2" />
                      <span>{donor.email}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <PhoneIcon className="h-4 w-4 mr-2" />
                      <span>{donor.phone}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <span>Age: {calculateAge(donor.dateOfBirth)} years</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {canEdit && (
                  <Link
                    to={`/donors/${donor._id}/edit`}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Edit
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">
                  {donor.bloodType}
                </div>
                <div className="text-sm text-gray-600">Blood Type</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {donor.totalDonations || 0}
                </div>
                <div className="text-sm text-gray-600">Total Donations</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {(donor.totalDonations || 0) * 3}
                </div>
                <div className="text-sm text-gray-600">Lives Saved</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {donor.lastDonationDate 
                    ? formatDate(donor.lastDonationDate, 'DD/MM/YYYY')
                    : 'Never'
                  }
                </div>
                <div className="text-sm text-gray-600">Last Donation</div>
              </div>
            </div>
          </div>
        </div>

        {/* Eligibility Alert */}
        {eligibilityStatus && !eligibilityStatus.isEligible && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <XCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-semibold text-yellow-800">
                  Donor Not Currently Eligible
                </h3>
                <div className="mt-1 text-sm text-yellow-700">
                  <ul className="list-disc list-inside space-y-1">
                    {eligibilityStatus.issues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
                {eligibilityStatus.nextEligibleDate && (
                  <p className="mt-2 text-sm text-yellow-700">
                    Next eligible date: {formatDate(eligibilityStatus.nextEligibleDate, 'DD/MM/YYYY')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Personal Information
                </h3>
                
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{donor.name}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(donor.dateOfBirth, 'DD/MM/YYYY')} (Age: {calculateAge(donor.dateOfBirth)})
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Gender</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">{donor.gender}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Blood Type</dt>
                    <dd className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {donor.bloodType}
                      </span>
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Physical Details</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      Weight: {donor.weight}kg | Height: {donor.height}cm
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Contact Information
                </h3>
                
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{donor.email}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900">{donor.phone}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {donor.address?.street && (
                        <div>{donor.address.street}</div>
                      )}
                      <div>
                        {donor.address?.city}, {donor.address?.district}
                      </div>
                    </dd>
                  </div>
                  
                  {donor.emergencyContact && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Emergency Contact</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <div>{donor.emergencyContact.name}</div>
                        <div>{donor.emergencyContact.phone}</div>
                        <div className="text-gray-600 capitalize">
                          {donor.emergencyContact.relationship}
                        </div>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Medical Information */}
              <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Medical Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Allergies</h4>
                    {donor.medicalHistory?.allergies?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {donor.medicalHistory.allergies.map((allergy, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800"
                          >
                            {allergy}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No known allergies</p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Medications</h4>
                    {donor.medicalHistory?.medications?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {donor.medicalHistory.medications.map((medication, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {medication}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No current medications</p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Medical Conditions</h4>
                    {donor.medicalHistory?.diseases?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {donor.medicalHistory.diseases.map((disease, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
                          >
                            {disease}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No medical conditions</p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Previous Surgeries</h4>
                    {donor.medicalHistory?.surgeries?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {donor.medicalHistory.surgeries.map((surgery, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800"
                          >
                            {surgery}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No previous surgeries</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <DonorHistory donorId={donor._id} />
          )}

          {activeTab === 'eligibility' && (
            <EligibilityChecker 
              donorId={donor._id} 
              eligibilityStatus={eligibilityStatus}
              onEligibilityUpdate={setEligibilityStatus}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DonorDetailsPage;