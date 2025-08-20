import { useState } from 'react';
import { recipientService } from '../../services/recipientService';
import { BLOOD_TYPES } from '../../utils/constants';
import Toast from '../common/Toast';
import FormContainer from '../forms/FormContainer';
import Input from '../forms/Input';
import Select from '../forms/Select';
import TextArea from '../forms/TextArea';

const RecipientForm = ({ recipient, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    userId: recipient?.userId?._id || '',
    bloodType: recipient?.bloodType || '',
    dateOfBirth: recipient?.dateOfBirth ? 
      new Date(recipient.dateOfBirth).toISOString().split('T')[0] : '',
    medicalCondition: recipient?.medicalCondition || '',
    emergencyContact: {
      name: recipient?.emergencyContact?.name || '',
      phone: recipient?.emergencyContact?.phone || '',
      relationship: recipient?.emergencyContact?.relationship || ''
    },
    allergies: recipient?.allergies || [],
    currentMedications: recipient?.currentMedications || []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [allergyInput, setAllergyInput] = useState('');
  const [medicationInput, setMedicationInput] = useState('');

  const relationships = [
    { value: 'parent', label: 'Parent' },
    { value: 'spouse', label: 'Spouse' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'child', label: 'Child' },
    { value: 'friend', label: 'Friend' },
    { value: 'other', label: 'Other' }
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

  const addAllergy = () => {
    if (allergyInput.trim() && !formData.allergies.includes(allergyInput.trim())) {
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies, allergyInput.trim()]
      }));
      setAllergyInput('');
    }
  };

  const removeAllergy = (index) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  const addMedication = () => {
    if (medicationInput.trim() && !formData.currentMedications.includes(medicationInput.trim())) {
      setFormData(prev => ({
        ...prev,
        currentMedications: [...prev.currentMedications, medicationInput.trim()]
      }));
      setMedicationInput('');
    }
  };

  const removeMedication = (index) => {
    setFormData(prev => ({
      ...prev,
      currentMedications: prev.currentMedications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const recipientData = {
        ...formData,
        dateOfBirth: new Date(formData.dateOfBirth).toISOString()
      };

      let response;
      if (recipient?._id) {
        response = await recipientService.updateRecipient(recipient._id, recipientData);
      } else {
        // For new recipients, this would typically be handled in user registration
        response = { success: true, data: recipientData };
      }

      if (response.success) {
        onSuccess && onSuccess(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to save recipient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      {error && <Toast type="error" message={error} onClose={() => setError('')} />}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="User ID"
          name="userId"
          value={formData.userId}
          onChange={handleChange}
          required
          placeholder="Enter user ID"
          disabled={!!recipient}
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
          label="Date of Birth"
          name="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={handleChange}
          required
        />

        <TextArea
          label="Medical Condition"
          name="medicalCondition"
          value={formData.medicalCondition}
          onChange={handleChange}
          required
          placeholder="Enter medical condition details"
          rows={3}
        />
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label="Contact Name"
            name="emergencyContact.name"
            value={formData.emergencyContact.name}
            onChange={handleChange}
            required
            placeholder="Enter contact name"
          />

          <Input
            label="Contact Phone"
            name="emergencyContact.phone"
            value={formData.emergencyContact.phone}
            onChange={handleChange}
            required
            placeholder="Enter contact phone"
          />

          <Select
            label="Relationship"
            name="emergencyContact.relationship"
            value={formData.emergencyContact.relationship}
            onChange={handleChange}
            options={relationships}
            required
            placeholder="Select relationship"
          />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Allergies</h3>
        <div className="flex gap-2 mb-3">
          <Input
            label=""
            name="allergyInput"
            value={allergyInput}
            onChange={(name, value) => setAllergyInput(value)}
            placeholder="Enter allergy"
            className="flex-1"
          />
          <button
            type="button"
            onClick={addAllergy}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.allergies.map((allergy, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm flex items-center"
            >
              {allergy}
              <button
                type="button"
                onClick={() => removeAllergy(index)}
                className="ml-2 text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Current Medications</h3>
        <div className="flex gap-2 mb-3">
          <Input
            label=""
            name="medicationInput"
            value={medicationInput}
            onChange={(name, value) => setMedicationInput(value)}
            placeholder="Enter medication"
            className="flex-1"
          />
          <button
            type="button"
            onClick={addMedication}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.currentMedications.map((medication, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center"
            >
              {medication}
              <button
                type="button"
                onClick={() => removeMedication(index)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
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
          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : recipient?._id ? 'Update' : 'Create'} Recipient
        </button>
      </div>
    </FormContainer>
  );
};

export default RecipientForm;