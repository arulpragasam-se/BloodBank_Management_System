import {
    CalendarIcon,
    DocumentTextIcon,
    EnvelopeIcon,
    ExclamationTriangleIcon,
    HeartIcon,
    PencilIcon,
    PhoneIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Loading from '../../components/common/Loading';
import CompatibilityChecker from '../../components/recipients/CompatibilityChecker';
import TransfusionHistory from '../../components/recipients/TransfusionHistory';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getRecipientById } from '../../services/recipientService';
import { calculateAge, formatDate } from '../../utils/formatters';

const RecipientDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const { execute, loading } = useApi();
  const [recipient, setRecipient] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchRecipientDetails();
  }, [id]);

  const fetchRecipientDetails = async () => {
    try {
      const response = await execute(() => getRecipientById(id));
      if (response?.data) {
        setRecipient(response.data.recipient);
      }
    } catch (error) {
      console.error('Failed to fetch recipient details:', error);
      navigate('/recipients');
    }
  };

  const canEdit = recipient && (
    hasPermission('update_recipient') || 
    (user?.role === 'recipient' && recipient.userId === user.userId)
  );

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || !recipient) {
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
    { id: 'history', name: 'Transfusion History', icon: HeartIcon },
    { id: 'compatibility', name: 'Blood Compatibility', icon: DocumentTextIcon }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-purple-600">
                    {recipient.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {recipient.name}
                    </h1>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      recipient.isActive 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {recipient.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {recipient.urgencyLevel && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(recipient.urgencyLevel)}`}>
                        {recipient.urgencyLevel.charAt(0).toUpperCase() + recipient.urgencyLevel.slice(1)} Priority
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <EnvelopeIcon className="h-4 w-4 mr-2" />
                      <span>{recipient.email}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <PhoneIcon className="h-4 w-4 mr-2" />
                      <span>{recipient.phone}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <span>Age: {calculateAge(recipient.dateOfBirth)} years</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {canEdit && (
                  <Link
                    to={`/recipients/${recipient._id}/edit`}
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
                <div className="text-lg font-bold text-purple-600">
                  {recipient.bloodType}
                </div>
                <div className="text-sm text-gray-600">Blood Type</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {recipient.totalTransfusions || 0}
                </div>
                <div className="text-sm text-gray-600">Total Transfusions</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {recipient.totalUnitsReceived || 0}
                </div>
                <div className="text-sm text-gray-600">Units Received</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">
                  {recipient.lastTransfusion 
                    ? formatDate(recipient.lastTransfusion, 'DD/MM/YYYY')
                    : 'Never'
                  }
                </div>
                <div className="text-sm text-gray-600">Last Transfusion</div>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Alert */}
        {recipient.urgencyLevel === 'critical' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-semibold text-red-800">
                  Critical Patient Alert
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  This patient requires immediate medical attention and may need urgent blood transfusion.
                </p>
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
                    ? 'border-purple-500 text-purple-600'
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
                    <dd className="mt-1 text-sm text-gray-900">{recipient.name}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(recipient.dateOfBirth, 'DD/MM/YYYY')} (Age: {calculateAge(recipient.dateOfBirth)})
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Gender</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">{recipient.gender}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Blood Type</dt>
                    <dd className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {recipient.bloodType}
                      </span>
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {recipient.address?.street && (
                        <div>{recipient.address.street}</div>
                      )}
                      <div>
                        {recipient.address?.city}, {recipient.address?.district}
                      </div>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Medical Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Medical Information
                </h3>
                
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Medical Condition</dt>
                    <dd className="mt-1 text-sm text-gray-900">{recipient.medicalCondition}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Urgency Level</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(recipient.urgencyLevel)}`}>
                        {recipient.urgencyLevel?.charAt(0).toUpperCase() + recipient.urgencyLevel?.slice(1) || 'Not Set'}
                      </span>
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Allergies</dt>
                    <dd className="mt-1">
                      {recipient.allergies?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {recipient.allergies.map((allergy, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800"
                            >
                              {allergy}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No known allergies</span>
                      )}
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Current Medications</dt>
                    <dd className="mt-1">
                      {recipient.currentMedications?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {recipient.currentMedications.map((medication, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {medication}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No current medications</span>
                      )}
                    </dd>
                  </div>
                  
                  {recipient.emergencyContact && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Emergency Contact</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <div>{recipient.emergencyContact.name}</div>
                        <div>{recipient.emergencyContact.phone}</div>
                        <div className="text-gray-600 capitalize">
                          {recipient.emergencyContact.relationship}
                        </div>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <TransfusionHistory recipientId={recipient._id} />
          )}

          {activeTab === 'compatibility' && (
            <CompatibilityChecker recipient={recipient} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RecipientDetailsPage;