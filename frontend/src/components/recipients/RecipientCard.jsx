import { Activity, Calendar, Droplet, Mail, Phone, User } from 'lucide-react';

const RecipientCard = ({ recipient, onClick }) => {
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

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onClick && onClick(recipient)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-3">
            <User className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{recipient.userId?.name}</h3>
            <p className="text-gray-600">Age: {calculateAge(recipient.dateOfBirth)} years</p>
          </div>
        </div>
        
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          recipient.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {recipient.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-600">
          <Droplet className="w-4 h-4 mr-2 text-red-600" />
          <span className="text-sm">Blood Type: </span>
          <span className="ml-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            {recipient.bloodType}
          </span>
        </div>
        
        <div className="flex items-center text-gray-600">
          <Activity className="w-4 h-4 mr-2" />
          <span className="text-sm">Medical Condition: {recipient.medicalCondition}</span>
        </div>
        
        <div className="flex items-center text-gray-600">
          <Mail className="w-4 h-4 mr-2" />
          <span className="text-sm">{recipient.userId?.email}</span>
        </div>
        
        {recipient.userId?.phone && (
          <div className="flex items-center text-gray-600">
            <Phone className="w-4 h-4 mr-2" />
            <span className="text-sm">{recipient.userId.phone}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="flex items-center text-blue-600">
          <Calendar className="w-4 h-4 mr-1" />
          <span className="text-sm">
            {recipient.transfusionHistory?.length || 0} Transfusions
          </span>
        </div>
        
        <div className="text-xs text-gray-500">
          Registered: {new Date(recipient.createdAt).toLocaleDateString()}
        </div>
      </div>

      {recipient.emergencyContact && (
        <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
          Emergency: {recipient.emergencyContact.name} ({recipient.emergencyContact.phone})
        </div>
      )}
    </div>
  );
};

export default RecipientCard;