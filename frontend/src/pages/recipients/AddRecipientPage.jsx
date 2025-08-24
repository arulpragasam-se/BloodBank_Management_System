import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RecipientForm from '../../components/recipients/RecipientForm';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../layouts/DashboardLayout';

const AddRecipientPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  useEffect(() => {
    if (!hasPermission('create_recipient')) {
      navigate('/unauthorized');
    }
  }, [hasPermission, navigate]);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Register New Recipient</h1>
          <p className="mt-2 text-gray-600">
            Add a new blood recipient to the system with their medical information and requirements.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <RecipientForm />
          </div>
        </div>

        {/* Information Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-800 mb-3">
              Medical Requirements
            </h3>
            <ul className="space-y-2 text-sm text-purple-700">
              <li>• Valid medical diagnosis and condition details</li>
              <li>• Blood type confirmation from medical records</li>
              <li>• Complete allergy and medication history</li>
              <li>• Emergency contact information</li>
              <li>• Physician's recommendation for transfusion</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              Blood Compatibility
            </h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• Cross-matching required before transfusion</li>
              <li>• Compatible blood types will be identified automatically</li>
              <li>• Special requirements noted for rare blood types</li>
              <li>• Previous transfusion reactions documented</li>
              <li>• Antibody screening if applicable</li>
            </ul>
          </div>
        </div>

        {/* Urgency Levels Guide */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Priority Level Guidelines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border-l-4 border-red-500">
              <h4 className="font-semibold text-red-600 mb-2">🚨 Critical</h4>
              <p className="text-sm text-gray-600">
                Life-threatening condition requiring immediate transfusion within hours.
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
              <h4 className="font-semibold text-orange-600 mb-2">⚠️ High</h4>
              <p className="text-sm text-gray-600">
                Serious condition requiring transfusion within 24-48 hours.
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-500">
              <h4 className="font-semibold text-yellow-600 mb-2">⏳ Medium</h4>
              <p className="text-sm text-gray-600">
                Stable condition with transfusion needed within a week.
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
              <h4 className="font-semibold text-green-600 mb-2">📅 Low</h4>
              <p className="text-sm text-gray-600">
                Elective procedure or preventive transfusion, can be scheduled.
              </p>
            </div>
          </div>
        </div>

        {/* Common Conditions Guide */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4">
            Common Conditions Requiring Blood Transfusion
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">Blood Disorders</h4>
              <ul className="space-y-1 text-sm text-yellow-700">
                <li>• Thalassemia Major</li>
                <li>• Sickle Cell Disease</li>
                <li>• Severe Anemia</li>
                <li>• Leukemia and Blood Cancers</li>
                <li>• Aplastic Anemia</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">Medical Procedures</h4>
              <ul className="space-y-1 text-sm text-yellow-700">
                <li>• Major Surgery</li>
                <li>• Organ Transplantation</li>
                <li>• Cancer Chemotherapy</li>
                <li>• Trauma and Accidents</li>
                <li>• Obstetric Complications</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 text-green-600">🔒</div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-green-800">
                Privacy and Confidentiality
              </h3>
              <p className="mt-1 text-sm text-green-700">
                All recipient medical information is kept strictly confidential and complies with healthcare privacy regulations. 
                Data is only accessible to authorized medical personnel directly involved in patient care.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddRecipientPage;