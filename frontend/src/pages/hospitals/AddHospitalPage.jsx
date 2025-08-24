import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HospitalForm from '../../components/hospitals/HospitalForm';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../layouts/DashboardLayout';

const AddHospitalPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  useEffect(() => {
    if (!hasPermission('create_hospital')) {
      navigate('/unauthorized');
    }
  }, [hasPermission, navigate]);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Hospital</h1>
          <p className="mt-2 text-gray-600">
            Register a new hospital partner to expand the blood bank network.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <HospitalForm />
          </div>
        </div>

        {/* Information Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              Partnership Benefits
            </h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• Priority access to blood inventory</li>
              <li>• 24/7 emergency blood supply</li>
              <li>• Real-time stock monitoring</li>
              <li>• Automated request processing</li>
              <li>• Staff training and support</li>
            </ul>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-3">
              Required Documentation
            </h3>
            <ul className="space-y-2 text-sm text-green-700">
              <li>• Hospital registration certificate</li>
              <li>• Medical license documentation</li>
              <li>• Emergency contact information</li>
              <li>• Department and capacity details</li>
              <li>• Staff authorization forms</li>
            </ul>
          </div>
        </div>

        {/* Partnership Process */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Partnership Process
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                1
              </div>
              <h4 className="font-medium text-gray-900">Application</h4>
              <p className="text-sm text-gray-600 mt-1">Submit hospital details and documentation</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                2
              </div>
              <h4 className="font-medium text-gray-900">Verification</h4>
              <p className="text-sm text-gray-600 mt-1">Admin reviews and verifies information</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                3
              </div>
              <h4 className="font-medium text-gray-900">Setup</h4>
              <p className="text-sm text-gray-600 mt-1">System configuration and staff training</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                4
              </div>
              <h4 className="font-medium text-gray-900">Activation</h4>
              <p className="text-sm text-gray-600 mt-1">Partnership goes live with full access</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddHospitalPage;