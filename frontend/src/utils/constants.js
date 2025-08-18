export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const USER_ROLES = {
  ADMIN: 'admin',
  HOSPITAL_STAFF: 'hospital_staff',
  DONOR: 'donor',
  RECIPIENT: 'recipient'
};

export const BLOOD_STATUS = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  USED: 'used',
  EXPIRED: 'expired'
};

export const URGENCY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  PARTIALLY_FULFILLED: 'partially_fulfilled',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
};

export const CAMPAIGN_STATUS = {
  PLANNED: 'planned',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const NOTIFICATION_TYPES = {
  APPOINTMENT_REMINDER: 'appointment_reminder',
  ELIGIBILITY_UPDATE: 'eligibility_update',
  CAMPAIGN_INVITATION: 'campaign_invitation',
  BLOOD_REQUEST: 'blood_request',
  LOW_STOCK_ALERT: 'low_stock_alert',
  EXPIRY_ALERT: 'expiry_alert',
  DONATION_THANKS: 'donation_thanks',
  TEST_RESULTS: 'test_results',
  EMERGENCY_REQUEST: 'emergency_request'
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  DONORS: '/donors',
  INVENTORY: '/inventory',
  CAMPAIGNS: '/campaigns',
  HOSPITALS: '/hospitals',
  RECIPIENTS: '/recipients',
  REQUESTS: '/requests',
  NOTIFICATIONS: '/notifications',
  REPORTS: '/reports',
  PROFILE: '/profile'
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME: 'theme'
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};