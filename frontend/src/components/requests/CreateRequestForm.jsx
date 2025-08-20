import { useState } from 'react';
import { requestService } from '../../services/requestService';
import { BLOOD_TYPES, URGENCY_LEVELS } from '../../utils/constants';
import Toast from '../common/Toast';
import FormContainer from '../forms/FormContainer';
import Input from '../forms/Input';
import Select from '../forms/Select';
import TextArea from '../forms/TextArea';

const CreateRequestForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    hospitalId: '',
    bloodType: '',
    unitsRequired: '',
    urgencyLevel: 'medium',
    requiredBy: '',
    reason: '',
    patientCondition: '',
    recipientId: '',
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const urgencyOptions = Object.entries(URGENCY_LEVELS).map(([key, value]) => ({
    value,
    label: key.charAt(0) + key.slice(1).toLowerCase()
  }));

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.hospitalId) {
      setError('Hospital ID is required');
      return false;
    }
    if (!formData.bloodType) {
      setError('Blood type is required');
      return false;
    }
    if (!formData.unitsRequired || formData.unitsRequired < 1) {
      setError('Units required must be at least 1');
      return false;
    }
    if (!formData.requiredBy) {
      setError('Required by date is required');
      return false;
    }
    if (new Date(formData.requiredBy) <= new Date()) {
      setError('Required by date must be in the future');
      return false;
    }
    if (!formData.patientCondition) {
      setError('Patient condition is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setError('');

      const requestData = {
        ...formData,
        unitsRequired: parseInt(formData.unitsRequired),
        requiredBy: new Date(formData.requiredBy).toISOString()
      };

      const response = await requestService.createRequest(requestData);

      if (response.success) {
        onSuccess && onSuccess(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to create blood request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      {error && <Toast type="error" message={error} onClose={() => setError('')} />}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Hospital ID"
          name="hospitalId"
          value={formData.hospitalId}
          onChange={handleChange}
          required
          placeholder="Enter hospital ID"
        />

        <Select
          label="Blood Type"
          name="bloodType"
          value={formData.bloodType}
          onChange={handleChange}
          options={BLOOD_TYPES.map(type => ({ value: type, label: type }))}
          required
          placeholder="Select blood type"
        />

        <Input
          label="Units Required"
          name="unitsRequired"
          type="number"
          value={formData.unitsRequired}
          onChange={handleChange}
          required
          placeholder="Enter number of units"
          min="1"
        />

        <Select
          label="Urgency Level"
          name="urgencyLevel"
          value={formData.urgencyLevel}
          onChange={handleChange}
          options={urgencyOptions}
          required
        />

        <Input
          label="Required By"
          name="requiredBy"
          type="datetime-local"
          value={formData.requiredBy}
          onChange={handleChange}
          required
          min={new Date().toISOString().slice(0, 16)}
        />

        <Input
          label="Recipient ID (Optional)"
          name="recipientId"
          value={formData.recipientId}
          onChange={handleChange}
          placeholder="Enter recipient ID if available"
        />
      </div>

      <div className="mt-6">
        <TextArea
          label="Patient Condition"
          name="patientCondition"
          value={formData.patientCondition}
          onChange={handleChange}
          required
          placeholder="Describe the patient's medical condition requiring blood transfusion"
          rows={3}
        />
      </div>

      <div className="mt-6">
        <TextArea
          label="Reason for Request"
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          placeholder="Provide the reason for this blood request (surgery, emergency, etc.)"
          rows={3}
        />
      </div>

      <div className="mt-6">
        <TextArea
          label="Additional Notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Any additional information or special requirements"
          rows={2}
        />
      </div>

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
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Creating Request...' : 'Create Blood Request'}
        </button>
      </div>
    </FormContainer>
  );
};

export default CreateRequestForm;