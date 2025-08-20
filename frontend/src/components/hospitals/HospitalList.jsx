import { useEffect, useState } from 'react';
import { hospitalService } from '../../services/hospitalService';
import FilterDropdown from '../common/FilterDropdown';
import Loading from '../common/Loading';
import SearchBar from '../common/SearchBar';
import Table from '../common/Table';
import Toast from '../common/Toast';

const HospitalList = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });

  const fetchHospitals = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, search, district: districtFilter };
      const response = await hospitalService.getAllHospitals(params);
      
      if (response.success) {
        setHospitals(response.data.hospitals);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch hospitals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, [search, districtFilter]);

  const columns = [
    { key: 'name', label: 'Hospital Name' },
    { key: 'registrationNumber', label: 'Registration No.' },
    { key: 'address.city', label: 'City' },
    { key: 'address.district', label: 'District' },
    { key: 'contactInfo.phone', label: 'Phone' },
    { key: 'bloodBankCapacity', label: 'Blood Bank Capacity' },
    { key: 'isActive', label: 'Status', render: (value) => value ? 'Active' : 'Inactive' }
  ];

  const districts = ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh'];

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {error && <Toast type="error" message={error} onClose={() => setError('')} />}
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search hospitals..."
          className="flex-1"
        />
        <FilterDropdown
          value={districtFilter}
          onChange={setDistrictFilter}
          options={districts.map(d => ({ value: d, label: d }))}
          placeholder="Filter by District"
        />
      </div>

      <Table
        data={hospitals}
        columns={columns}
        pagination={pagination}
        onPageChange={fetchHospitals}
        rowKey="_id"
        onRowClick={(hospital) => window.location.href = `/hospitals/${hospital._id}`}
      />
    </div>
  );
};

export default HospitalList;