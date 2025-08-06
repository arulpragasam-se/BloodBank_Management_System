const express = require('express');
const campaignController = require('../controllers/campaignController');
const authMiddleware = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const validation = require('../middleware/validation');
const rateLimit = require('../middleware/rateLimit');
const errorHandler = require('../middleware/errorHandler');

const router = express.Router();

// Get all campaigns
router.get('/',
  authMiddleware.optional,
  validation.validatePagination,
  validation.validateRequest({
    query: {
      status: { type: 'enum', required: false, values: ['planned', 'active', 'completed', 'cancelled'] },
      bloodType: { type: 'bloodType', required: false },
      search: { type: 'string', required: false },
      upcoming: { type: 'string', required: false }
    }
  }),
  errorHandler.asyncHandler(campaignController.getAllCampaigns)
);

// Create new campaign
router.post('/',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.sanitizeInput,
  validation.validateRequest(validation.schemas.campaignCreation),
  validation.validateRequest({
    body: {
      location: { type: 'object', required: true },
      targetBloodTypes: { type: 'array', required: false },
      targetDonors: { type: 'number', required: false, min: 0 },
      isPublic: { type: 'string', required: false }
    }
  }),
  validation.validateBusinessRules('campaign_scheduling'),
  errorHandler.asyncHandler(campaignController.createCampaign)
);

// Get campaign by ID
router.get('/:id',
  authMiddleware.optional,
  validation.validateRequest(validation.schemas.objectIdParam),
  errorHandler.asyncHandler(campaignController.getCampaignById)
);

// Update campaign
router.put('/:id',
  authMiddleware.requireAuth,
  validation.validateRequest(validation.schemas.objectIdParam),
  roleAuth.allowRolesOrOwner(['admin', 'hospital_staff'], 'campaign'),
  validation.sanitizeInput,
  validation.validateRequest({
    body: {
      title: { type: 'string', required: false, minLength: 5, maxLength: 100 },
      description: { type: 'string', required: false, minLength: 10, maxLength: 500 },
      startDate: { type: 'string', required: false },
      endDate: { type: 'string', required: false },
      location: { type: 'object', required: false },
      targetBloodTypes: { type: 'array', required: false },
      targetDonors: { type: 'number', required: false, min: 0 },
      status: { type: 'enum', required: false, values: ['planned', 'active', 'completed', 'cancelled'] },
      isPublic: { type: 'string', required: false }
    }
  }),
  validation.validateDateRange,
  errorHandler.asyncHandler(campaignController.updateCampaign)
);

// Register donor for campaign
router.post('/:id/register',
  authMiddleware.requireAuth,
  roleAuth.requireRole(['donor', 'admin', 'hospital_staff']),
  validation.validateRequest(validation.schemas.objectIdParam),
  validation.sanitizeInput,
  validation.validateRequest({
    body: {
      donorId: { type: 'objectId', required: true },
      appointmentTime: { type: 'string', required: false }
    }
  }),
  rateLimit.campaignRegistration(),
  errorHandler.asyncHandler(campaignController.registerDonor)
);

// Update donor status in campaign
router.put('/:id/donors/:donorId',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validateRequest({
    params: {
      id: { type: 'objectId', required: true },
      donorId: { type: 'objectId', required: true }
    }
  }),
  validation.sanitizeInput,
  validation.validateRequest({
    body: {
      status: { type: 'enum', required: true, values: ['registered', 'confirmed', 'attended', 'donated', 'cancelled'] },
      notes: { type: 'string', required: false, maxLength: 500 }
    }
  }),
  errorHandler.asyncHandler(campaignController.updateDonorStatus)
);

// Send campaign reminders
router.post('/:id/send-reminders',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validateRequest(validation.schemas.objectIdParam),
  rateLimit.sms(),
  rateLimit.email(),
  errorHandler.asyncHandler(campaignController.sendCampaignReminders)
);

// Get campaign statistics
router.get('/:id/stats',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validateRequest(validation.schemas.objectIdParam),
  errorHandler.asyncHandler(campaignController.getCampaignStats)
);

// Get upcoming campaigns
router.get('/status/upcoming',
  authMiddleware.optional,
  validation.validatePagination,
  validation.validateRequest({
    query: {
      bloodType: { type: 'bloodType', required: false },
      days: { type: 'number', required: false, min: 1, max: 365 }
    }
  }),
  errorHandler.asyncHandler(campaignController.getAllCampaigns)
);

// Get active campaigns
router.get('/status/active',
  authMiddleware.optional,
  validation.validatePagination,
  errorHandler.asyncHandler(campaignController.getAllCampaigns)
);

// Get campaign participants
router.get('/:id/participants',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validateRequest(validation.schemas.objectIdParam),
  validation.validatePagination,
  validation.validateRequest({
    query: {
      status: { type: 'enum', required: false, values: ['registered', 'confirmed', 'attended', 'donated', 'cancelled'] }
    }
  }),
  errorHandler.asyncHandler(campaignController.getCampaignById)
);

// Cancel campaign
router.patch('/:id/cancel',
  authMiddleware.requireAuth,
  validation.validateRequest(validation.schemas.objectIdParam),
  roleAuth.allowRolesOrOwner(['admin', 'hospital_staff'], 'campaign'),
  validation.sanitizeInput,
  validation.validateRequest({
    body: {
      reason: { type: 'string', required: false, maxLength: 500 }
    }
  }),
  errorHandler.asyncHandler(campaignController.updateCampaign)
);

// Complete campaign
router.patch('/:id/complete',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validateRequest(validation.schemas.objectIdParam),
  validation.sanitizeInput,
  validation.validateRequest({
    body: {
      results: { type: 'object', required: false }
    }
  }),
  errorHandler.asyncHandler(campaignController.updateCampaign)
);

// Delete campaign (Admin only)
router.delete('/:id',
  authMiddleware.requireAuth,
  roleAuth.requireAdmin,
  validation.validateRequest(validation.schemas.objectIdParam),
  errorHandler.asyncHandler(campaignController.deleteCampaign)
);

module.exports = router;