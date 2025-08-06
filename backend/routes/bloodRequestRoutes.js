// routes/bloodRequestRoutes.js
const express = require('express');
const bloodRequestController = require('../controllers/bloodRequestController');
const authMiddleware = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const validation = require('../middleware/validation');
const rateLimit = require('../middleware/rateLimit');
const errorHandler = require('../middleware/errorHandler');

const router = express.Router();

// Get all blood requests
router.get('/',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validatePagination,
  validation.validateRequest({
    query: {
      status: { 
        type: 'enum', 
        required: false, 
        values: ['pending', 'approved', 'partially_fulfilled', 'fulfilled', 'rejected', 'cancelled'],
        allowArray: true // Add this flag
      },
      urgency: { 
        type: 'enum', 
        required: false, 
        values: ['low', 'medium', 'high', 'critical'],
        allowArray: true // Add this flag
      },
      bloodType: { type: 'bloodType', required: false },
      hospitalId: { type: 'objectId', required: false },
      search: { type: 'string', required: false }
    }
  }),
  errorHandler.asyncHandler(bloodRequestController.getAllRequests)
);

// Create new blood request
router.post('/',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.sanitizeInput,
  validation.validateRequest({
    body: {
      bloodType: { type: 'bloodType', required: true },
      units: { type: 'number', required: true, min: 1, max: 50 },
      urgency: { type: 'enum', required: true, values: ['low', 'medium', 'high', 'critical'] },
      requiredBy: { type: 'string', required: true },
      recipientId: { type: 'objectId', required: false },
      reason: { type: 'string', required: true, minLength: 10, maxLength: 500 },
      notes: { type: 'string', required: false, maxLength: 1000 }
    }
  }),
  errorHandler.asyncHandler(bloodRequestController.createRequest)
);

// Get request statistics
router.get('/stats',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  errorHandler.asyncHandler(bloodRequestController.getRequestStats)
);

// Get request by ID
router.get('/:id',
  authMiddleware.requireAuth,
  validation.validateRequest(validation.schemas.objectIdParam),
  roleAuth.allowRolesOrOwner(['admin', 'hospital_staff'], 'request'),
  errorHandler.asyncHandler(bloodRequestController.getRequestById)
);

// Update request status
router.patch('/:id/status',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validateRequest(validation.schemas.objectIdParam),
  validation.sanitizeInput,
  validation.validateRequest({
    body: {
      status: { type: 'enum', required: true, values: ['pending', 'approved', 'partially_fulfilled', 'fulfilled', 'rejected', 'cancelled'] },
      reason: { type: 'string', required: false, maxLength: 500 }
    }
  }),
  errorHandler.asyncHandler(bloodRequestController.updateRequestStatus)
);

// Delete request
router.delete('/:id',
  authMiddleware.requireAuth,
  roleAuth.requireAdmin,
  validation.validateRequest(validation.schemas.objectIdParam),
  errorHandler.asyncHandler(bloodRequestController.deleteRequest)
);

module.exports = router;