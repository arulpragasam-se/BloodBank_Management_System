import { useState } from 'react';
import { requestService } from '../../services/requestService';
import Toast from '../common/Toast';
import FormContainer from '../forms/FormContainer';
import Input from '../forms/Input';
import Select from '../forms/Select';
import TextArea from '../forms/TextArea';

const BloodRequestForm = ({ hospitalId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    bloodType: '',
    quantity: '',
    urgencyLevel: '',
    recipientInfo: {
      name: '',
      age: '',
      bloodType: '',
      medicalCondition: ''
    },
    requiredBy: '',
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencyLevels = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

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
      setLoading(true);
      setError('');

      const requestData = {
        ...formData,
        hospitalId,
        quantity: parseInt(formData.quantity),
        recipientInfo: {
          ...formData.recipientInfo,
          age: parseInt(formData.recipientInfo.age)
        }
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
        <Select
          label="Blood Type Required"
          name="bloodType"
          value={formData.bloodType}
          onChange={handleChange}
          options={bloodTypes.map(type => ({ value: type, label: type }))}
          required
          placeholder="Select blood type"
        />

        <Input
          label="Quantity (Units)"
          name="quantity"
          type="number"
          value={formData.quantity}
          onChange={handleChange}
          required
          placeholder="Enter quantity in units"
          min="1"
        />

        <Select
          label="Urgency Level"
          name="urgencyLevel"
          value={formData.urgencyLevel}
          onChange={handleChange}
          options={urgencyLevels}
          required
          placeholder="Select urgency level"
        />

        <Input
          label="Required By"
          name="requiredBy"
          type="datetime-local"
          value={formData.requiredBy}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Recipient Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Recipient Name"
            name="recipientInfo.name"
            value={formData.recipientInfo.name}
            onChange={handleChange}
            required
            placeholder="Enter recipient name"
          />

          <Input
            label="Age"
            name="recipientInfo.age"
            type="number"
            value={formData.recipientInfo.age}
            onChange={handleChange}
            required
            placeholder="Enter age"
            min="1"
          />

          <Select
            label="Recipient Blood Type"
            name="recipientInfo.bloodType"
            value={formData.recipientInfo.bloodType}
            onChange={handleChange}
            options={bloodTypes.map(type => ({ value: type, label: type }))}
            required
            placeholder="Select blood type"
          />

          <Input
            label="Medical Condition"
            name="recipientInfo.medicalCondition"
            value={formData.recipientInfo.medicalCondition}
            onChange={handleChange}
            placeholder="Enter medical condition"
          />
        </div>
      </div>

      <div className="mt-6">
        <TextArea
          label="Additional Notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Enter any additional notes or requirements"
          rows={4}
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

export default BloodRequestForm;