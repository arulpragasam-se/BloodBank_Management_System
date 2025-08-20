import { useState } from 'react';
import { hospitalService } from '../../services/hospitalService';
import Toast from '../common/Toast';
import FormContainer from '../forms/FormContainer';
import Input from '../forms/Input';
import Select from '../forms/Select';

const HospitalForm = ({ hospital, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: hospital?.name || '',
    registrationNumber: hospital?.registrationNumber || '',
    address: {
      street: hospital?.address?.street || '',
      city: hospital?.address?.city || '',
      district: hospital?.address?.district || '',
      zipCode: hospital?.address?.zipCode || ''
    },
    contactInfo: {
      phone: hospital?.contactInfo?.phone || '',
      email: hospital?.contactInfo?.email || '',
      emergencyPhone: hospital?.contactInfo?.emergencyPhone || ''
    },
    bloodBankCapacity: hospital?.bloodBankCapacity || 0
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const districts = [
    'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh'
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

      let response;
      if (hospital?._id) {
        response = await hospitalService.updateHospital(hospital._id, formData);
      } else {
        response = await hospitalService.createHospital(formData);
      }

      if (response.success) {
        onSuccess && onSuccess(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to save hospital');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      {error && <Toast type="error" message={error} onClose={() => setError('')} />}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Hospital Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Enter hospital name"
        />

        <Input
          label="Registration Number"
          name="registrationNumber"
          value={formData.registrationNumber}
          onChange={handleChange}
          required
          placeholder="Enter registration number"
        />

        <Input
          label="Street Address"
          name="address.street"
          value={formData.address.street}
          onChange={handleChange}
          required
          placeholder="Enter street address"
        />

        <Input
          label="City"
          name="address.city"
          value={formData.address.city}
          onChange={handleChange}
          required
          placeholder="Enter city"
        />

        <Select
          label="District"
          name="address.district"
          value={formData.address.district}
          onChange={handleChange}
          options={districts.map(d => ({ value: d, label: d }))}
          required
          placeholder="Select district"
        />

        <Input
          label="Zip Code"
          name="address.zipCode"
          value={formData.address.zipCode}
          onChange={handleChange}
          placeholder="Enter zip code"
        />

        <Input
          label="Phone Number"
          name="contactInfo.phone"
          value={formData.contactInfo.phone}
          onChange={handleChange}
          required
          placeholder="Enter phone number"
        />

        <Input
          label="Email"
          name="contactInfo.email"
          type="email"
          value={formData.contactInfo.email}
          onChange={handleChange}
          required
          placeholder="Enter email address"
        />

        <Input
          label="Emergency Phone"
          name="contactInfo.emergencyPhone"
          value={formData.contactInfo.emergencyPhone}
          onChange={handleChange}
          placeholder="Enter emergency phone number"
        />

        <Input
          label="Blood Bank Capacity"
          name="bloodBankCapacity"
          type="number"
          value={formData.bloodBankCapacity}
          onChange={handleChange}
          placeholder="Enter blood bank capacity"
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
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : hospital?._id ? 'Update' : 'Create'} Hospital
        </button>
      </div>
    </FormContainer>
  );
};

export default HospitalForm;