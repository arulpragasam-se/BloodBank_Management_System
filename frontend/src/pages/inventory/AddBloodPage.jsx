import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddBloodForm from '../../components/inventory/AddBloodForm';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../layouts/DashboardLayout';

const AddBloodPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  useEffect(() => {
    if (!hasPermission('manage_inventory')) {
      navigate('/unauthorized');
    }
  }, [hasPermission, navigate]);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add Blood to Inventory</h1>
          <p className="mt-2 text-gray-600">
            Register new blood units collected from donations into the inventory system.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <AddBloodForm />
          </div>
        </div>

        {/* Information Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              Quality Control Requirements
            </h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• Complete pathogen screening (HIV, Hepatitis B/C, Syphilis)</li>
              <li>• Blood type confirmation and cross-matching</li>
              <li>• Proper labeling with batch and donor information</li>
              <li>• Temperature-controlled storage verification</li>
              <li>• Documentation of collection date and expiry</li>
            </ul>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-3">
              Storage Guidelines
            </h3>
            <ul className="space-y-2 text-sm text-green-700">
              <li>• Whole blood: 2-6°C for 35 days</li>
              <li>• Red blood cells: 2-6°C for 42 days</li>
              <li>• Platelets: 20-24°C for 5 days with agitation</li>
              <li>• Fresh frozen plasma: -18°C for 12 months</li>
              <li>• Regular temperature monitoring required</li>
            </ul>
          </div>
        </div>

        {/* Processing Steps */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Blood Processing Workflow
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                1
              </div>
              <h4 className="font-medium text-gray-900">Collection</h4>
              <p className="text-sm text-gray-600 mt-1">Blood collected from verified donor</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                2
              </div>
              <h4 className="font-medium text-gray-900">Testing</h4>
              <p className="text-sm text-gray-600 mt-1">Comprehensive pathogen screening</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                3
              </div>
              <h4 className="font-medium text-gray-900">Processing</h4>
              <p className="text-sm text-gray-600 mt-1">Separation into components if needed</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                4
              </div>
              <h4 className="font-medium text-gray-900">Storage</h4>
              <p className="text-sm text-gray-600 mt-1">Proper temperature-controlled storage</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                5
              </div>
              <h4 className="font-medium text-gray-900">Available</h4>
              <p className="text-sm text-gray-600 mt-1">Ready for distribution to hospitals</p>
            </div>
          </div>
        </div>

        {/* Safety Notice */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 text-yellow-600">⚠️</div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-yellow-800">
                Important Safety Notice
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                All blood units must pass complete screening before being added to available inventory. 
                Ensure all test results are negative and documentation is complete before marking units as available for distribution.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddBloodPage;