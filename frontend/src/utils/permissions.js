import { USER_ROLES } from './constants';

export const PERMISSIONS = {
  // User management
  CREATE_USER: 'create_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',
  VIEW_ALL_USERS: 'view_all_users',
  
  // Donor management
  CREATE_DONOR: 'create_donor',
  UPDATE_DONOR: 'update_donor',
  DELETE_DONOR: 'delete_donor',
  VIEW_ALL_DONORS: 'view_all_donors',
  VIEW_DONOR_HISTORY: 'view_donor_history',
  
  // Inventory management
  MANAGE_INVENTORY: 'manage_inventory',
  VIEW_INVENTORY: 'view_inventory',
  UPDATE_INVENTORY: 'update_inventory',
  DELETE_INVENTORY: 'delete_inventory',
  
  // Campaign management
  CREATE_CAMPAIGN: 'create_campaign',
  UPDATE_CAMPAIGN: 'update_campaign',
  DELETE_CAMPAIGN: 'delete_campaign',
  VIEW_ALL_CAMPAIGNS: 'view_all_campaigns',
  MANAGE_CAMPAIGN_PARTICIPANTS: 'manage_campaign_participants',
  
  // Hospital management
  CREATE_HOSPITAL: 'create_hospital',
  UPDATE_HOSPITAL: 'update_hospital',
  DELETE_HOSPITAL: 'delete_hospital',
  VIEW_ALL_HOSPITALS: 'view_all_hospitals',
  MANAGE_HOSPITAL_STAFF: 'manage_hospital_staff',
  
  // Blood request management
  CREATE_BLOOD_REQUEST: 'create_blood_request',
  UPDATE_BLOOD_REQUEST: 'update_blood_request',
  APPROVE_BLOOD_REQUEST: 'approve_blood_request',
  VIEW_ALL_REQUESTS: 'view_all_requests',
  
  // Recipient management
  CREATE_RECIPIENT: 'create_recipient',
  UPDATE_RECIPIENT: 'update_recipient',
  DELETE_RECIPIENT: 'delete_recipient',
  VIEW_ALL_RECIPIENTS: 'view_all_recipients',
  
  // Notification management
  SEND_NOTIFICATIONS: 'send_notifications',
  SEND_BULK_NOTIFICATIONS: 'send_bulk_notifications',
  VIEW_ALL_NOTIFICATIONS: 'view_all_notifications',
  
  // Report management
  GENERATE_REPORTS: 'generate_reports',
  VIEW_ALL_REPORTS: 'view_all_reports',
  EXPORT_REPORTS: 'export_reports',
  
  // System management
  MANAGE_SYSTEM: 'manage_system',
  VIEW_SYSTEM_LOGS: 'view_system_logs'
};

const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.DELETE_USER,
    PERMISSIONS.VIEW_ALL_USERS,
    PERMISSIONS.CREATE_DONOR,
    PERMISSIONS.UPDATE_DONOR,
    PERMISSIONS.DELETE_DONOR,
    PERMISSIONS.VIEW_ALL_DONORS,
    PERMISSIONS.VIEW_DONOR_HISTORY,
    PERMISSIONS.MANAGE_INVENTORY,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.UPDATE_INVENTORY,
    PERMISSIONS.DELETE_INVENTORY,
    PERMISSIONS.CREATE_CAMPAIGN,
    PERMISSIONS.UPDATE_CAMPAIGN,
    PERMISSIONS.DELETE_CAMPAIGN,
    PERMISSIONS.VIEW_ALL_CAMPAIGNS,
    PERMISSIONS.MANAGE_CAMPAIGN_PARTICIPANTS,
    PERMISSIONS.CREATE_HOSPITAL,
    PERMISSIONS.UPDATE_HOSPITAL,
    PERMISSIONS.DELETE_HOSPITAL,
    PERMISSIONS.VIEW_ALL_HOSPITALS,
    PERMISSIONS.MANAGE_HOSPITAL_STAFF,
    PERMISSIONS.CREATE_BLOOD_REQUEST,
    PERMISSIONS.UPDATE_BLOOD_REQUEST,
    PERMISSIONS.APPROVE_BLOOD_REQUEST,
    PERMISSIONS.VIEW_ALL_REQUESTS,
    PERMISSIONS.CREATE_RECIPIENT,
    PERMISSIONS.UPDATE_RECIPIENT,
    PERMISSIONS.DELETE_RECIPIENT,
    PERMISSIONS.VIEW_ALL_RECIPIENTS,
    PERMISSIONS.SEND_NOTIFICATIONS,
    PERMISSIONS.SEND_BULK_NOTIFICATIONS,
    PERMISSIONS.VIEW_ALL_NOTIFICATIONS,
    PERMISSIONS.GENERATE_REPORTS,
    PERMISSIONS.VIEW_ALL_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.MANAGE_SYSTEM,
    PERMISSIONS.VIEW_SYSTEM_LOGS
  ],
  
  [USER_ROLES.HOSPITAL_STAFF]: [
    PERMISSIONS.VIEW_ALL_DONORS,
    PERMISSIONS.VIEW_DONOR_HISTORY,
    PERMISSIONS.MANAGE_INVENTORY,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.UPDATE_INVENTORY,
    PERMISSIONS.CREATE_CAMPAIGN,
    PERMISSIONS.UPDATE_CAMPAIGN,
    PERMISSIONS.VIEW_ALL_CAMPAIGNS,
    PERMISSIONS.MANAGE_CAMPAIGN_PARTICIPANTS,
    PERMISSIONS.CREATE_BLOOD_REQUEST,
    PERMISSIONS.UPDATE_BLOOD_REQUEST,
    PERMISSIONS.VIEW_ALL_REQUESTS,
    PERMISSIONS.VIEW_ALL_RECIPIENTS,
    PERMISSIONS.UPDATE_RECIPIENT,
    PERMISSIONS.SEND_NOTIFICATIONS,
    PERMISSIONS.GENERATE_REPORTS,
    PERMISSIONS.VIEW_ALL_REPORTS
  ],
  
  [USER_ROLES.DONOR]: [
    PERMISSIONS.VIEW_ALL_CAMPAIGNS
  ],
  
  [USER_ROLES.RECIPIENT]: []
};

export const hasPermission = (userRole, permission) => {
  if (!userRole || !permission) return false;
  
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
};

export const hasAnyPermission = (userRole, permissions) => {
  if (!userRole || !Array.isArray(permissions)) return false;
  
  return permissions.some(permission => hasPermission(userRole, permission));
};

export const hasAllPermissions = (userRole, permissions) => {
  if (!userRole || !Array.isArray(permissions)) return false;
  
  return permissions.every(permission => hasPermission(userRole, permission));
};

export const getRolePermissions = (userRole) => {
  return ROLE_PERMISSIONS[userRole] || [];
};

export const canAccessRoute = (userRole, route) => {
  const routePermissions = {
    '/admin': [PERMISSIONS.MANAGE_SYSTEM],
    '/donors': [PERMISSIONS.VIEW_ALL_DONORS],
    '/inventory': [PERMISSIONS.VIEW_INVENTORY],
    '/campaigns': [PERMISSIONS.VIEW_ALL_CAMPAIGNS],
    '/hospitals': [PERMISSIONS.VIEW_ALL_HOSPITALS],
    '/recipients': [PERMISSIONS.VIEW_ALL_RECIPIENTS],
    '/requests': [PERMISSIONS.VIEW_ALL_REQUESTS],
    '/notifications': [PERMISSIONS.VIEW_ALL_NOTIFICATIONS],
    '/reports': [PERMISSIONS.VIEW_ALL_REPORTS]
  };
  
  const requiredPermissions = routePermissions[route];
  if (!requiredPermissions) return true;
  
  return hasAnyPermission(userRole, requiredPermissions);
};