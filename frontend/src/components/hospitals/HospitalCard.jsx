import { Activity, Mail, MapPin, Phone, Users } from 'lucide-react';

const HospitalCard = ({ hospital, onClick }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onClick && onClick(hospital)}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{hospital.name}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          hospital.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {hospital.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-600">
          <MapPin className="w-4 h-4 mr-2" />
          <span className="text-sm">
            {hospital.address.street}, {hospital.address.city}, {hospital.address.district}
          </span>
        </div>
        
        <div className="flex items-center text-gray-600">
          <Phone className="w-4 h-4 mr-2" />
          <span className="text-sm">{hospital.contactInfo.phone}</span>
        </div>
        
        <div className="flex items-center text-gray-600">
          <Mail className="w-4 h-4 mr-2" />
          <span className="text-sm">{hospital.contactInfo.email}</span>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="flex items-center text-blue-600">
          <Users className="w-4 h-4 mr-1" />
          <span className="text-sm">{hospital.staffMembers?.length || 0} Staff</span>
        </div>
        
        <div className="flex items-center text-purple-600">
          <Activity className="w-4 h-4 mr-1" />
          <span className="text-sm">{hospital.bloodBankCapacity} Units</span>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        Reg No: {hospital.registrationNumber}
      </div>
    </div>
  );
};

export default HospitalCard;