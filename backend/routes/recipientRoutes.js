const express = require('express');
const recipientController = require('../controllers/recipientController');
const authMiddleware = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const validation = require('../middleware/validation');
const rateLimit = require('../middleware/rateLimit');
const errorHandler = require('../middleware/errorHandler');
const router = express.Router();

// Get all recipients
router.get('/',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validatePagination,
  validation.validateRequest({
    query: {
      search: { type: 'string', required: false },
      bloodType: { type: 'bloodType', required: false },
      district: { type: 'string', required: false },
      isActive: { type: 'string', required: false },
      medicalCondition: { type: 'string', required: false }
    }
  }),
  errorHandler.asyncHandler(recipientController.getAllRecipients)
);

// Register new recipient
router.post('/',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.sanitizeInput,
  validation.validateRequest({
    body: {
      name: { type: 'string', required: true, minLength: 2, maxLength: 100 },
      email: { type: 'email', required: true },
      phone: { type: 'string', required: true },
      dateOfBirth: { type: 'string', required: true },
      bloodType: { type: 'bloodType', required: true },
      address: { type: 'object', required: true },
      emergencyContact: { type: 'object', required: true },
      medicalCondition: { type: 'string', required: true, minLength: 5, maxLength: 200 },
      allergies: { type: 'array', required: false },
      currentMedications: { type: 'array', required: false }
    }
  }),
  errorHandler.asyncHandler(recipientController.createRecipient)
);

// Get recipient by ID
router.get('/:id',
  authMiddleware.requireAuth,
  validation.validateRequest(validation.schemas.objectIdParam),
  roleAuth.allowRolesOrOwner(['admin', 'hospital_staff'], 'recipient'),
  errorHandler.asyncHandler(recipientController.getRecipientById)
);

// Update recipient information
router.put('/:id',
  authMiddleware.requireAuth,
  validation.validateRequest(validation.schemas.objectIdParam),
  roleAuth.allowRolesOrOwner(['admin', 'hospital_staff'], 'recipient'),
  validation.sanitizeInput,
  validation.validateRequest({
    body: {
      medicalCondition: { type: 'string', required: false, minLength: 5, maxLength: 200 },
      emergencyContact: { type: 'object', required: false },
      allergies: { type: 'array', required: false },
      currentMedications: { type: 'array', required: false },
      isActive: { type: 'string', required: false }
    }
  }),
  errorHandler.asyncHandler(recipientController.updateRecipient)
);

// Get recipient transfusion history
router.get('/:id/transfusions',
  authMiddleware.requireAuth,
  validation.validateRequest(validation.schemas.objectIdParam),
  roleAuth.allowRolesOrOwner(['admin', 'hospital_staff'], 'recipient'),
  validation.validatePagination,
  validation.validateDateRange,
  errorHandler.asyncHandler(recipientController.getTransfusionHistory)
);

// Add transfusion record
router.post('/:id/transfusions',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validateRequest(validation.schemas.objectIdParam),
  validation.sanitizeInput,
  validation.validateRequest({
    body: {
      date: { type: 'string', required: true },
      bloodType: { type: 'bloodType', required: true },
      units: { type: 'number', required: true, min: 1, max: 10 },
      hospitalId: { type: 'objectId', required: true },
      reason: { type: 'string', required: false, maxLength: 200 },
      complications: { type: 'string', required: false, maxLength: 500 }
    }
  }),
  errorHandler.asyncHandler(recipientController.addTransfusionRecord)
);

// Get compatible blood types for recipient
router.get('/:id/compatible-blood',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validateRequest(validation.schemas.objectIdParam),
  errorHandler.asyncHandler(recipientController.getCompatibleBloodTypes)
);

// Get recipient blood requests
router.get('/:id/requests',
  authMiddleware.requireAuth,
  validation.validateRequest(validation.schemas.objectIdParam),
  roleAuth.allowRolesOrOwner(['admin', 'hospital_staff'], 'recipient'),
  validation.validatePagination,
  validation.validateRequest({
    query: {
      status: { type: 'enum', required: false, values: ['pending', 'approved', 'partially_fulfilled', 'fulfilled', 'rejected', 'cancelled'] }
    }
  }),
  errorHandler.asyncHandler(recipientController.getRecipientRequests)
);

// Create blood request for recipient
router.post('/:id/requests',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validateRequest(validation.schemas.objectIdParam),
  validation.sanitizeInput,
  validation.validateBloodRequest,
  validation.validateRequest({
    body: {
      bloodType: { type: 'bloodType', required: true },
      units: { type: 'number', required: true, min: 1, max: 10 },
      urgency: { type: 'enum', required: true, values: ['low', 'medium', 'high', 'critical'] },
      reason: { type: 'string', required: true, minLength: 10, maxLength: 500 },
      patientCondition: { type: 'string', required: true, minLength: 5, maxLength: 200 },
      requiredBy: { type: 'string', required: true },
      hospitalId: { type: 'objectId', required: true }
    }
  }),
  rateLimit.bloodRequest(),
  errorHandler.asyncHandler(recipientController.createBloodRequest)
);

// Get recipient statistics
router.get('/:id/stats',
  authMiddleware.requireAuth,
  validation.validateRequest(validation.schemas.objectIdParam),
  roleAuth.allowRolesOrOwner(['admin', 'hospital_staff'], 'recipient'),
  errorHandler.asyncHandler(recipientController.getRecipientStats)
);

// Search recipients by blood type compatibility
router.get('/search/compatible/:bloodType',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validateRequest({
    params: {
      bloodType: { type: 'bloodType', required: true }
    }
  }),
  validation.validatePagination,
  errorHandler.asyncHandler(recipientController.searchCompatibleRecipients)
);

// Get recipients by medical condition
router.get('/search/condition/:condition',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validateRequest({
    params: {
      condition: { type: 'string', required: true }
    }
  }),
  validation.validatePagination,
  errorHandler.asyncHandler(recipientController.getRecipientsByCondition)
);

// Update recipient medical status
router.patch('/:id/medical-status',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validateRequest(validation.schemas.objectIdParam),
  validation.sanitizeInput,
  validation.validateRequest({
    body: {
      medicalCondition: { type: 'string', required: false, minLength: 5, maxLength: 200 },
      currentMedications: { type: 'array', required: false },
      allergies: { type: 'array', required: false },
      notes: { type: 'string', required: false, maxLength: 500 }
    }
  }),
  errorHandler.asyncHandler(recipientController.updateMedicalStatus)
);

// Mark recipient as inactive/active
router.patch('/:id/status',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validateRequest(validation.schemas.objectIdParam),
  validation.validateRequest({
    body: {
      isActive: { type: 'boolean', required: true },
      reason: { type: 'string', required: false, maxLength: 200 }
    }
  }),
  errorHandler.asyncHandler(recipientController.updateRecipientStatus)
);

// Delete recipient (Admin only)
router.delete('/:id',
  authMiddleware.requireAuth,
  roleAuth.requireAdmin,
  validation.validateRequest(validation.schemas.objectIdParam),
  errorHandler.asyncHandler(recipientController.deleteRecipient)
);

module.exports = router;