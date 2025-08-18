import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { useForm } from '../../hooks/useForm';
import { useNotification } from '../../hooks/useNotifications';
import { createCampaign } from '../../services/campaignService';
import { BLOOD_TYPES } from '../../utils/constants';
import DatePicker from '../forms/DatePicker';
import FormContainer from '../forms/FormContainer';
import Input from '../forms/Input';
import Select from '../forms/Select';
import TextArea from '../forms/TextArea';

const CreateCampaignForm = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { loading, execute } = useApi();

  const validationRules = {
    title: { required: true, type: 'string', minLength: 5, maxLength: 100 },
    description: { required: true, type: 'string', minLength: 10, maxLength: 500 },
    startDate: { required: true, type: 'date' },
    endDate: { required: true, type: 'date' },
    venue: { required: true, type: 'string', minLength: 3, maxLength: 100 },
    address: { required: true, type: 'string', minLength: 10, maxLength: 200 },
    city: { required: true, type: 'string', minLength: 2, maxLength: 50 },
    district: { required: true, type: 'string', minLength: 2, maxLength: 50 },
    targetDonors: { type: 'number', min: 1, max: 1000 },
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
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      venue: '',
      address: '',
      city: '',
      district: '',
      targetBloodTypes: [],
      targetDonors: '',
      isPublic: true,
    },
    validationRules,
    onSubmit: async (formData) => {
      await execute(
        () => createCampaign({
          ...formData,
          location: {
            venue: formData.venue,
            address: formData.address,
            city: formData.city,
            district: formData.district,
          },
          targetDonors: formData.targetDonors ? parseInt(formData.targetDonors) : 0,
        }),
        {
          onSuccess: (response) => {
            showSuccess('Campaign created successfully');
            navigate(`/campaigns/${response.data.campaign._id}`);
          },
          onError: (error) => {
            showError(error.message || 'Failed to create campaign');
          },
        }
      );
    },
  });

  const bloodTypeOptions = BLOOD_TYPES.map(type => ({
    value: type,
    label: type,
  }));

  const districtOptions = [
    { value: '', label: 'Select District' },
    { value: 'Colombo', label: 'Colombo' },
    { value: 'Gampaha', label: 'Gampaha' },
    { value: 'Kalutara', label: 'Kalutara' },
    { value: 'Kandy', label: 'Kandy' },
    { value: 'Matale', label: 'Matale' },
    { value: 'Nuwara Eliya', label: 'Nuwara Eliya' },
    { value: 'Galle', label: 'Galle' },
    { value: 'Matara', label: 'Matara' },
    { value: 'Hambantota', label: 'Hambantota' },
    { value: 'Jaffna', label: 'Jaffna' },
    { value: 'Kilinochchi', label: 'Kilinochchi' },
    { value: 'Mannar', label: 'Mannar' },
    { value: 'Mullaitivu', label: 'Mullaitivu' },
    { value: 'Vavuniya', label: 'Vavuniya' },
    { value: 'Puttalam', label: 'Puttalam' },
    { value: 'Kurunegala', label: 'Kurunegala' },
    { value: 'Anuradhapura', label: 'Anuradhapura' },
    { value: 'Polonnaruwa', label: 'Polonnaruwa' },
    { value: 'Badulla', label: 'Badulla' },
    { value: 'Monaragala', label: 'Monaragala' },
    { value: 'Ratnapura', label: 'Ratnapura' },
    { value: 'Kegalle', label: 'Kegalle' },
    { value: 'Trincomalee', label: 'Trincomalee' },
    { value: 'Batticaloa', label: 'Batticaloa' },
    { value: 'Ampara', label: 'Ampara' },
  ];

  const handleBloodTypeChange = (selectedTypes) => {
    setFieldValue('targetBloodTypes', selectedTypes);
  };

  // Validate end date is after start date
  const validateDateRange = () => {
    if (values.startDate && values.endDate) {
      const start = new Date(values.startDate);
      const end = new Date(values.endDate);
      
      if (end <= start) {
        return 'End date must be after start date';
      }
    }
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Campaign</h1>
        <p className="mt-2 text-gray-600">
          Organize a blood donation campaign to help save lives in your community.
        </p>
      </div>

      <FormContainer onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Campaign Information
              </h2>
              
              <div className="space-y-4">
                <Input
                  label="Campaign Title"
                  required
                  {...getFieldProps('title')}
                  error={errors.title}
                  placeholder="Enter campaign title"
                />

                <TextArea
                  label="Description"
                  required
                  {...getFieldProps('description')}
                  error={errors.description}
                  placeholder="Describe the campaign purpose and goals"
                  rows={4}
                />

                <div className="grid grid-cols-2 gap-4">
                  <DatePicker
                    label="Start Date"
                    required
                    {...getFieldProps('startDate')}
                    error={errors.startDate}
                    min={new Date().toISOString().split('T')[0]}
                  />

                  <DatePicker
                    label="End Date"
                    required
                    {...getFieldProps('endDate')}
                    error={errors.endDate || validateDateRange()}
                    min={values.startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>

                <Input
                  label="Target Donors"
                  type="number"
                  {...getFieldProps('targetDonors')}
                  error={errors.targetDonors}
                  placeholder="Expected number of donors"
                  min="1"
                  max="1000"
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Location Details
              </h2>
              
              <div className="space-y-4">
                <Input
                  label="Venue Name"
                  required
                  {...getFieldProps('venue')}
                  error={errors.venue}
                  placeholder="e.g., Community Center, Hospital"
                />

                <TextArea
                  label="Address"
                  required
                  {...getFieldProps('address')}
                  error={errors.address}
                  placeholder="Enter complete address"
                  rows={3}
                />

                <Input
                  label="City"
                  required
                  {...getFieldProps('city')}
                  error={errors.city}
                  placeholder="Enter city name"
                />

                <Select
                  label="District"
                  required
                  options={districtOptions}
                  {...getFieldProps('district')}
                  error={errors.district}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Settings */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Additional Settings
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Blood Types (Optional)
              </label>
              <Select
                multiple
                options={bloodTypeOptions}
                value={values.targetBloodTypes}
                onChange={handleBloodTypeChange}
                placeholder="Select target blood types"
              />
              <p className="mt-1 text-sm text-gray-500">
                Leave empty to accept all blood types
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                checked={values.isPublic}
                onChange={(e) => setFieldValue('isPublic', e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                Make this campaign public
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/campaigns')}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="btn btn-primary"
            >
              {isSubmitting || loading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </div>
              ) : (
                'Create Campaign'
              )}
            </button>
          </div>
        </div>
      </FormContainer>
    </div>
  );
};

export default CreateCampaignForm;