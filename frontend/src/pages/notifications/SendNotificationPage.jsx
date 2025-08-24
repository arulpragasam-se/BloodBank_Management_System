import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SendNotificationForm from '../../components/notifications/SendNotificationForm';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../layouts/DashboardLayout';

const SendNotificationPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [searchParams] = useSearchParams();
  const notificationType = searchParams.get('type');

  useEffect(() => {
    if (!hasPermission('send_notifications')) {
      navigate('/unauthorized');
    }
  }, [hasPermission, navigate]);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Send Notification</h1>
          <p className="mt-2 text-gray-600">
            Send notifications to donors, hospital staff, or recipients via multiple channels.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <SendNotificationForm defaultType={notificationType} />
          </div>
        </div>

        {/* Information Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              Notification Channels
            </h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• <strong>In-App:</strong> Displayed in user dashboard and notification center</li>
              <li>• <strong>SMS:</strong> Text messages via Twilio integration (160 character limit)</li>
              <li>• <strong>Email:</strong> Rich HTML emails with custom templates</li>
              <li>• <strong>Push:</strong> Browser notifications for real-time alerts</li>
            </ul>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-3">
              Best Practices
            </h3>
            <ul className="space-y-2 text-sm text-green-700">
              <li>• Keep messages clear and concise</li>
              <li>• Use appropriate urgency levels</li>
              <li>• Include relevant action items</li>
              <li>• Test emergency notifications carefully</li>
              <li>• Consider time zones for scheduled sends</li>
            </ul>
          </div>
        </div>

        {/* Notification Types Guide */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Notification Types Guide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-red-600 mb-2">🚨 Emergency Alerts</h4>
              <p className="text-sm text-gray-600">
                Critical blood shortages, urgent donor requests, emergency situations requiring immediate attention.
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-blue-600 mb-2">📢 Campaign Invitations</h4>
              <p className="text-sm text-gray-600">
                Blood drive announcements, donor recruitment messages, campaign participation requests.
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-green-600 mb-2">⏰ Appointment Reminders</h4>
              <p className="text-sm text-gray-600">
                Donation appointments, eligibility updates, follow-up schedules, test result notifications.
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-yellow-600 mb-2">📊 System Alerts</h4>
              <p className="text-sm text-gray-600">
                Low stock warnings, expiry alerts, inventory updates, system maintenance notices.
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-purple-600 mb-2">🎉 Thank You Messages</h4>
              <p className="text-sm text-gray-600">
                Donation appreciation, milestone celebrations, impact reports, donor recognition.
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-indigo-600 mb-2">📋 Status Updates</h4>
              <p className="text-sm text-gray-600">
                Request approvals, processing updates, eligibility changes, profile modifications.
              </p>
            </div>
          </div>
        </div>

        {/* Rate Limits Notice */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 text-yellow-600">⚠️</div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-yellow-800">
                Rate Limits and Guidelines
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>SMS: Maximum 10 messages per hour per user</li>
                  <li>Email: Maximum 20 emails per hour per user</li>
                  <li>Bulk notifications: Maximum 3 bulk sends per hour</li>
                  <li>Emergency alerts: No rate limits but require admin approval</li>
                  <li>Please use bulk notifications for sending to multiple recipients</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SendNotificationPage;