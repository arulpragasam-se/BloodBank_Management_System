const express = require('express');
const donorController = require('../controllers/donorController');
const authMiddleware = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const validation = require('../middleware/validation');
const rateLimit = require('../middleware/rateLimit');
const errorHandler = require('../middleware/errorHandler');

const router = express.Router();

// Get all donors (Admin/Hospital Staff only)
router.get('/',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validatePagination,
  rateLimit.search(),
  errorHandler.asyncHandler(donorController.getAllDonors)
);

// Get donor by ID
router.get('/:id',
  authMiddleware.requireAuth,
  validation.validateRequest(validation.schemas.objectIdParam),
  roleAuth.allowRolesOrOwner(['admin', 'hospital_staff'], 'donor'),
  errorHandler.asyncHandler(donorController.getDonorById)
);

// Create donor (Admin only - doesn't handle authentication)
router.post('/',
  authMiddleware.requireAuth,
  roleAuth.requireRole(['admin', 'hospital_staff']),
  validation.sanitizeInput,
  validation.validateRequest({
    body: {
      // User data
      name: { type: 'string', required: true, minLength: 2, maxLength: 50 },
      email: { type: 'email', required: true },
      phone: { type: 'phone', required: true },
      password: { type: 'password', required: true },
      role: { type: 'enum', required: false, values: ['donor'], default: 'donor' },
      
      // Donor specific data
      bloodType: { type: 'bloodType', required: true },
      dateOfBirth: { type: 'string', required: true },
      weight: { type: 'number', required: true, min: 30, max: 300 },
      height: { type: 'number', required: true, min: 100, max: 250 },
      address: { type: 'object', required: false },
      emergencyContact: { type: 'object', required: false },
      medicalHistory: { type: 'object', required: false }
    }
  }),
  errorHandler.asyncHandler(donorController.createDonor)
);

// Update donor information
router.put('/:id',
  authMiddleware.requireAuth,
  validation.validateRequest(validation.schemas.objectIdParam),
  roleAuth.allowRolesOrOwner(['admin', 'hospital_staff'], 'donor'),
  validation.sanitizeInput,
  validation.validateRequest({
    body: {
      bloodType: { type: 'bloodType', required: false },
      weight: { type: 'number', required: false, min: 30, max: 300 },
      height: { type: 'number', required: false, min: 100, max: 250 }
    }
  }),
  errorHandler.asyncHandler(donorController.updateDonor)
);

// Check donor eligibility
router.post('/:id/check-eligibility',
  authMiddleware.requireAuth,
  validation.validateRequest(validation.schemas.objectIdParam),
  roleAuth.requireHospitalStaff,
  errorHandler.asyncHandler(donorController.checkEligibility)
);

// Get donor donation history
router.get('/:id/history',
  authMiddleware.requireAuth,
  validation.validateRequest(validation.schemas.objectIdParam),
  roleAuth.allowRolesOrOwner(['admin', 'hospital_staff'], 'donor'),
  validation.validatePagination,
  errorHandler.asyncHandler(donorController.getDonorHistory)
);

// Get eligible donors for blood type
router.get('/eligible/blood-type',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validateRequest({
    query: {
      bloodType: { type: 'bloodType', required: true },
      urgency: { type: 'enum', required: false, values: ['low', 'medium', 'high', 'critical'] }
    }
  }),
  errorHandler.asyncHandler(donorController.getEligibleDonors)
);

// Register donor for campaign
router.post('/register-campaign',
  authMiddleware.requireAuth,
  roleAuth.requireRole(['donor', 'admin', 'hospital_staff']),
  validation.sanitizeInput,
  validation.validateRequest({
    body: {
      donorId: { type: 'objectId', required: true },
      campaignId: { type: 'objectId', required: true },
      appointmentTime: { type: 'string', required: false }
    }
  }),
  rateLimit.campaignRegistration(),
  errorHandler.asyncHandler(donorController.registerForCampaign)
);

// Get donor campaigns
router.get('/:id/campaigns',
  authMiddleware.requireAuth,
  validation.validateRequest(validation.schemas.objectIdParam),
  roleAuth.allowRolesOrOwner(['admin', 'hospital_staff'], 'donor'),
  validation.validateRequest({
    query: {
      status: { type: 'enum', required: false, values: ['registered', 'confirmed', 'attended', 'donated', 'cancelled'] }
    }
  }),
  errorHandler.asyncHandler(donorController.getDonorCampaigns)
);

// Send bulk notification to donors
router.post('/bulk-notification',
  authMiddleware.requireAuth,
  roleAuth.requireAdmin,
  validation.sanitizeInput,
  validation.validateRequest({
    body: {
      bloodType: { type: 'bloodType', required: true },
      message: { type: 'string', required: true, minLength: 10, maxLength: 160 },
      urgency: { type: 'enum', required: false, values: ['low', 'medium', 'high', 'critical'] }
    }
  }),
  rateLimit.sms(),
  rateLimit.bulk(),
  errorHandler.asyncHandler(donorController.sendBulkNotification)
);

// Get donor statistics
router.get('/:id/stats',
  authMiddleware.requireAuth,
  validation.validateRequest(validation.schemas.objectIdParam),
  roleAuth.allowRolesOrOwner(['admin', 'hospital_staff'], 'donor'),
  errorHandler.asyncHandler(donorController.getDonorStats)
);

// Delete donor (Admin only)
router.delete('/:id',
  authMiddleware.requireAuth,
  validation.validateRequest(validation.schemas.objectIdParam),
  roleAuth.requireAdmin,
  errorHandler.asyncHandler(donorController.deleteDonor)
);

module.exports = router;