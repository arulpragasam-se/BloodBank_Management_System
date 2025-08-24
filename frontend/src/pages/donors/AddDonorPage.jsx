import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DonorForm from '../../components/donors/DonorForm';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../layouts/DashboardLayout';

const AddDonorPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  useEffect(() => {
    if (!hasPermission('create_donor')) {
      navigate('/unauthorized');
    }
  }, [hasPermission, navigate]);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Register New Donor</h1>
          <p className="mt-2 text-gray-600">
            Add a new blood donor to the system with their personal and medical information.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <DonorForm />
          </div>
        </div>

        {/* Information Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              Donor Eligibility Criteria
            </h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• Age between 18-65 years</li>
              <li>• Weight minimum 50kg</li>
              <li>• Good general health</li>
              <li>• No recent donations (12-16 weeks gap)</li>
              <li>• No restricted medical conditions</li>
            </ul>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-3">
              Required Information
            </h3>
            <ul className="space-y-2 text-sm text-green-700">
              <li>• Complete personal details</li>
              <li>• Valid contact information</li>
              <li>• Blood type and medical history</li>
              <li>• Emergency contact details</li>
              <li>• Address and identification</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddDonorPage;