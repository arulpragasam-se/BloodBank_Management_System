import { Calendar, Edit, Mail, Phone, Shield, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { authService } from '../../services/authService';
import Loading from '../common/Loading';
import Toast from '../common/Toast';

const UserProfile = ({ onEdit }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getProfile();
      
      if (response.success) {
        setProfile(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      hospital_staff: 'bg-blue-100 text-blue-800',
      donor: 'bg-green-100 text-green-800',
      recipient: 'bg-orange-100 text-orange-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Administrator',
      hospital_staff: 'Hospital Staff',
      donor: 'Blood Donor',
      recipient: 'Blood Recipient'
    };
    return labels[role] || role;
  };

  if (loading) return <Loading />;
  if (!profile) return <div>Profile not found</div>;

  const { user, profile: additionalData } = profile;

  return (
    <div className="space-y-6">
      {error && <Toast type="error" message={error} onClose={() => setError('')} />}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mr-4">
              {user.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt={user.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                {getRoleLabel(user.role)}
              </span>
            </div>
          </div>
          
          <button
            onClick={onEdit}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            
            <div className="flex items-center text-gray-600">
              <Mail className="w-5 h-5 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center text-gray-600">
              <Phone className="w-5 h-5 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{user.phone || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="flex items-center text-gray-600">
              <Calendar className="w-5 h-5 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="flex items-center text-gray-600">
              <Shield className="w-5 h-5 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Account Status</p>
                <span className={`font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {additionalData && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {user.role === 'donor' ? 'Donor Information' : 'Additional Information'}
              </h3>
              
              {user.role === 'donor' && (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Blood Type</p>
                    <p className="font-medium text-red-600">{additionalData.bloodType}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-medium">{new Date(additionalData.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Weight</p>
                    <p className="font-medium">{additionalData.weight} kg</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Total Donations</p>
                    <p className="font-medium">{additionalData.donationCount || 0}</p>
                  </div>
                  
                  {additionalData.lastDonationDate && (
                    <div>
                      <p className="text-sm text-gray-500">Last Donation</p>
                      <p className="font-medium">{new Date(additionalData.lastDonationDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-gray-500">Eligibility Status</p>
                    <span className={`font-medium ${additionalData.isEligible ? 'text-green-600' : 'text-red-600'}`}>
                      {additionalData.isEligible ? 'Eligible' : 'Not Eligible'}
                    </span>
                  </div>
                </>
              )}
              
              {user.role === 'recipient' && (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Blood Type</p>
                    <p className="font-medium text-red-600">{additionalData.bloodType}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Medical Condition</p>
                    <p className="font-medium">{additionalData.medicalCondition || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Emergency Contact</p>
                    <p className="font-medium">{additionalData.emergencyContact || 'Not provided'}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;