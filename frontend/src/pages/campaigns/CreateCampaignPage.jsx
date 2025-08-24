import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateCampaignForm from '../../components/campaigns/CreateCampaignForm';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../layouts/DashboardLayout';

const CreateCampaignPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  useEffect(() => {
    if (!hasPermission('create_campaign')) {
      navigate('/unauthorized');
    }
  }, [hasPermission, navigate]);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Campaign</h1>
          <p className="mt-2 text-gray-600">
            Organize a blood donation campaign to help save lives in your community.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <CreateCampaignForm />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateCampaignPage;