import { Activity, AlertTriangle, Calendar, Droplet, Mail, Phone, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { recipientService } from '../../services/recipientService';
import Loading from '../common/Loading';
import StatsCard from '../common/StatsCard';
import Toast from '../common/Toast';

const RecipientProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await recipientService.getRecipientById(id);
      
      if (response.success) {
        setProfile(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch recipient profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!profile) return <div>Recipient not found</div>;

  const { recipient, bloodRequests, compatibleBloodTypes, age } = profile;

  return (
    <div className="space-y-6">
      {error && <Toast type="error" message={error} onClose={() => setError('')} />}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mr-4">
              <User className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{recipient.userId?.name}</h1>
              <p className="text-gray-600">Blood Recipient • Age: {age} years</p>
            </div>
          </div>
          
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            recipient.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {recipient.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatsCard
            title="Blood Type"
            value={recipient.bloodType}
            icon={Droplet}
            color="red"
          />
          <StatsCard
            title="Transfusions"
            value={recipient.transfusionHistory?.length || 0}
            icon={Activity}
            color="blue"
          />
          <StatsCard
            title="Blood Requests"
            value={bloodRequests?.length || 0}
            icon={Calendar}
            color="purple"
          />
          <StatsCard
            title="Compatible Types"
            value={compatibleBloodTypes?.length || 0}
            icon={Droplet}
            color="green"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-900">{recipient.userId?.email}</span>
              </div>
              
              {recipient.userId?.phone && (
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{recipient.userId.phone}</span>
                </div>
              )}
              
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-900">
                  Born: {new Date(recipient.dateOfBirth).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-start">
                <Activity className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-gray-700">Medical Condition:</p>
                  <p className="text-gray-900">{recipient.medicalCondition}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="font-medium text-yellow-900">Emergency Contact</span>
              </div>
              <div className="space-y-1 text-sm">
                <p><strong>Name:</strong> {recipient.emergencyContact?.name}</p>
                <p><strong>Phone:</strong> {recipient.emergencyContact?.phone}</p>
                <p><strong>Relationship:</strong> {recipient.emergencyContact?.relationship}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Compatible Blood Types</h3>
          <div className="grid grid-cols-4 gap-2">
            {compatibleBloodTypes?.map((bloodType) => (
              <div
                key={bloodType}
                className="text-center p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <span className="text-green-800 font-medium">{bloodType}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Medical Information</h3>
          
          {recipient.allergies?.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Allergies:</h4>
              <div className="flex flex-wrap gap-2">
                {recipient.allergies.map((allergy, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm"
                  >
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {recipient.currentMedications?.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Current Medications:</h4>
              <div className="flex flex-wrap gap-2">
                {recipient.currentMedications.map((medication, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                  >
                    {medication}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {bloodRequests?.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Blood Requests</h3>
          <div className="space-y-3">
            {bloodRequests.slice(0, 5).map((request) => (
              <div key={request._id} className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <p className="font-medium">Blood Type: {request.bloodType}</p>
                  <p className="text-sm text-gray-600">
                    Hospital: {request.hospitalId?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Requested: {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  request.status === 'fulfilled' ? 'bg-green-100 text-green-800' :
                  request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {request.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipientProfile;