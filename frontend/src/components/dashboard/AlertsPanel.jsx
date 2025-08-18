import {
    BeakerIcon,
    ClockIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { getInventoryStats } from '../../services/inventoryService';
import { getAllRequests } from '../../services/requestService';

const AlertsPanel = () => {
  const { user } = useAuth();
  const { execute } = useApi();
  const [alerts, setAlerts] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const [inventoryRes, requestsRes] = await Promise.all([
        execute(() => getInventoryStats(), { showLoading: false }),
        execute(() => getAllRequests({ limit: 10 }), { showLoading: false })
      ]);

      const newAlerts = [];

      // Inventory alerts
      if (inventoryRes?.success) {
        const stats = inventoryRes.data.stats;
        
        if (stats.expiringIn3Days > 0) {
          newAlerts.push({
            id: 'expiring-3-days',
            type: 'warning',
            title: 'Blood Units Expiring Soon',
            message: `${stats.expiringIn3Days} units expire within 3 days`,
            action: 'View Inventory',
            link: '/inventory?filter=expiring',
            icon: ClockIcon,
            priority: 'high'
          });
        }

        if (stats.expired > 0) {
          newAlerts.push({
            id: 'expired-units',
            type: 'danger',
            title: 'Expired Blood Units',
            message: `${stats.expired} units have expired`,
            action: 'Remove Expired',
            link: '/inventory?filter=expired',
            icon: ExclamationTriangleIcon,
            priority: 'critical'
          });
        }

        // Low stock alerts
        Object.entries(stats.byBloodType || {}).forEach(([bloodType, data]) => {
          if (data.units < 5) { // Threshold for low stock
            newAlerts.push({
                id: `low-stock-${bloodType}`,
             type: 'warning',
             title: `Low Stock Alert - ${bloodType}`,
             message: `Only ${data.units} units remaining`,
             action: 'Add Stock',
             link: '/inventory/add',
             icon: BeakerIcon,
             priority: 'high'
           });
         }
       });
     }

     // Blood request alerts
     if (requestsRes?.success) {
       const urgentRequests = requestsRes.data.requests?.filter(
         req => req.urgencyLevel === 'critical' && req.status === 'pending'
       ) || [];

       if (urgentRequests.length > 0) {
         newAlerts.push({
           id: 'urgent-requests',
           type: 'danger',
           title: 'Urgent Blood Requests',
           message: `${urgentRequests.length} critical requests pending`,
           action: 'View Requests',
           link: '/requests?filter=urgent',
           icon: DocumentTextIcon,
           priority: 'critical'
         });
       }

       const overdueRequests = requestsRes.data.requests?.filter(
         req => new Date(req.requiredBy) < new Date() && req.status === 'pending'
       ) || [];

       if (overdueRequests.length > 0) {
         newAlerts.push({
           id: 'overdue-requests',
           type: 'danger',
           title: 'Overdue Requests',
           message: `${overdueRequests.length} requests past due date`,
           action: 'Review Requests',
           link: '/requests?filter=overdue',
           icon: ClockIcon,
           priority: 'high'
         });
       }
     }

     // Sort by priority
     const priorityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
     newAlerts.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

     setAlerts(newAlerts);
   } catch (error) {
     console.error('Failed to fetch alerts:', error);
   }
 };

 const dismissAlert = (alertId) => {
   setDismissedAlerts(prev => new Set([...prev, alertId]));
 };

 const getAlertStyles = (type) => {
   const styles = {
     danger: {
       bg: 'bg-red-50',
       border: 'border-red-200',
       text: 'text-red-800',
       icon: 'text-red-600'
     },
     warning: {
       bg: 'bg-yellow-50',
       border: 'border-yellow-200',
       text: 'text-yellow-800',
       icon: 'text-yellow-600'
     },
     info: {
       bg: 'bg-blue-50',
       border: 'border-blue-200',
       text: 'text-blue-800',
       icon: 'text-blue-600'
     },
     success: {
       bg: 'bg-green-50',
       border: 'border-green-200',
       text: 'text-green-800',
       icon: 'text-green-600'
     }
   };
   return styles[type] || styles.info;
 };

 const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));

 if (visibleAlerts.length === 0) {
   return (
     <div className="bg-white rounded-lg shadow border border-gray-200">
       <div className="px-6 py-4 border-b border-gray-200">
         <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
       </div>
       <div className="p-6 text-center">
         <div className="text-green-500 text-4xl mb-4">✅</div>
         <p className="text-gray-600 text-sm">All systems running smoothly</p>
         <p className="text-gray-400 text-xs mt-1">No alerts at this time</p>
       </div>
     </div>
   );
 }

 return (
   <div className="bg-white rounded-lg shadow border border-gray-200">
     <div className="px-6 py-4 border-b border-gray-200">
       <div className="flex items-center justify-between">
         <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
           {visibleAlerts.length} Alert{visibleAlerts.length !== 1 ? 's' : ''}
         </span>
       </div>
     </div>
     
     <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
       {visibleAlerts.map((alert) => {
         const Icon = alert.icon;
         const styles = getAlertStyles(alert.type);
         
         return (
           <div
             key={alert.id}
             className={`p-4 ${styles.bg} ${styles.border} border-l-4`}
           >
             <div className="flex items-start">
               <div className="flex-shrink-0">
                 <Icon className={`h-5 w-5 ${styles.icon}`} />
               </div>
               
               <div className="ml-3 flex-1">
                 <h4 className={`text-sm font-medium ${styles.text}`}>
                   {alert.title}
                 </h4>
                 <p className={`text-sm mt-1 ${styles.text} opacity-90`}>
                   {alert.message}
                 </p>
                 
                 {alert.action && alert.link && (
                   <div className="mt-3">
                     <Link
                       to={alert.link}
                       className={`text-sm font-medium ${styles.text} hover:opacity-75 underline`}
                     >
                       {alert.action} →
                     </Link>
                   </div>
                 )}
               </div>
               
               <div className="ml-4 flex-shrink-0">
                 <button
                   onClick={() => dismissAlert(alert.id)}
                   className={`${styles.text} hover:opacity-75`}
                 >
                   <XMarkIcon className="h-4 w-4" />
                 </button>
               </div>
             </div>
           </div>
         );
       })}
     </div>
     
     {visibleAlerts.length > 3 && (
       <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
         <button
           onClick={fetchAlerts}
           className="text-sm text-red-600 hover:text-red-700 font-medium"
         >
           Refresh alerts
         </button>
       </div>
     )}
   </div>
 );
};

export default AlertsPanel;