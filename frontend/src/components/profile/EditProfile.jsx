import { useEffect, useState } from 'react';
import { authService } from '../../services/authService';
import { BLOOD_TYPES, USER_ROLES } from '../../utils/constants';
import Toast from '../common/Toast';
import FormContainer from '../forms/FormContainer';
import Input from '../forms/Input';
import Select from '../forms/Select';

const EditProfile = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    profileImage: '',
    additionalData: {}
  });
  
  const [currentProfile, setCurrentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getProfile();
      
      if (response.success) {
        const { user, profile } = response.data;
        setCurrentProfile(response.data);
        setFormData({
          name: user.name || '',
          phone: user.phone || '',
          profileImage: user.profileImage || '',
          additionalData: profile || {}
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name, value) => {
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');

      const response = await authService.updateProfile(formData);

      if (response.success) {
        onSuccess && onSuccess(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!currentProfile) return <div>Profile not found</div>;

  const { user } = currentProfile;

  return (
    <FormContainer onSubmit={handleSubmit}>
      {error && <Toast type="error" message={error} onClose={() => setError('')} />}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Enter your full name"
        />

        <Input
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter your phone number"
        />

        <Input
          label="Profile Image URL"
          name="profileImage"
          value={formData.profileImage}
          onChange={handleChange}
          placeholder="Enter profile image URL"
        />

        <Input
          label="Email"
          name="email"
          value={user.email}
          disabled
          readOnly
          className="bg-gray-100"
        />
      </div>

      {user.role === USER_ROLES.DONOR && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Donor Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Blood Type"
              name="additionalData.bloodType"
              value={formData.additionalData.bloodType || ''}
              onChange={handleChange}
              options={BLOOD_TYPES.map(type => ({ value: type, label: type }))}
              placeholder="Select blood type"
            />

            <Input
              label="Date of Birth"
              name="additionalData.dateOfBirth"
              type="date"
              value={formData.additionalData.dateOfBirth ? 
                new Date(formData.additionalData.dateOfBirth).toISOString().split('T')[0] : ''}
              onChange={handleChange}
            />

            <Input
              label="Weight (kg)"
              name="additionalData.weight"
              type="number"
              value={formData.additionalData.weight || ''}
              onChange={handleChange}
              placeholder="Enter weight in kg"
              min="30"
              max="200"
            />

            <Input
              label="Emergency Contact"
              name="additionalData.emergencyContact"
              value={formData.additionalData.emergencyContact || ''}
              onChange={handleChange}
              placeholder="Enter emergency contact number"
            />
          </div>
        </div>
      )}

      {user.role === USER_ROLES.RECIPIENT && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Recipient Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Blood Type"
              name="additionalData.bloodType"
              value={formData.additionalData.bloodType || ''}
              onChange={handleChange}
              options={BLOOD_TYPES.map(type => ({ value: type, label: type }))}
              placeholder="Select blood type"
            />

            <Input
              label="Medical Condition"
              name="additionalData.medicalCondition"
              value={formData.additionalData.medicalCondition || ''}
              onChange={handleChange}
              placeholder="Enter medical condition"
            />

            <Input
              label="Emergency Contact"
              name="additionalData.emergencyContact"
              value={formData.additionalData.emergencyContact || ''}
              onChange={handleChange}
              placeholder="Enter emergency contact number"
            />

            <Input
              label="Date of Birth"
              name="additionalData.dateOfBirth"
              type="date"
              value={formData.additionalData.dateOfBirth ? 
                new Date(formData.additionalData.dateOfBirth).toISOString().split('T')[0] : ''}
              onChange={handleChange}
            />
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-4 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </FormContainer>
  );
};

export default EditProfile;