import {
    ChartBarIcon,
    DocumentTextIcon,
    MapPinIcon,
    PencilIcon,
    PhoneIcon,
    PlusIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Loading from '../../components/common/Loading';
import BloodRequestForm from '../../components/hospitals/BloodRequestForm';
import StaffManagement from '../../components/hospitals/StaffManagement';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getHospitalById } from '../../services/hospitalService';
import { formatDate } from '../../utils/formatters';

const HospitalDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const { execute, loading } = useApi();
  const [hospital, setHospital] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showRequestForm, setShowRequestForm] = useState(false);

  useEffect(() => {
    fetchHospitalDetails();
  }, [id]);

  const fetchHospitalDetails = async () => {
    try {
      const response = await execute(() => getHospitalById(id));
      if (response?.data) {
        setHospital(response.data.hospital);
      }
    } catch (error) {
      console.error('Failed to fetch hospital details:', error);
      navigate('/hospitals');
    }
  };

  const canEdit = hospital && (
    hasPermission('update_hospital') || 
    (user?.role === 'hospital_staff' && hospital.staffMembers?.some(staff => staff.userId === user.userId))
  );

  const canManageStaff = hasPermission('manage_hospital_staff');
  const canCreateRequest = hasPermission('create_blood_request');

  if (loading || !hospital) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-96">
          <Loading />
        </div>
      </DashboardLayout>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: MapPinIcon },
    { id: 'staff', name: 'Staff Management', icon: UserGroupIcon },
    { id: 'requests', name: 'Blood Requests', icon: DocumentTextIcon },
    { id: 'statistics', name: 'Statistics', icon: ChartBarIcon }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {hospital.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {hospital.name}
                    </h1>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      hospital.isActive 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {hospital.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {hospital.type || 'General'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      <span>{hospital.address?.city}, {hospital.address?.district}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <PhoneIcon className="h-4 w-4 mr-2" />
                      <span>{hospital.contactInfo?.phone}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <UserGroupIcon className="h-4 w-4 mr-2" />
                      <span>{hospital.staffMembers?.length || 0} staff members</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {canCreateRequest && (
                  <button
                    onClick={() => setShowRequestForm(true)}
                    className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Blood Request
                  </button>
                )}
                
                {canEdit && (
                  <Link
                    to={`/hospitals/${hospital._id}/edit`}
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
                <div className="text-lg font-bold text-blue-600">
                  {hospital.capacity?.beds || 0}
                </div>
                <div className="text-sm text-gray-600">Total Beds</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {hospital.departments?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Departments</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {hospital.totalRequests || 0}
                </div>
                <div className="text-sm text-gray-600">Total Requests</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-600">
                  {hospital.pendingRequests || 0}
                </div>
                <div className="text-sm text-gray-600">Pending Requests</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
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
              {/* Hospital Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Hospital Information
                </h3>
                
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Hospital Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{hospital.name}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Type</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">
                      {hospital.type || 'General Hospital'}
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Registration Number</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {hospital.registrationNumber || 'N/A'}
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Established</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {hospital.establishedDate 
                        ? formatDate(hospital.establishedDate, 'YYYY')
                        : 'N/A'
                      }
                    </dd>
                  </div>
                  
                  {hospital.capacity && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Capacity</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <div>Beds: {hospital.capacity.beds}</div>
                        {hospital.capacity.icuBeds && (
                          <div>ICU Beds: {hospital.capacity.icuBeds}</div>
                        )}
                        {hospital.capacity.emergencyBeds && (
                          <div>Emergency Beds: {hospital.capacity.emergencyBeds}</div>
                        )}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Contact Information
                </h3>
                
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {hospital.contactInfo?.phone}
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Emergency</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {hospital.contactInfo?.emergency || hospital.contactInfo?.phone}
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {hospital.contactInfo?.email}
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Website</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {hospital.contactInfo?.website ? (
                        <a 
                          href={hospital.contactInfo.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {hospital.contactInfo.website}
                        </a>
                      ) : 'N/A'}
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {hospital.address?.street && (
                        <div>{hospital.address.street}</div>
                      )}
                      <div>
                        {hospital.address?.city}, {hospital.address?.district}
                      </div>
                      {hospital.address?.postalCode && (
                        <div>{hospital.address.postalCode}</div>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Departments */}
              {hospital.departments && hospital.departments.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Departments
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {hospital.departments.map((department, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {department}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'staff' && canManageStaff && (
            <StaffManagement hospitalId={hospital._id} />
          )}

          {activeTab === 'requests' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Blood Requests
                </h3>
                {canCreateRequest && (
                  <button
                    onClick={() => setShowRequestForm(true)}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    New Request
                  </button>
                )}
              </div>
              
              {/* Hospital requests would be loaded here */}
              <div className="text-center py-8 text-gray-500">
                Blood requests will be displayed here
              </div>
            </div>
          )}

          {activeTab === 'statistics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Request Statistics */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Request Statistics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Requests</span>
                    <span className="font-semibold">{hospital.totalRequests || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Approved</span>
                    <span className="font-semibold text-green-600">{hospital.approvedRequests || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending</span>
                    <span className="font-semibold text-yellow-600">{hospital.pendingRequests || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Fulfilled</span>
                    <span className="font-semibold text-blue-600">{hospital.fulfilledRequests || 0}</span>
                  </div>
                </div>
              </div>

              {/* Monthly Trends */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Monthly Activity
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">This Month</span>
                    <span className="font-semibold">12 requests</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last Month</span>
                    <span className="font-semibold">18 requests</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Response Time</span>
                    <span className="font-semibold">2.5 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <span className="font-semibold text-green-600">92%</span>
                  </div>
                </div>
              </div>

              {/* Blood Type Requests */}
              <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Most Requested Blood Types
                </h3>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                  {['O+', 'A+', 'B+', 'O-', 'A-', 'AB+', 'B-', 'AB-'].map((bloodType) => (
                    <div key={bloodType} className="text-center">
                      <div className="bg-red-50 rounded-lg p-3 mb-2">
                        <div className="text-lg font-bold text-red-600">{bloodType}</div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {Math.floor(Math.random() * 20) + 5} requests
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Blood Request Form Modal */}
        {showRequestForm && (
          <BloodRequestForm
            hospitalId={hospital._id}
            onClose={() => setShowRequestForm(false)}
            onSuccess={() => {
              setShowRequestForm(false);
              // Refresh hospital data
              fetchHospitalDetails();
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default HospitalDetailsPage;