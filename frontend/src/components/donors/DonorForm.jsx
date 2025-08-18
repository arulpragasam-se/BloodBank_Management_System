import {
    CalendarIcon,
    EnvelopeIcon,
    PhoneIcon,
    RulerIcon,
    ScaleIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import { useNotification } from '../../hooks/useNotifications';
import { register } from '../../services/authService';
import { updateDonor } from '../../services/donorService';
import { BLOOD_TYPES } from '../../utils/constants';
import FormContainer from '../forms/FormContainer';
import Input from '../forms/Input';
import Select from '../forms/Select';
import TextArea from '../forms/TextArea';

const DonorForm = ({ donor = null, isEdit = false }) => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);

  const initialValues = {
    // User data
    name: donor?.userId?.name || '',
    email: donor?.userId?.email || '',
    phone: donor?.userId?.phone || '',
    password: '',
    confirmPassword: '',
    
    // Donor specific data
    bloodType: donor?.bloodType || '',
    dateOfBirth: donor?.dateOfBirth ? donor.dateOfBirth.split('T')[0] : '',
    weight: donor?.weight || '',
    height: donor?.height || '',
    
    // Address
    street: donor?.address?.street || '',
    city: donor?.address?.city || '',
    district: donor?.address?.district || '',
    zipCode: donor?.address?.zipCode || '',
    
    // Emergency Contact
    emergencyContactName: donor?.emergencyContact?.name || '',
    emergencyContactPhone: donor?.emergencyContact?.phone || '',
    emergencyContactRelationship: donor?.emergencyContact?.relationship || '',
    
    // Medical History
    allergies: donor?.medicalHistory?.allergies?.join(', ') || '',
    medications: donor?.medicalHistory?.medications?.join(', ') || '',
    diseases: donor?.medicalHistory?.diseases?.join(', ') || '',
    surgeries: donor?.medicalHistory?.surgeries?.join(', ') || '',
  };

  const validationRules = {
    name: { required: true, type: 'string', minLength: 2, maxLength: 50 },
    email: { required: true, type: 'email' },
    phone: { required: true, type: 'phone' },
    bloodType: { required: true, type: 'bloodType' },
    dateOfBirth: { required: true, type: 'date' },
    weight: { required: true, type: 'number', min: 30, max: 300 },
    height: { required: true, type: 'number', min: 100, max: 250 },
    ...(!isEdit && {
      password: { required: true, type: 'password' },
      confirmPassword: { required: true, type: 'string' },
    }),
  };

  const form = useForm({
    initialValues,
    validationRules,
    onSubmit: handleSubmit,
  });

  // Custom validation for password confirmation
  useEffect(() => {
    if (!isEdit && form.values.confirmPassword && form.values.password !== form.values.confirmPassword) {
      form.setFieldError('confirmPassword', 'Passwords do not match');
    } else {
      form.clearFieldError('confirmPassword');
    }
  }, [form.values.password, form.values.confirmPassword, isEdit]);

  async function handleSubmit(values) {
    try {
      setLoading(true);

      const userData = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        role: 'donor',
        ...(values.password && { password: values.password }),
      };

      const donorData = {
        bloodType: values.bloodType,
        dateOfBirth: values.dateOfBirth,
        weight: parseFloat(values.weight),
        height: parseFloat(values.height),
        address: {
          street: values.street,
          city: values.city,
          district: values.district,
          zipCode: values.zipCode,
        },
        emergencyContact: {
          name: values.emergencyContactName,
          phone: values.emergencyContactPhone,
          relationship: values.emergencyContactRelationship,
        },
        medicalHistory: {
          allergies: values.allergies ? values.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
          medications: values.medications ? values.medications.split(',').map(s => s.trim()).filter(Boolean) : [],
          diseases: values.diseases ? values.diseases.split(',').map(s => s.trim()).filter(Boolean) : [],
          surgeries: values.surgeries ? values.surgeries.split(',').map(s => s.trim()).filter(Boolean) : [],
        },
      };

      if (isEdit) {
        const response = await updateDonor(donor._id, donorData);
        if (response.success) {
          showSuccess('Donor updated successfully');
          navigate(`/donors/${donor._id}`);
        }
      } else {
        const response = await register({ ...userData, additionalData: donorData });
        if (response.success) {
          showSuccess('Donor registered successfully');
          navigate('/donors');
        }
      }
    } catch (error) {
      showError(error.message || `Failed to ${isEdit ? 'update' : 'register'} donor`);
    } finally {
      setLoading(false);
    }
  }

  const bloodTypeOptions = BLOOD_TYPES.map(type => ({
    label: type,
    value: type,
  }));

  const relationshipOptions = [
    { label: 'Parent', value: 'parent' },
    { label: 'Spouse', value: 'spouse' },
    { label: 'Sibling', value: 'sibling' },
    { label: 'Child', value: 'child' },
    { label: 'Friend', value: 'friend' },
    { label: 'Other', value: 'other' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Donor' : 'Register New Donor'}
        </h1>
        <p className="text-gray-600">
          {isEdit ? 'Update donor information' : 'Add a new blood donor to the system'}
        </p>
      </div>

      <FormContainer onSubmit={form.handleSubmit}>
        <div className="space-y-8">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Personal Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                icon={UserIcon}
                required
                {...form.getFieldProps('name')}
                error={form.getFieldState('name').error}
              />
              
              <Input
                label="Email Address"
                type="email"
                icon={EnvelopeIcon}
                required
                disabled={isEdit}
                {...form.getFieldProps('email')}
                error={form.getFieldState('email').error}
              />
              
              <Input
                label="Phone Number"
                type="tel"
                icon={PhoneIcon}
                required
                {...form.getFieldProps('phone')}
                error={form.getFieldState('phone').error}
              />
              
              <Select
                label="Blood Type"
                required
                options={bloodTypeOptions}
                {...form.getFieldProps('bloodType')}
                error={form.getFieldState('bloodType').error}
              />
            </div>

            {!isEdit && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Input
                  label="Password"
                  type="password"
                  required
                  {...form.getFieldProps('password')}
                  error={form.getFieldState('password').error}
                />
                
                <Input
                  label="Confirm Password"
                  type="password"
                  required
                  {...form.getFieldProps('confirmPassword')}
                  error={form.getFieldState('confirmPassword').error}
                />
              </div>
            )}
          </div>

          {/* Physical Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Physical Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Date of Birth"
                type="date"
                icon={CalendarIcon}
                required
                {...form.getFieldProps('dateOfBirth')}
                error={form.getFieldState('dateOfBirth').error}
              />
              
              <Input
                label="Weight (kg)"
                type="number"
                min="30"
                max="300"
                icon={ScaleIcon}
                required
                {...form.getFieldProps('weight')}
                error={form.getFieldState('weight').error}
              />
              
              <Input
                label="Height (cm)"
                type="number"
                min="100"
                max="250"
                icon={RulerIcon}
                required
                {...form.getFieldProps('height')}
                error={form.getFieldState('height').error}
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Address Information
            </h2>
            
            <div className="space-y-6">
              <Input
                label="Street Address"
                {...form.getFieldProps('street')}
                error={form.getFieldState('street').error}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  label="City"
                  {...form.getFieldProps('city')}
                  error={form.getFieldState('city').error}
                />
                
                <Input
                  label="District"
                  {...form.getFieldProps('district')}
                  error={form.getFieldState('district').error}
                />
                
                <Input
                  label="Zip Code"
                  {...form.getFieldProps('zipCode')}
                  error={form.getFieldState('zipCode').error}
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Emergency Contact
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Contact Name"
                {...form.getFieldProps('emergencyContactName')}
                error={form.getFieldState('emergencyContactName').error}
              />
              
              <Input
                label="Contact Phone"
                type="tel"
                {...form.getFieldProps('emergencyContactPhone')}
                error={form.getFieldState('emergencyContactPhone').error}
              />
              
              <Select
                label="Relationship"
                options={relationshipOptions}
                {...form.getFieldProps('emergencyContactRelationship')}
                error={form.getFieldState('emergencyContactRelationship').error}
              />
            </div>
          </div>

          {/* Medical History */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Medical History
            </h2>
            
            <div className="space-y-6">
              <TextArea
                label="Allergies"
                placeholder="List any allergies, separated by commas"
                rows={2}
                {...form.getFieldProps('allergies')}
                error={form.getFieldState('allergies').error}
              />
              
              <TextArea
                label="Current Medications"
                placeholder="List current medications, separated by commas"
                rows={2}
                {...form.getFieldProps('medications')}
                error={form.getFieldState('medications').error}
              />
              
              <TextArea
                label="Previous Diseases"
                placeholder="List any previous diseases, separated by commas"
                rows={2}
                {...form.getFieldProps('diseases')}
                error={form.getFieldState('diseases').error}
              />
              
              <TextArea
                label="Previous Surgeries"
                placeholder="List any previous surgeries, separated by commas"
                rows={2}
                {...form.getFieldProps('surgeries')}
                error={form.getFieldState('surgeries').error}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/donors')}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !form.isValid}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {isEdit ? 'Updating...' : 'Registering...'}
                </div>
              ) : (
                isEdit ? 'Update Donor' : 'Register Donor'
              )}
            </button>
          </div>
        </div>
      </FormContainer>
    </div>
  );
};

export default DonorForm;