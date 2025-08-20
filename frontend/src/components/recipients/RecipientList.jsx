import { useEffect, useState } from 'react';
import { recipientService } from '../../services/recipientService';
import { BLOOD_TYPES } from '../../utils/constants';
import FilterDropdown from '../common/FilterDropdown';
import Loading from '../common/Loading';
import SearchBar from '../common/SearchBar';
import Table from '../common/Table';
import Toast from '../common/Toast';

const RecipientList = () => {
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });

  const fetchRecipients = async (page = 1) => {
    try {
      setLoading(true);
      const params = { 
        page, 
        search, 
        bloodType: bloodTypeFilter 
      };
      const response = await recipientService.getAllRecipients(params);
      
      if (response.success) {
        setRecipients(response.data.recipients);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch recipients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipients();
  }, [search, bloodTypeFilter]);

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const columns = [
    { 
      key: 'userId.name', 
      label: 'Name',
      render: (value, recipient) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-orange-600 font-medium text-sm">
              {recipient.userId?.name?.charAt(0)}
            </span>
          </div>
          {recipient.userId?.name}
        </div>
      )
    },
    { 
      key: 'bloodType', 
      label: 'Blood Type',
      render: (value) => (
        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
          {value}
        </span>
      )
    },
    { 
      key: 'dateOfBirth', 
      label: 'Age',
      render: (value) => `${calculateAge(value)} years`
    },
    { key: 'medicalCondition', label: 'Medical Condition' },
    { key: 'userId.email', label: 'Email' },
    { key: 'userId.phone', label: 'Phone' },
    {
      key: 'transfusionHistory',
      label: 'Transfusions',
      render: (value) => value?.length || 0
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  const bloodTypeOptions = BLOOD_TYPES.map(type => ({ value: type, label: type }));

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {error && <Toast type="error" message={error} onClose={() => setError('')} />}
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search recipients..."
          className="flex-1"
        />
        <FilterDropdown
          value={bloodTypeFilter}
          onChange={setBloodTypeFilter}
          options={bloodTypeOptions}
          placeholder="Filter by Blood Type"
        />
      </div>

      <Table
        data={recipients}
        columns={columns}
        pagination={pagination}
        onPageChange={fetchRecipients}
        rowKey="_id"
        onRowClick={(recipient) => window.location.href = `/recipients/${recipient._id}`}
      />
    </div>
  );
};

export default RecipientList;