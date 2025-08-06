const CONSTANTS = {
  BLOOD_TYPES: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  
  USER_ROLES: {
    ADMIN: 'admin',
    HOSPITAL_STAFF: 'hospital_staff',
    DONOR: 'donor',
    RECIPIENT: 'recipient'
  },

  BLOOD_STATUS: {
    AVAILABLE: 'available',
    RESERVED: 'reserved',
    USED: 'used',
    EXPIRED: 'expired'
  },

  TEST_RESULTS: {
    POSITIVE: 'positive',
    NEGATIVE: 'negative',
    PENDING: 'pending'
  },

  URGENCY_LEVELS: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  },

  REQUEST_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    PARTIALLY_FULFILLED: 'partially_fulfilled',
    FULFILLED: 'fulfilled',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled'
  },

  CAMPAIGN_STATUS: {
    PLANNED: 'planned',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },

  DONATION_STATUS: {
    COLLECTED: 'collected',
    TESTED: 'tested',
    PROCESSED: 'processed',
    STORED: 'stored',
    DISCARDED: 'discarded'
  },

  NOTIFICATION_TYPES: {
    APPOINTMENT_REMINDER: 'appointment_reminder',
    ELIGIBILITY_UPDATE: 'eligibility_update',
    CAMPAIGN_INVITATION: 'campaign_invitation',
    BLOOD_REQUEST: 'blood_request',
    LOW_STOCK_ALERT: 'low_stock_alert',
    EXPIRY_ALERT: 'expiry_alert',
    DONATION_THANKS: 'donation_thanks',
    TEST_RESULTS: 'test_results',
    EMERGENCY_REQUEST: 'emergency_request'
  },

  NOTIFICATION_PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
  },

  CHANNEL_STATUS: {
    PENDING: 'pending',
    SENT: 'sent',
    DELIVERED: 'delivered',
    FAILED: 'failed'
  },

  HOSPITAL_POSITIONS: {
    DOCTOR: 'doctor',
    NURSE: 'nurse',
    LAB_TECHNICIAN: 'lab_technician',
    BLOOD_BANK_OFFICER: 'blood_bank_officer',
    ADMINISTRATOR: 'administrator'
  },

  DONOR_STATUS: {
    REGISTERED: 'registered',
    CONFIRMED: 'confirmed',
    ATTENDED: 'attended',
    DONATED: 'donated',
    CANCELLED: 'cancelled'
  },

  BLOOD_COMPONENTS: {
    WHOLE_BLOOD: 'whole_blood',
    RED_CELLS: 'red_cells',
    PLATELETS: 'platelets',
    PLASMA: 'plasma',
    CRYOPRECIPITATE: 'cryoprecipitate'
  },

  EXPIRY_DAYS: {
    WHOLE_BLOOD: 35,
    RED_CELLS: 42,
    PLATELETS: 5,
    PLASMA: 365,
    CRYOPRECIPITATE: 365
  },

  MINIMUM_REQUIREMENTS: {
    DONOR_AGE_MIN: 18,
    DONOR_AGE_MAX: 65,
    DONOR_WEIGHT_MIN: 50,
    HEMOGLOBIN_MIN: 12.5,
    BLOOD_PRESSURE_SYSTOLIC_MIN: 90,
    BLOOD_PRESSURE_SYSTOLIC_MAX: 180,
    BLOOD_PRESSURE_DIASTOLIC_MIN: 60,
    BLOOD_PRESSURE_DIASTOLIC_MAX: 120
  },

  DONATION_INTERVALS: {
    MALE: 84, // days (12 weeks)
    FEMALE: 112 // days (16 weeks)
  },

  STOCK_THRESHOLDS: {
    CRITICAL: 5,
    LOW: 10,
    MEDIUM: 20,
    GOOD: 30
  },

  EXPIRY_ALERTS: {
    URGENT: 1, // days
    WARNING: 3, // days
    NOTICE: 7 // days
  },

  PAGINATION: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    DEFAULT_PAGE: 1
  },

  BLOOD_COMPATIBILITY: {
    'A+': {
      canReceiveFrom: ['A+', 'A-', 'O+', 'O-'],
      canDonateTo: ['A+', 'AB+']
    },
    'A-': {
      canReceiveFrom: ['A-', 'O-'],
      canDonateTo: ['A+', 'A-', 'AB+', 'AB-']
    },
    'B+': {
      canReceiveFrom: ['B+', 'B-', 'O+', 'O-'],
      canDonateTo: ['B+', 'AB+']
    },
    'B-': {
      canReceiveFrom: ['B-', 'O-'],
      canDonateTo: ['B+', 'B-', 'AB+', 'AB-']
    },
    'AB+': {
      canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      canDonateTo: ['AB+']
    },
    'AB-': {
      canReceiveFrom: ['A-', 'B-', 'AB-', 'O-'],
      canDonateTo: ['AB+', 'AB-']
    },
    'O+': {
      canReceiveFrom: ['O+', 'O-'],
      canDonateTo: ['A+', 'B+', 'AB+', 'O+']
    },
    'O-': {
      canReceiveFrom: ['O-'],
      canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    }
  },

  MEDICAL_RESTRICTIONS: [
    'hiv',
    'hepatitis_b',
    'hepatitis_c',
    'syphilis',
    'cancer',
    'heart_disease',
    'diabetes_insulin',
    'epilepsy',
    'tuberculosis'
  ],

  RESPONSE_MESSAGES: {
    SUCCESS: {
      CREATED: 'Resource created successfully',
      UPDATED: 'Resource updated successfully',
      DELETED: 'Resource deleted successfully',
      RETRIEVED: 'Resource retrieved successfully'
    },
    ERROR: {
      NOT_FOUND: 'Resource not found',
      UNAUTHORIZED: 'Unauthorized access',
      FORBIDDEN: 'Access forbidden',
      VALIDATION_ERROR: 'Validation error',
      INTERNAL_ERROR: 'Internal server error',
      DUPLICATE_ENTRY: 'Resource already exists'
    },
    AUTH: {
      LOGIN_SUCCESS: 'Login successful',
      LOGOUT_SUCCESS: 'Logout successful',
      INVALID_CREDENTIALS: 'Invalid credentials',
      TOKEN_EXPIRED: 'Token expired',
      TOKEN_INVALID: 'Invalid token'
    }
  },

  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500
  },

  FILE_UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    UPLOAD_PATHS: {
      PROFILE_IMAGES: 'uploads/profiles/',
      DOCUMENTS: 'uploads/documents/',
      REPORTS: 'uploads/reports/'
    }
  },

  DATE_FORMATS: {
    DATE_ONLY: 'YYYY-MM-DD',
    DATE_TIME: 'YYYY-MM-DD HH:mm',
    DISPLAY_DATE: 'DD/MM/YYYY',
    DISPLAY_DATE_TIME: 'DD/MM/YYYY HH:mm'
  },

  REGEX_PATTERNS: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[\+]?[1-9][\d]{0,15}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
    ALPHANUMERIC: /^[a-zA-Z0-9\s]+$/,
    NUMERIC: /^\d+$/
  },

  SMS_TEMPLATES: {
    APPOINTMENT_REMINDER: 'Blood Donation Reminder: Your appointment is on {date} at {venue}. Arrive 15 mins early. Thank you!',
    ELIGIBILITY_UPDATE: 'You are now eligible to donate blood! Visit our center or check campaigns.',
    CAMPAIGN_INVITATION: 'Blood Campaign: "{title}" on {date} at {venue}. Your donation saves lives!',
    EMERGENCY_REQUEST: 'URGENT: {bloodType} needed at {hospital}. If eligible, contact us immediately!',
    LOW_STOCK: 'LOW STOCK: {bloodType} critically low ({units} units). Action needed.',
    DONATION_THANKS: 'Thank you {name} for donating {bloodType} blood! Your generosity saves lives.'
  },

  ENVIRONMENT: {
    DEVELOPMENT: 'development',
    TESTING: 'testing',
    PRODUCTION: 'production'
  }
};

module.exports = CONSTANTS;