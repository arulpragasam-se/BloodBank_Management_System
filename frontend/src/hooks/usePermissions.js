import { useMemo } from 'react';
import { canAccessRoute, hasAllPermissions, hasAnyPermission, hasPermission } from '../utils/permissions';
import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    if (!user) return [];
    
    const userRole = user.role;
    const rolePermissions = {
      admin: ['*'], // All permissions
      hospital_staff: [
        'view_donors',
        'manage_inventory',
        'create_campaigns',
        'view_reports',
        'send_notifications',
        'view_hospitals',
        'view_recipients',
        'create_blood_request',
        'view_requests',
      ],
      donor: [
        'view_campaigns',
        'view_profile',
        'register_campaign',
      ],
      recipient: [
        'view_profile',
        'view_requests',
      ],
    };

    return rolePermissions[userRole] || [];
  }, [user]);

  const checkPermission = (permission) => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  };

  const checkAnyPermission = (permissionList) => {
    if (!user) return false;
    return hasAnyPermission(user.role, permissionList);
  };

  const checkAllPermissions = (permissionList) => {
    if (!user) return false;
    return hasAllPermissions(user.role, permissionList);
  };

  const checkRouteAccess = (route) => {
    if (!user) return false;
    return canAccessRoute(user.role, route);
  };

  const isAdmin = useMemo(() => {
    return user?.role === 'admin';
  }, [user]);

  const isHospitalStaff = useMemo(() => {
    return user?.role === 'hospital_staff';
  }, [user]);

  const isDonor = useMemo(() => {
    return user?.role === 'donor';
  }, [user]);

  const isRecipient = useMemo(() => {
    return user?.role === 'recipient';
  }, [user]);

  const canManageUsers = useMemo(() => {
    return checkPermission('manage_users');
  }, [checkPermission]);

  const canManageInventory = useMemo(() => {
    return checkPermission('manage_inventory');
  }, [checkPermission]);

  const canViewReports = useMemo(() => {
    return checkPermission('view_reports');
  }, [checkPermission]);

  const canSendNotifications = useMemo(() => {
    return checkPermission('send_notifications');
  }, [checkPermission]);

  const canCreateCampaigns = useMemo(() => {
    return checkPermission('create_campaigns');
  }, [checkPermission]);

  const canManageHospitals = useMemo(() => {
    return checkPermission('manage_hospitals');
  }, [checkPermission]);

  const getAccessibleRoutes = useMemo(() => {
    if (!user) return [];

    const allRoutes = [
      { path: '/dashboard', name: 'Dashboard' },
      { path: '/donors', name: 'Donors', permission: 'view_donors' },
      { path: '/inventory', name: 'Inventory', permission: 'manage_inventory' },
      { path: '/campaigns', name: 'Campaigns', permission: 'view_campaigns' },
      { path: '/hospitals', name: 'Hospitals', permission: 'view_hospitals' },
      { path: '/recipients', name: 'Recipients', permission: 'view_recipients' },
      { path: '/requests', name: 'Blood Requests', permission: 'view_requests' },
      { path: '/notifications', name: 'Notifications', permission: 'view_notifications' },
      { path: '/reports', name: 'Reports', permission: 'view_reports' },
      { path: '/profile', name: 'Profile' },
    ];

    return allRoutes.filter(route => {
      if (!route.permission) return true;
      return checkPermission(route.permission);
    });
  }, [user, checkPermission]);

  const getUserPermissionLevel = useMemo(() => {
    if (!user) return 'none';
    
    if (isAdmin) return 'admin';
    if (isHospitalStaff) return 'staff';
    if (isDonor) return 'donor';
    if (isRecipient) return 'recipient';
    
    return 'user';
  }, [user, isAdmin, isHospitalStaff, isDonor, isRecipient]);

  return {
    permissions,
    user,
    
    // Permission checks
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
    checkRouteAccess,
    
    // Role checks
    isAdmin,
    isHospitalStaff,
    isDonor,
    isRecipient,
    
    // Specific permission checks
    canManageUsers,
    canManageInventory,
    canViewReports,
    canSendNotifications,
    canCreateCampaigns,
    canManageHospitals,
    
    // Utilities
    getAccessibleRoutes,
    getUserPermissionLevel,
  };
};

export default usePermissions;