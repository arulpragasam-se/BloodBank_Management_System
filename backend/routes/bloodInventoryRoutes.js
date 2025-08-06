const express = require('express');
const bloodInventoryController = require('../controllers/bloodInventoryController');
const authMiddleware = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const validation = require('../middleware/validation');
const rateLimit = require('../middleware/rateLimit');
const errorHandler = require('../middleware/errorHandler');

const router = express.Router();

// Get all blood inventory
router.get('/',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validatePagination,
  validation.validateRequest({
    query: {
      bloodType: { type: 'bloodType', required: false },
      status: { type: 'enum', required: false, values: ['available', 'reserved', 'used', 'expired'] },
      expiring: { type: 'number', required: false, min: 1, max: 30 }
    }
  }),
  errorHandler.asyncHandler(bloodInventoryController.getAllInventory)
);

// Add new blood inventory
router.post('/',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.sanitizeInput,
  validation.validateRequest(validation.schemas.inventoryAddition),
  validation.validateRequest({
    body: {
      collectionDate: { type: 'string', required: false },
      testResults: { type: 'object', required: false },
      storageLocation: { type: 'object', required: false },
      notes: { type: 'string', required: false, maxLength: 500 }
    }
  }),
  errorHandler.asyncHandler(bloodInventoryController.addBloodInventory)
);

// Update blood inventory
router.put('/:id',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validateRequest(validation.schemas.objectIdParam),
  validation.sanitizeInput,
  validation.validateRequest({
    body: {
      status: { type: 'enum', required: false, values: ['available', 'reserved', 'used', 'expired'] },
      testResults: { type: 'object', required: false },
      storageLocation: { type: 'object', required: false },
      notes: { type: 'string', required: false, maxLength: 500 }
    }
  }),
  errorHandler.asyncHandler(bloodInventoryController.updateInventory)
);

// Get inventory statistics and alerts
router.get('/stats',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  errorHandler.asyncHandler(bloodInventoryController.getInventoryStats)
);

// Check and update expired blood
router.post('/check-expired',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  errorHandler.asyncHandler(bloodInventoryController.checkExpiredBlood)
);

// Send low stock alert
router.post('/low-stock-alert',
  authMiddleware.requireAuth,
  roleAuth.requireAdmin,
  validation.sanitizeInput,
  validation.validateRequest({
    body: {
      bloodType: { type: 'bloodType', required: true },
      threshold: { type: 'number', required: false, min: 1, max: 100 }
    }
  }),
  rateLimit.sms(),
  rateLimit.email(),
  errorHandler.asyncHandler(bloodInventoryController.sendLowStockAlert)
);

// Reserve blood units
router.post('/reserve',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.sanitizeInput,
  validation.validateRequest({
    body: {
      inventoryIds: { type: 'array', required: true, minItems: 1 },
      reservedFor: { type: 'string', required: false, maxLength: 200 }
    }
  }),
  errorHandler.asyncHandler(bloodInventoryController.reserveBlood)
);

// Get inventory by blood type
router.get('/blood-type/:bloodType',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validateRequest({
    params: {
      bloodType: { type: 'bloodType', required: true }
    }
  }),
  validation.validatePagination,
  errorHandler.asyncHandler(bloodInventoryController.getAllInventory)
);

// Get expiring blood inventory
router.get('/expiring/:days',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validateRequest({
    params: {
      days: { type: 'number', required: true, min: 1, max: 30 }
    }
  }),
  validation.validatePagination,
  errorHandler.asyncHandler(bloodInventoryController.getAllInventory)
);

// Delete inventory item (Admin only)
router.delete('/:id',
  authMiddleware.requireAuth,
  roleAuth.requireAdmin,
  validation.validateRequest(validation.schemas.objectIdParam),
  errorHandler.asyncHandler(bloodInventoryController.deleteInventory)
);

module.exports = router;