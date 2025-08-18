import {
    CalendarIcon,
    CheckCircleIcon,
    ClockIcon,
    EnvelopeIcon,
    ExclamationTriangleIcon,
    HeartIcon,
    MapPinIcon,
    PencilIcon,
    PhoneIcon,
    UserIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useNotification } from '../../hooks/useNotifications';
import { getDonorById } from '../../services/donorService';
import { calculateAge, formatDate } from '../../utils/formatters';
import Loading from '../common/Loading';
import StatsCard from '../common/StatsCard';
import DonorHistory from './DonorHistory';
import EligibilityChecker from './EligibilityChecker';

const DonorProfile = () => {
 const { id } = useParams();
 const [donor, setDonor] = useState(null);
 const [loading, setLoading] = useState(true);
 const [activeTab, setActiveTab] = useState('overview');
 const { showError } = useNotification();

 useEffect(() => {
   fetchDonorProfile();
 }, [id]);

 const fetchDonorProfile = async () => {
   try {
     setLoading(true);
     const response = await getDonorById(id);
     if (response.success) {
       setDonor(response.data.donor);
     }
   } catch (error) {
     showError(error.message || 'Failed to fetch donor profile');
   } finally {
     setLoading(false);
   }
 };

 if (loading) {
   return <Loading fullScreen text="Loading donor profile..." />;
 }

 if (!donor) {
   return (
     <div className="text-center py-12">
       <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
       <h3 className="text-lg font-medium text-gray-900 mb-2">Donor not found</h3>
       <p className="text-gray-500">The donor you're looking for doesn't exist.</p>
       <Link to="/donors" className="btn btn-primary mt-4">
         Back to Donors
       </Link>
     </div>
   );
 }

 const age = calculateAge(donor.dateOfBirth);

 const tabs = [
   { id: 'overview', name: 'Overview', icon: UserIcon },
   { id: 'history', name: 'Donation History', icon: HeartIcon },
   { id: 'eligibility', name: 'Eligibility', icon: CheckCircleIcon },
 ];

 return (
   <div className="space-y-6">
     {/* Header */}
     <div className="bg-white rounded-lg shadow">
       <div className="px-6 py-4 border-b border-gray-200">
         <div className="flex items-center justify-between">
           <div className="flex items-center space-x-4">
             <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
               <span className="text-red-600 font-bold text-xl">
                 {donor.userId?.name?.charAt(0)?.toUpperCase()}
               </span>
             </div>
             <div>
               <h1 className="text-2xl font-bold text-gray-900">
                 {donor.userId?.name}
               </h1>
               <p className="text-gray-600">{donor.userId?.email}</p>
               <div className="flex items-center space-x-4 mt-2">
                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium blood-type-${donor.bloodType?.toLowerCase().replace('+', '-positive').replace('-', '-negative')}`}>
                   {donor.bloodType}
                 </span>
                 <div className="flex items-center space-x-1">
                   {donor.isEligible ? (
                     <>
                       <CheckCircleIcon className="h-4 w-4 text-green-500" />
                       <span className="text-sm text-green-600 font-medium">Eligible</span>
                     </>
                   ) : (
                     <>
                       <XCircleIcon className="h-4 w-4 text-red-500" />
                       <span className="text-sm text-red-600 font-medium">Not Eligible</span>
                     </>
                   )}
                 </div>
               </div>
             </div>
           </div>
           
           <Link
             to={`/donors/${id}/edit`}
             className="btn btn-primary"
           >
             <PencilIcon className="h-4 w-4 mr-2" />
             Edit Profile
           </Link>
         </div>
       </div>

       {/* Navigation Tabs */}
       <div className="px-6">
         <nav className="flex space-x-8">
           {tabs.map((tab) => {
             const Icon = tab.icon;
             return (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                   activeTab === tab.id
                     ? 'border-red-500 text-red-600'
                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                 }`}
               >
                 <Icon className="h-4 w-4" />
                 <span>{tab.name}</span>
               </button>
             );
           })}
         </nav>
       </div>
     </div>

     {/* Tab Content */}
     {activeTab === 'overview' && (
       <div className="space-y-6">
         {/* Stats Cards */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <StatsCard
             title="Total Donations"
             value={donor.totalDonations || 0}
             icon={HeartIcon}
             color="red"
           />
           <StatsCard
             title="Age"
             value={`${age} years`}
             icon={CalendarIcon}
             color="blue"
           />
           <StatsCard
             title="Weight"
             value={`${donor.weight} kg`}
             icon={UserIcon}
             color="green"
           />
           <StatsCard
             title="Last Donation"
             value={donor.lastDonationDate ? formatDate(donor.lastDonationDate, 'DD/MM/YYYY') : 'Never'}
             icon={ClockIcon}
             color="yellow"
           />
         </div>

         {/* Details Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Personal Information */}
           <div className="bg-white rounded-lg shadow p-6">
             <h2 className="text-lg font-semibold text-gray-900 mb-4">
               Personal Information
             </h2>
             
             <div className="space-y-4">
               <div className="flex items-center space-x-3">
                 <UserIcon className="h-5 w-5 text-gray-400" />
                 <div>
                   <p className="text-sm font-medium text-gray-900">Full Name</p>
                   <p className="text-sm text-gray-600">{donor.userId?.name}</p>
                 </div>
               </div>
               
               <div className="flex items-center space-x-3">
                 <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                 <div>
                   <p className="text-sm font-medium text-gray-900">Email</p>
                   <p className="text-sm text-gray-600">{donor.userId?.email}</p>
                 </div>
               </div>
               
               <div className="flex items-center space-x-3">
                 <PhoneIcon className="h-5 w-5 text-gray-400" />
                 <div>
                   <p className="text-sm font-medium text-gray-900">Phone</p>
                   <p className="text-sm text-gray-600">{donor.userId?.phone}</p>
                 </div>
               </div>
               
               <div className="flex items-center space-x-3">
                 <CalendarIcon className="h-5 w-5 text-gray-400" />
                 <div>
                   <p className="text-sm font-medium text-gray-900">Date of Birth</p>
                   <p className="text-sm text-gray-600">
                     {formatDate(donor.dateOfBirth, 'DD/MM/YYYY')} ({age} years old)
                   </p>
                 </div>
               </div>
             </div>
           </div>

           {/* Address Information */}
           <div className="bg-white rounded-lg shadow p-6">
             <h2 className="text-lg font-semibold text-gray-900 mb-4">
               Address Information
             </h2>
             
             <div className="space-y-4">
               <div className="flex items-start space-x-3">
                 <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                 <div>
                   <p className="text-sm font-medium text-gray-900">Address</p>
                   <div className="text-sm text-gray-600">
                     {donor.address?.street && <p>{donor.address.street}</p>}
                     <p>
                       {[donor.address?.city, donor.address?.district, donor.address?.zipCode]
                         .filter(Boolean)
                         .join(', ')}
                     </p>
                   </div>
                 </div>
               </div>
             </div>
           </div>

           {/* Emergency Contact */}
           <div className="bg-white rounded-lg shadow p-6">
             <h2 className="text-lg font-semibold text-gray-900 mb-4">
               Emergency Contact
             </h2>
             
             {donor.emergencyContact?.name ? (
               <div className="space-y-4">
                 <div>
                   <p className="text-sm font-medium text-gray-900">Name</p>
                   <p className="text-sm text-gray-600">{donor.emergencyContact.name}</p>
                 </div>
                 
                 <div>
                   <p className="text-sm font-medium text-gray-900">Phone</p>
                   <p className="text-sm text-gray-600">{donor.emergencyContact.phone}</p>
                 </div>
                 
                 <div>
                   <p className="text-sm font-medium text-gray-900">Relationship</p>
                   <p className="text-sm text-gray-600 capitalize">
                     {donor.emergencyContact.relationship}
                   </p>
                 </div>
               </div>
             ) : (
               <p className="text-sm text-gray-500">No emergency contact information available</p>
             )}
           </div>

           {/* Medical History */}
           <div className="bg-white rounded-lg shadow p-6">
             <h2 className="text-lg font-semibold text-gray-900 mb-4">
               Medical History
             </h2>
             
             <div className="space-y-4">
               <div>
                 <p className="text-sm font-medium text-gray-900">Allergies</p>
                 <p className="text-sm text-gray-600">
                   {donor.medicalHistory?.allergies?.length > 0
                     ? donor.medicalHistory.allergies.join(', ')
                     : 'None reported'
                   }
                 </p>
               </div>
               
               <div>
                 <p className="text-sm font-medium text-gray-900">Current Medications</p>
                 <p className="text-sm text-gray-600">
                   {donor.medicalHistory?.medications?.length > 0
                     ? donor.medicalHistory.medications.join(', ')
                     : 'None reported'
                   }
                 </p>
               </div>
               
               <div>
                 <p className="text-sm font-medium text-gray-900">Previous Diseases</p>
                 <p className="text-sm text-gray-600">
                   {donor.medicalHistory?.diseases?.length > 0
                     ? donor.medicalHistory.diseases.join(', ')
                     : 'None reported'
                   }
                 </p>
               </div>
               
               <div>
                 <p className="text-sm font-medium text-gray-900">Previous Surgeries</p>
                 <p className="text-sm text-gray-600">
                   {donor.medicalHistory?.surgeries?.length > 0
                     ? donor.medicalHistory.surgeries.join(', ')
                     : 'None reported'
                   }
                 </p>
               </div>
             </div>
           </div>
         </div>
       </div>
     )}

     {activeTab === 'history' && (
       <DonorHistory donorId={id} />
     )}

     {activeTab === 'eligibility' && (
       <EligibilityChecker donor={donor} onEligibilityUpdate={fetchDonorProfile} />
     )}
   </div>
 );
};

export default DonorProfile;