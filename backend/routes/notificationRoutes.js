const express = require('express');
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const validation = require('../middleware/validation');
const rateLimit = require('../middleware/rateLimit');
const errorHandler = require('../middleware/errorHandler');
const router = express.Router();

// Get user notifications
router.get('/',
  authMiddleware.requireAuth,
  validation.validatePagination,
  validation.validateRequest({
    query: {
      type: { type: 'enum', required: false, values: ['appointment_reminder', 'eligibility_update', 'campaign_invitation', 'blood_request', 'low_stock_alert', 'expiry_alert', 'donation_thanks', 'test_results', 'emergency_request'] },
      read: { type: 'string', required: false },
      priority: { type: 'enum', required: false, values: ['low', 'medium', 'high', 'urgent'] }
    }
  }),
  errorHandler.asyncHandler(notificationController.getUserNotifications)
);

// Create notification
router.post('/',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.sanitizeInput,
  validation.validateRequest({
    body: {
      recipient: { type: 'objectId', required: true },
      type: { type: 'enum', required: true, values: ['appointment_reminder', 'eligibility_update', 'campaign_invitation', 'blood_request', 'low_stock_alert', 'expiry_alert', 'donation_thanks', 'test_results', 'emergency_request'] },
      title: { type: 'string', required: true, minLength: 5, maxLength: 100 },
      message: { type: 'string', required: true, minLength: 10, maxLength: 500 },
      priority: { type: 'enum', required: false, values: ['low', 'medium', 'high', 'urgent'] },
      scheduledFor: { type: 'string', required: false }
    }
  }),
  errorHandler.asyncHandler(notificationController.createNotification)
);

// Mark notification as read
router.patch('/:id/read',
  authMiddleware.requireAuth,
  validation.validateRequest(validation.schemas.objectIdParam),
  errorHandler.asyncHandler(notificationController.markAsRead)
);

// Mark all notifications as read
router.patch('/mark-all-read',
  authMiddleware.requireAuth,
  errorHandler.asyncHandler(notificationController.markAllAsRead)
);

// Delete notification
router.delete('/:id',
  authMiddleware.requireAuth,
  validation.validateRequest(validation.schemas.objectIdParam),
  errorHandler.asyncHandler(notificationController.deleteNotification)
);

// Get notification statistics
router.get('/stats',
  authMiddleware.requireAuth,
  errorHandler.asyncHandler(notificationController.getNotificationStats)
);

// Send bulk notification
router.post('/bulk',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.sanitizeInput,
  validation.validateRequest({
    body: {
      recipients: { type: 'array', required: true },
      type: { type: 'enum', required: true, values: ['appointment_reminder', 'eligibility_update', 'campaign_invitation', 'blood_request', 'low_stock_alert', 'expiry_alert', 'donation_thanks', 'test_results', 'emergency_request'] },
      title: { type: 'string', required: true, minLength: 5, maxLength: 100 },
      message: { type: 'string', required: true, minLength: 10, maxLength: 500 },
      priority: { type: 'enum', required: false, values: ['low', 'medium', 'high', 'urgent'] },
      scheduledFor: { type: 'string', required: false }
    }
  }),
  rateLimit.bulk(),
  errorHandler.asyncHandler(notificationController.sendBulkNotification)
);

// Send notification to donors by blood type
router.post('/donors/blood-type',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.sanitizeInput,
  validation.validateRequest({
    body: {
      bloodTypes: { type: 'array', required: true },
      type: { type: 'enum', required: true, values: ['appointment_reminder', 'eligibility_update', 'campaign_invitation', 'blood_request', 'low_stock_alert', 'expiry_alert', 'donation_thanks', 'test_results', 'emergency_request'] },
      title: { type: 'string', required: true, minLength: 5, maxLength: 100 },
      message: { type: 'string', required: true, minLength: 10, maxLength: 500 },
      priority: { type: 'enum', required: false, values: ['low', 'medium', 'high', 'urgent'] },
      eligibleOnly: { type: 'boolean', required: false }
    }
  }),
  rateLimit.bulk(),
  errorHandler.asyncHandler(notificationController.sendNotificationToBloodType)
);

// Send emergency notification
router.post('/emergency',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.sanitizeInput,
  validation.validateRequest({
    body: {
      bloodType: { type: 'bloodType', required: true },
      urgency: { type: 'enum', required: true, values: ['high', 'critical'] },
      title: { type: 'string', required: true, minLength: 5, maxLength: 100 },
      message: { type: 'string', required: true, minLength: 10, maxLength: 500 },
      radius: { type: 'number', required: false, min: 1, max: 100 }
    }
  }),
  rateLimit.emergency(),
  errorHandler.asyncHandler(notificationController.sendEmergencyNotification)
);

// Get notification by ID
router.get('/:id',
  authMiddleware.requireAuth,
  validation.validateRequest(validation.schemas.objectIdParam),
  errorHandler.asyncHandler(notificationController.getNotificationById)
);

// Update notification
router.put('/:id',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validateRequest(validation.schemas.objectIdParam),
  validation.sanitizeInput,
  validation.validateRequest({
    body: {
      title: { type: 'string', required: false, minLength: 5, maxLength: 100 },
      message: { type: 'string', required: false, minLength: 10, maxLength: 500 },
      priority: { type: 'enum', required: false, values: ['low', 'medium', 'high', 'urgent'] },
      scheduledFor: { type: 'string', required: false }
    }
  }),
  errorHandler.asyncHandler(notificationController.updateNotification)
);

// Get scheduled notifications
router.get('/scheduled/upcoming',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validatePagination,
  validation.validateRequest({
    query: {
      days: { type: 'number', required: false, min: 1, max: 30 }
    }
  }),
  errorHandler.asyncHandler(notificationController.getScheduledNotifications)
);

// Cancel scheduled notification
router.patch('/:id/cancel',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validateRequest(validation.schemas.objectIdParam),
  errorHandler.asyncHandler(notificationController.cancelScheduledNotification)
);

module.exports = router;