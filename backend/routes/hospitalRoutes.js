const express = require('express');
const hospitalController = require('../controllers/hospitalController');
const authMiddleware = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const validation = require('../middleware/validation');
const rateLimit = require('../middleware/rateLimit');
const errorHandler = require('../middleware/errorHandler');
const router = express.Router();

// Get all hospitals
router.get('/',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validatePagination,
  validation.validateRequest({
    query: {
      search: { type: 'string', required: false },
      district: { type: 'string', required: false },
      isActive: { type: 'string', required: false }
    }
  }),
  errorHandler.asyncHandler(hospitalController.getAllHospitals)
);

// Register new hospital
router.post('/',
  authMiddleware.requireAuth,
  roleAuth.requireAdmin,
  validation.sanitizeInput,
  validation.validateRequest({
    body: {
      name: { type: 'string', required: true, minLength: 3, maxLength: 100 },
      registrationNumber: { type: 'string', required: true },
      address: { type: 'object', required: true },
      contactInfo: { type: 'object', required: true }
    }
  }),
  errorHandler.asyncHandler(hospitalController.createHospital)
);

// Get hospital by ID
router.get('/:id',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validateRequest(validation.schemas.objectIdParam),
  errorHandler.asyncHandler(hospitalController.getHospitalById)
);

// Update hospital
router.put('/:id',
  authMiddleware.requireAuth,
  roleAuth.requireAdmin,
  validation.validateRequest(validation.schemas.objectIdParam),
  validation.sanitizeInput,
  validation.validateRequest({
    body: {
      name: { type: 'string', required: false, minLength: 3, maxLength: 100 },
      address: { type: 'object', required: false },
      contactInfo: { type: 'object', required: false },
      isActive: { type: 'string', required: false }
    }
  }),
  errorHandler.asyncHandler(hospitalController.updateHospital)
);

// Add staff member to hospital
router.post('/:id/staff',
  authMiddleware.requireAuth,
  roleAuth.requireAdmin,
  validation.validateRequest(validation.schemas.objectIdParam),
  validation.sanitizeInput,
  validation.validateRequest({
    body: {
      userId: { type: 'objectId', required: true },
      position: { type: 'enum', required: true, values: ['doctor', 'nurse', 'lab_technician', 'blood_bank_officer', 'administrator'] },
      department: { type: 'string', required: false }
    }
  }),
  errorHandler.asyncHandler(hospitalController.addStaffMember)
);

// Remove staff member from hospital
router.delete('/:id/staff/:userId',
  authMiddleware.requireAuth,
  roleAuth.requireAdmin,
  validation.validateRequest({
    params: {
      id: { type: 'objectId', required: true },
      userId: { type: 'objectId', required: true }
    }
  }),
  errorHandler.asyncHandler(hospitalController.removeStaffMember)
);

// Get hospital blood requests
router.get('/:id/requests',
  authMiddleware.requireAuth,
  roleAuth.allowRolesOrOwner(['admin', 'hospital_staff'], 'hospital'),
  validation.validateRequest(validation.schemas.objectIdParam),
  validation.validatePagination,
  validation.validateRequest({
    query: {
      status: { type: 'enum', required: false, values: ['pending', 'approved', 'partially_fulfilled', 'fulfilled', 'rejected', 'cancelled'] },
      urgency: { type: 'enum', required: false, values: ['low', 'medium', 'high', 'critical'] }
    }
  }),
  errorHandler.asyncHandler(hospitalController.getHospitalRequests)
);

// Create blood request
router.post('/:id/requests',
  authMiddleware.requireAuth,
  roleAuth.allowRolesOrOwner(['admin', 'hospital_staff'], 'hospital'),
  validation.validateRequest(validation.schemas.objectIdParam),
  validation.sanitizeInput,
  validation.validateBloodRequest,
  validation.validateRequest({
    body: {
      recipientId: { type: 'objectId', required: false },
      reason: { type: 'string', required: true, minLength: 10, maxLength: 500 },
      patientCondition: { type: 'string', required: true, minLength: 5, maxLength: 200 }
    }
  }),
  rateLimit.bloodRequest(),
  errorHandler.asyncHandler(hospitalController.createBloodRequest)
);

// Get hospital statistics
router.get('/:id/stats',
  authMiddleware.requireAuth,
  roleAuth.allowRolesOrOwner(['admin', 'hospital_staff'], 'hospital'),
  validation.validateRequest(validation.schemas.objectIdParam),
  errorHandler.asyncHandler(hospitalController.getHospitalStats)
);

// Get hospital inventory
router.get('/:id/inventory',
  authMiddleware.requireAuth,
  roleAuth.allowRolesOrOwner(['admin', 'hospital_staff'], 'hospital'),
  validation.validateRequest(validation.schemas.objectIdParam),
  validation.validatePagination,
  validation.validateRequest({
    query: {
      bloodType: { type: 'bloodType', required: false },
      status: { type: 'enum', required: false, values: ['available', 'reserved', 'used', 'expired'] }
    }
  }),
  errorHandler.asyncHandler(hospitalController.getHospitalInventory)
);

// Delete hospital (Admin only)
router.delete('/:id',
  authMiddleware.requireAuth,
  roleAuth.requireAdmin,
  validation.validateRequest(validation.schemas.objectIdParam),
  errorHandler.asyncHandler(hospitalController.deleteHospital)
);

module.exports = router;