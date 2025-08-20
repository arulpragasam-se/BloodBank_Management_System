import { useState } from 'react';
import { notificationService } from '../../services/notificationService';
import Toast from '../common/Toast';
import FormContainer from '../forms/FormContainer';
import Input from '../forms/Input';
import Select from '../forms/Select';
import TextArea from '../forms/TextArea';

const SendNotificationForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    recipient: '',
    type: '',
    title: '',
    message: '',
    channels: {
      sms: false,
      email: false,
      inApp: true
    },
    data: {
      campaignId: '',
      donationId: '',
      requestId: '',
      inventoryId: ''
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const notificationTypes = [
    { value: 'appointment_reminder', label: 'Appointment Reminder' },
    { value: 'eligibility_update', label: 'Eligibility Update' },
    { value: 'campaign_invitation', label: 'Campaign Invitation' },
    { value: 'blood_request', label: 'Blood Request' },
    { value: 'low_stock_alert', label: 'Low Stock Alert' },
    { value: 'expiry_alert', label: 'Expiry Alert' },
    { value: 'donation_thanks', label: 'Donation Thanks' },
    { value: 'test_results', label: 'Test Results' },
    { value: 'emergency_request', label: 'Emergency Request' }
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

  const handleChannelChange = (channel, checked) => {
    setFormData(prev => ({
      ...prev,
      channels: { ...prev.channels, [channel]: checked }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      // Filter out empty data fields
      const filteredData = Object.fromEntries(
        Object.entries(formData.data).filter(([key, value]) => value.trim() !== '')
      );

      const notificationData = {
        ...formData,
        data: Object.keys(filteredData).length > 0 ? filteredData : undefined
      };

      const response = await notificationService.sendNotification(notificationData);

      if (response.success) {
        onSuccess && onSuccess(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      {error && <Toast type="error" message={error} onClose={() => setError('')} />}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Recipient User ID"
          name="recipient"
          value={formData.recipient}
          onChange={handleChange}
          required
          placeholder="Enter recipient user ID"
        />

        <Select
          label="Notification Type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          options={notificationTypes}
          required
          placeholder="Select notification type"
        />
      </div>

      <Input
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        required
        placeholder="Enter notification title"
      />

      <TextArea
        label="Message"
        name="message"
        value={formData.message}
        onChange={handleChange}
        required
        placeholder="Enter notification message"
        rows={4}
      />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Delivery Channels</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.channels.inApp}
              onChange={(e) => handleChannelChange('inApp', e.target.checked)}
              className="mr-2"
            />
            In-App Notification
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.channels.sms}
              onChange={(e) => handleChannelChange('sms', e.target.checked)}
              className="mr-2"
            />
            SMS Notification
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.channels.email}
              onChange={(e) => handleChannelChange('email', e.target.checked)}
              className="mr-2"
            />
            Email Notification
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Additional Data (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Campaign ID"
            name="data.campaignId"
            value={formData.data.campaignId}
            onChange={handleChange}
            placeholder="Enter campaign ID"
          />

          <Input
            label="Donation ID"
            name="data.donationId"
            value={formData.data.donationId}
            onChange={handleChange}
            placeholder="Enter donation ID"
          />

          <Input
            label="Request ID"
            name="data.requestId"
            value={formData.data.requestId}
            onChange={handleChange}
            placeholder="Enter request ID"
          />

          <Input
            label="Inventory ID"
            name="data.inventoryId"
            value={formData.data.inventoryId}
            onChange={handleChange}
            placeholder="Enter inventory ID"
          />
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
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Notification'}
        </button>
      </div>
    </FormContainer>
  );
};

export default SendNotificationForm;