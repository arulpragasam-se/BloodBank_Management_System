import { Droplet } from 'lucide-react';

const BloodTypeFilter = ({ value, onChange, className = '' }) => {
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Filter by Blood Type
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onChange('')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
           value === '' 
             ? 'bg-blue-600 text-white' 
             : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
         }`}
       >
         All
       </button>
       
       {bloodTypes.map((type) => (
         <button
           key={type}
           onClick={() => onChange(type)}
           className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center ${
             value === type 
               ? 'bg-red-600 text-white' 
               : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
           }`}
         >
           <Droplet className="w-3 h-3 mr-1" />
           {type}
         </button>
       ))}
     </div>
   </div>
 );
};

export default BloodTypeFilter;