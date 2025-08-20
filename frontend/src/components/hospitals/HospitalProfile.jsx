import { Activity, Calendar, Mail, MapPin, Phone, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { hospitalService } from '../../services/hospitalService';
import Loading from '../common/Loading';
import StatsCard from '../common/StatsCard';
import Toast from '../common/Toast';

const HospitalProfile = () => {
  const { id } = useParams();
  const [hospital, setHospital] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHospitalDetails();
  }, [id]);

  const fetchHospitalDetails = async () => {
    try {
      setLoading(true);
      const response = await hospitalService.getHospitalById(id);
      
      if (response.success) {
        setHospital(response.data.hospital);
        setRecentRequests(response.data.recentRequests || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch hospital details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!hospital) return <div>Hospital not found</div>;

  return (
    <div className="space-y-6">
      {error && <Toast type="error" message={error} onClose={() => setError('')} />}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{hospital.name}</h1>
            <p className="text-gray-600">Registration No: {hospital.registrationNumber}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            hospital.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {hospital.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatsCard
            title="Staff Members"
            value={hospital.staffMembers?.length || 0}
            icon={Users}
            color="blue"
          />
          <StatsCard
            title="Blood Bank Capacity"
            value={hospital.bloodBankCapacity}
            icon={Activity}
            color="purple"
          />
          <StatsCard
            title="Recent Requests"
            value={recentRequests.length}
            icon={Calendar}
            color="green"
          />
          <StatsCard
            title="Active Since"
            value={new Date(hospital.createdAt).getFullYear()}
            icon={Calendar}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-gray-900">{hospital.address.street}</p>
                  <p className="text-gray-600">{hospital.address.city}, {hospital.address.district}</p>
                  {hospital.address.zipCode && <p className="text-gray-600">{hospital.address.zipCode}</p>}
                </div>
              </div>
              
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-900">{hospital.contactInfo.phone}</span>
              </div>
              
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-900">{hospital.contactInfo.email}</span>
              </div>
              
              {hospital.contactInfo.emergencyPhone && (
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-red-400 mr-3" />
                  <span className="text-gray-900">Emergency: {hospital.contactInfo.emergencyPhone}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Staff Members</h3>
            <div className="space-y-2">
              {hospital.staffMembers?.length > 0 ? (
                hospital.staffMembers.map((staff, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <div>
                      <p className="font-medium">{staff.userId?.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">{staff.position}</p>
                    </div>
                    <span className="text-sm text-gray-500">{staff.department}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No staff members assigned</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {recentRequests.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Blood Requests</h3>
          <div className="space-y-3">
            {recentRequests.map((request) => (
              <div key={request._id} className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <p className="font-medium">Blood Type: {request.recipientId?.bloodType}</p>
                  <p className="text-sm text-gray-600">
                    Requested by: {request.requestedBy?.name}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    request.status === 'fulfilled' ? 'bg-green-100 text-green-800' :
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {request.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalProfile;