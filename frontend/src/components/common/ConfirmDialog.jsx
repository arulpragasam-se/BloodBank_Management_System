import Modal from './Modal';

const ConfirmDialog = ({
 isOpen,
 onClose,
 onConfirm,
 title = 'Confirm Action',
 message = 'Are you sure you want to perform this action?',
 confirmText = 'Confirm',
 cancelText = 'Cancel',
 type = 'danger',
 loading = false,
}) => {
 const typeStyles = {
   danger: {
     icon: '⚠️',
     confirmClass: 'bg-red-600 hover:bg-red-700 text-white',
     iconBg: 'bg-red-100',
     iconColor: 'text-red-600',
   },
   warning: {
     icon: '⚠️',
     confirmClass: 'bg-yellow-600 hover:bg-yellow-700 text-white',
     iconBg: 'bg-yellow-100',
     iconColor: 'text-yellow-600',
   },
   info: {
     icon: 'ℹ️',
     confirmClass: 'bg-blue-600 hover:bg-blue-700 text-white',
     iconBg: 'bg-blue-100',
     iconColor: 'text-blue-600',
   },
   success: {
     icon: '✅',
     confirmClass: 'bg-green-600 hover:bg-green-700 text-white',
     iconBg: 'bg-green-100',
     iconColor: 'text-green-600',
   },
 };

 const styles = typeStyles[type] || typeStyles.danger;

 const handleConfirm = async () => {
   try {
     await onConfirm();
     onClose();
   } catch (error) {
     // Error is handled by the parent component
   }
 };

 return (
   <Modal
     isOpen={isOpen}
     onClose={onClose}
     size="sm"
     closeOnOverlayClick={!loading}
     showCloseButton={!loading}
   >
     <div className="flex items-start space-x-4">
       <div className={`flex-shrink-0 w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center`}>
         <span className={`text-xl ${styles.iconColor}`}>{styles.icon}</span>
       </div>
       
       <div className="flex-1">
         <h3 className="text-lg font-medium text-gray-900 mb-2">
           {title}
         </h3>
         <p className="text-sm text-gray-500 mb-6">
           {message}
         </p>
         
         <div className="flex justify-end space-x-3">
           <button
             type="button"
             onClick={onClose}
             disabled={loading}
             className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {cancelText}
           </button>
           <button
             type="button"
             onClick={handleConfirm}
             disabled={loading}
             className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed ${styles.confirmClass}`}
           >
             {loading ? (
               <div className="flex items-center">
                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                 Processing...
               </div>
             ) : (
               confirmText
             )}
           </button>
         </div>
       </div>
     </div>
   </Modal>
 );
};

export default ConfirmDialog;