import { CheckCircle, Droplet, XCircle } from 'lucide-react';
import { useState } from 'react';
import { recipientService } from '../../services/recipientService';
import { BLOOD_TYPES } from '../../utils/constants';
import Toast from '../common/Toast';

const CompatibilityChecker = () => {
  const [donorBloodType, setDonorBloodType] = useState('');
  const [recipientBloodType, setRecipientBloodType] = useState('');
  const [compatibleRecipients, setCompatibleRecipients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);

  const bloodCompatibility = {
    'A+': { canReceiveFrom: ['A+', 'A-', 'O+', 'O-'], canDonateTo: ['A+', 'AB+'] },
    'A-': { canReceiveFrom: ['A-', 'O-'], canDonateTo: ['A+', 'A-', 'AB+', 'AB-'] },
    'B+': { canReceiveFrom: ['B+', 'B-', 'O+', 'O-'], canDonateTo: ['B+', 'AB+'] },
    'B-': { canReceiveFrom: ['B-', 'O-'], canDonateTo: ['B+', 'B-', 'AB+', 'AB-'] },
    'AB+': { canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], canDonateTo: ['AB+'] },
    'AB-': { canReceiveFrom: ['A-', 'B-', 'AB-', 'O-'], canDonateTo: ['AB+', 'AB-'] },
    'O+': { canReceiveFrom: ['O+', 'O-'], canDonateTo: ['A+', 'B+', 'AB+', 'O+'] },
    'O-': { canReceiveFrom: ['O-'], canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] }
  };

  const checkCompatibility = (donor, recipient) => {
    if (!donor || !recipient) return null;
    return bloodCompatibility[donor]?.canDonateTo.includes(recipient);
  };

  const searchCompatibleRecipients = async () => {
    if (!donorBloodType) return;
    
    try {
      setLoading(true);
      setError('');
      const response = await recipientService.searchCompatibleRecipients(donorBloodType);
      
      if (response.success) {
        setCompatibleRecipients(response.data.recipients || []);
        setShowResults(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to search compatible recipients');
    } finally {
      setLoading(false);
    }
  };

  const isCompatible = checkCompatibility(donorBloodType, recipientBloodType);

  return (
    <div className="space-y-6">
      {error && <Toast type="error" message={error} onClose={() => setError('')} />}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <Droplet className="w-6 h-6 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold">Blood Compatibility Checker</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Donor Blood Type
            </label>
            <select
              value={donorBloodType}
              onChange={(e) => setDonorBloodType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select donor blood type</option>
              {BLOOD_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Blood Type
            </label>
            <select
              value={recipientBloodType}
              onChange={(e) => setRecipientBloodType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select recipient blood type</option>
              {BLOOD_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {donorBloodType && recipientBloodType && (
          <div className="mt-6 p-4 rounded-lg border">
            <div className="flex items-center">
              {isCompatible ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-900">Compatible</p>
                    <p className="text-sm text-green-700">
                      {donorBloodType} blood can be donated to {recipientBloodType} recipient
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-red-600 mr-3" />
                  <div>
                    <p className="font-medium text-red-900">Not Compatible</p>
                    <p className="text-sm text-red-700">
                      {donorBloodType} blood cannot be donated to {recipientBloodType} recipient
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={searchCompatibleRecipients}
            disabled={!donorBloodType || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Find Compatible Recipients'}
          </button>
        </div>
      </div>

      {donorBloodType && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-lg font-semibold mb-4">
            Blood Type {donorBloodType} Compatibility Chart
          </h4>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Can Donate To:</h5>
              <div className="flex flex-wrap gap-2">
                {bloodCompatibility[donorBloodType]?.canDonateTo.map(type => (
                  <span
                    key={type}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Can Receive From:</h5>
              <div className="flex flex-wrap gap-2">
                {bloodCompatibility[donorBloodType]?.canReceiveFrom.map(type => (
                  <span
                    key={type}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showResults && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-lg font-semibold mb-4">
            Compatible Recipients for {donorBloodType} Blood
          </h4>
          
          {compatibleRecipients.length === 0 ? (
            <p className="text-gray-500">No compatible recipients found.</p>
          ) : (
            <div className="space-y-3">
              {compatibleRecipients.map(recipient => (
                <div
                  key={recipient._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-orange-600 font-medium text-sm">
                        {recipient.userId?.name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{recipient.userId?.name}</p>
                      <p className="text-sm text-gray-600">
                        Blood Type: {recipient.bloodType} • Age: {recipient.age} years
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      Compatible
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {recipient.medicalCondition}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompatibilityChecker;