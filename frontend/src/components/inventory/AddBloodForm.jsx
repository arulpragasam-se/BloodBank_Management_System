import { useState } from 'react';
import { inventoryService } from '../../services/inventoryService';
import Toast from '../common/Toast';
import FormContainer from '../forms/FormContainer';
import Input from '../forms/Input';
import Select from '../forms/Select';
import TextArea from '../forms/TextArea';

const AddBloodForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    bloodType: '',
    units: '',
    donorId: '',
    collectionDate: '',
    expiryDate: '',
    testResults: {
      hiv: 'pending',
      hepatitisB: 'pending',
      hepatitisC: 'pending',
      syphilis: 'pending'
    },
    storageLocation: {
      section: '',
      shelf: '',
      position: ''
    },
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const testResultOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'negative', label: 'Negative' },
    { value: 'positive', label: 'Positive' }
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

  const calculateExpiryDate = (collectionDate) => {
    if (!collectionDate) return '';
    const collection = new Date(collectionDate);
    const expiry = new Date(collection);
    expiry.setDate(collection.getDate() + 42); // 42 days shelf life
    return expiry.toISOString().split('T')[0];
  };

  const handleCollectionDateChange = (name, value) => {
    handleChange(name, value);
    const expiryDate = calculateExpiryDate(value);
    handleChange('expiryDate', expiryDate);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const bloodData = {
        ...formData,
        units: parseInt(formData.units),
        collectionDate: new Date(formData.collectionDate).toISOString(),
        expiryDate: new Date(formData.expiryDate).toISOString()
      };

      const response = await inventoryService.addBloodInventory(bloodData);

      if (response.success) {
        onSuccess && onSuccess(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to add blood inventory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      {error && <Toast type="error" message={error} onClose={() => setError('')} />}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Blood Type"
          name="bloodType"
          value={formData.bloodType}
          onChange={handleChange}
          options={bloodTypes.map(type => ({ value: type, label: type }))}
          required
          placeholder="Select blood type"
        />

        <Input
          label="Units"
          name="units"
          type="number"
          value={formData.units}
          onChange={handleChange}
          required
          placeholder="Enter number of units"
          min="1"
        />

        <Input
          label="Donor ID"
          name="donorId"
          value={formData.donorId}
          onChange={handleChange}
          required
          placeholder="Enter donor ID"
        />

        <Input
          label="Collection Date"
          name="collectionDate"
          type="date"
          value={formData.collectionDate}
          onChange={handleCollectionDateChange}
          required
        />

        <Input
          label="Expiry Date"
          name="expiryDate"
          type="date"
          value={formData.expiryDate}
          onChange={handleChange}
          required
          readOnly
        />
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Test Results</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="HIV Test"
            name="testResults.hiv"
            value={formData.testResults.hiv}
            onChange={handleChange}
            options={testResultOptions}
            required
          />

          <Select
            label="Hepatitis B Test"
            name="testResults.hepatitisB"
            value={formData.testResults.hepatitisB}
            onChange={handleChange}
            options={testResultOptions}
            required
          />

          <Select
            label="Hepatitis C Test"
            name="testResults.hepatitisC"
            value={formData.testResults.hepatitisC}
            onChange={handleChange}
            options={testResultOptions}
            required
          />

          <Select
            label="Syphilis Test"
            name="testResults.syphilis"
            value={formData.testResults.syphilis}
            onChange={handleChange}
            options={testResultOptions}
            required
          />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Storage Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label="Section"
            name="storageLocation.section"
            value={formData.storageLocation.section}
            onChange={handleChange}
            placeholder="e.g., A, B, C"
          />

          <Input
            label="Shelf"
            name="storageLocation.shelf"
            value={formData.storageLocation.shelf}
            onChange={handleChange}
            placeholder="e.g., 1, 2, 3"
          />

          <Input
            label="Position"
            name="storageLocation.position"
            value={formData.storageLocation.position}
            onChange={handleChange}
            placeholder="e.g., L, R, C"
          />
        </div>
      </div>

      <div className="mt-6">
        <TextArea
          label="Notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Enter any additional notes"
          rows={3}
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
          {loading ? 'Adding...' : 'Add Blood Inventory'}
        </button>
      </div>
    </FormContainer>
  );
};

export default AddBloodForm;