import { useState } from 'react';
import { reportService } from '../../services/reportService';
import { BLOOD_TYPES } from '../../utils/constants';
import Toast from '../common/Toast';
import FormContainer from '../forms/FormContainer';
import Input from '../forms/Input';
import Select from '../forms/Select';

const GenerateReportForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    reportType: '',
    dateFrom: '',
    dateTo: '',
    bloodType: '',
    status: '',
    hospitalId: '',
    format: 'json'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reportTypes = [
    { value: 'donors', label: 'Donor Report' },
    { value: 'inventory', label: 'Blood Inventory Report' },
    { value: 'campaigns', label: 'Campaign Performance Report' },
    { value: 'requests', label: 'Blood Requests Report' },
    { value: 'donations', label: 'Donations Report' },
    { value: 'wastage', label: 'Blood Wastage Report' },
    { value: 'hospital-performance', label: 'Hospital Performance Report' }
  ];

  const formatOptions = [
    { value: 'json', label: 'JSON' },
    { value: 'csv', label: 'CSV' },
    { value: 'pdf', label: 'PDF' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const params = {
        from: formData.dateFrom,
        to: formData.dateTo,
        bloodType: formData.bloodType,
        status: formData.status,
        hospitalId: formData.hospitalId,
        format: formData.format
      };

      // Remove empty parameters
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      let response;
      switch (formData.reportType) {
        case 'donors':
          response = await reportService.generateDonorReport(params);
          break;
        case 'inventory':
          response = await reportService.generateInventoryReport(params);
          break;
        case 'campaigns':
          response = await reportService.generateCampaignReport(params);
          break;
        case 'requests':
          response = await reportService.generateRequestsReport(params);
          break;
        case 'donations':
          response = await reportService.generateDonationsReport(params);
          break;
        case 'wastage':
          response = await reportService.generateWastageReport(params);
          break;
        case 'hospital-performance':
          response = await reportService.generateHospitalPerformanceReport(params);
          break;
        default:
          throw new Error('Please select a report type');
      }

      if (response.success) {
        onSuccess && onSuccess(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      {error && <Toast type="error" message={error} onClose={() => setError('')} />}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Report Type"
          name="reportType"
          value={formData.reportType}
          onChange={handleChange}
          options={reportTypes}
          required
          placeholder="Select report type"
        />

        <Select
          label="Output Format"
          name="format"
          value={formData.format}
          onChange={handleChange}
          options={formatOptions}
          required
        />

        <Input
          label="Date From"
          name="dateFrom"
          type="date"
          value={formData.dateFrom}
          onChange={handleChange}
        />

        <Input
          label="Date To"
          name="dateTo"
          type="date"
          value={formData.dateTo}
          onChange={handleChange}
        />

        <Select
          label="Blood Type (Optional)"
          name="bloodType"
          value={formData.bloodType}
          onChange={handleChange}
          options={BLOOD_TYPES.map(type => ({ value: type, label: type }))}
          placeholder="Filter by blood type"
        />

        <Select
          label="Status (Optional)"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={statusOptions}
          placeholder="Filter by status"
        />

        <Input
          label="Hospital ID (Optional)"
          name="hospitalId"
          value={formData.hospitalId}
          onChange={handleChange}
          placeholder="Filter by hospital ID"
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
          disabled={loading || !formData.reportType}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>
    </FormContainer>
  );
};

export default GenerateReportForm;