const express = require('express');
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const validation = require('../middleware/validation');
const rateLimit = require('../middleware/rateLimit');
const errorHandler = require('../middleware/errorHandler');
const router = express.Router();

// Generate donor report
router.get('/donors',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validateDateRange,
  validation.validateRequest({
    query: {
      bloodType: { type: 'bloodType', required: false },
      format: { type: 'enum', required: false, values: ['json', 'csv', 'pdf'] },
      includeInactive: { type: 'string', required: false }
    }
  }),
  rateLimit.reports(),
  errorHandler.asyncHandler(reportController.generateDonorReport)
);

// Generate blood inventory report
router.get('/inventory',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validateDateRange,
  validation.validateRequest({
    query: {
      bloodType: { type: 'bloodType', required: false },
      status: { type: 'enum', required: false, values: ['available', 'reserved', 'used', 'expired'] },
      format: { type: 'enum', required: false, values: ['json', 'csv', 'pdf'] },
      includeExpired: { type: 'string', required: false }
    }
  }),
  rateLimit.reports(),
  errorHandler.asyncHandler(reportController.generateInventoryReport)
);

// Generate campaign report
router.get('/campaigns',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validateDateRange,
  validation.validateRequest({
    query: {
      status: { type: 'enum', required: false, values: ['planned', 'active', 'completed', 'cancelled'] },
      format: { type: 'enum', required: false, values: ['json', 'csv', 'pdf'] }
    }
  }),
  rateLimit.reports(),
  errorHandler.asyncHandler(reportController.generateCampaignReport)
);

// Generate blood request report
router.get('/requests',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validateDateRange,
  validation.validateRequest({
    query: {
      status: { type: 'enum', required: false, values: ['pending', 'approved', 'fulfilled', 'cancelled'] },
      urgency: { type: 'enum', required: false, values: ['low', 'medium', 'high', 'critical'] },
      hospitalId: { type: 'objectId', required: false },
      format: { type: 'enum', required: false, values: ['json', 'csv', 'pdf'] }
    }
  }),
  rateLimit.reports(),
  errorHandler.asyncHandler(reportController.generateRequestReport)
);

// Generate financial report
router.get('/financial',
  authMiddleware.requireAuth,
  roleAuth.requireAdmin,
  validation.validateDateRange,
  validation.validateRequest({
    query: {
      format: { type: 'enum', required: false, values: ['json', 'csv', 'pdf'] },
      includeProjections: { type: 'string', required: false }
    }
  }),
  rateLimit.reports(),
  errorHandler.asyncHandler(reportController.generateFinancialReport)
);

// Generate donor engagement report
router.get('/donor-engagement',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validateDateRange,
  validation.validateRequest({
    query: {
      bloodType: { type: 'bloodType', required: false },
      district: { type: 'string', required: false },
      format: { type: 'enum', required: false, values: ['json', 'csv', 'pdf'] }
    }
  }),
  rateLimit.reports(),
  errorHandler.asyncHandler(reportController.generateDonorEngagementReport)
);

// Generate custom report
router.post('/custom',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.sanitizeInput,
  validation.validateRequest({
    body: {
      title: { type: 'string', required: true, minLength: 5, maxLength: 100 },
      description: { type: 'string', required: false, maxLength: 500 },
      criteria: { type: 'object', required: true },
      format: { type: 'enum', required: false, values: ['json', 'csv', 'pdf'] }
    }
  }),
  validation.validateDateRange,
  rateLimit.reports(),
  errorHandler.asyncHandler(reportController.generateCustomReport)
);

// Get report history
router.get('/history',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validatePagination,
  validation.validateRequest({
    query: {
      type: { type: 'string', required: false },
      generatedBy: { type: 'objectId', required: false }
    }
  }),
  errorHandler.asyncHandler(reportController.getReportHistory)
);

// Download report
router.get('/download/:reportId',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validateRequest({
    params: {
      reportId: { type: 'objectId', required: true }
    }
  }),
  errorHandler.asyncHandler(reportController.downloadReport)
);

// Get report by ID
router.get('/:reportId',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validateRequest({
    params: {
      reportId: { type: 'objectId', required: true }
    }
  }),
  errorHandler.asyncHandler(reportController.getReportById)
);

// Generate analytics dashboard data
router.get('/analytics/dashboard',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validateRequest({
    query: {
      period: { type: 'enum', required: false, values: ['week', 'month', 'quarter', 'year'] }
    }
  }),
  errorHandler.asyncHandler(reportController.getDashboardAnalytics)
);

// Generate blood availability forecast
router.get('/forecast/availability',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validateRequest({
    query: {
      bloodType: { type: 'bloodType', required: false },
      days: { type: 'number', required: false, min: 7, max: 90 },
      format: { type: 'enum', required: false, values: ['json', 'csv', 'pdf'] }
    }
  }),
  rateLimit.reports(),
  errorHandler.asyncHandler(reportController.generateAvailabilityForecast)
);

// Generate donor retention analysis
router.get('/analytics/donor-retention',
  authMiddleware.requireAuth,
  roleAuth.requireHospitalStaff,
  validation.validateDateRange,
  validation.validateRequest({
    query: {
      bloodType: { type: 'bloodType', required: false },
      format: { type: 'enum', required: false, values: ['json', 'csv', 'pdf'] }
    }
  }),
  rateLimit.reports(),
  errorHandler.asyncHandler(reportController.generateDonorRetentionAnalysis)
);

// Generate hospital performance report
router.get('/hospital-performance',
  authMiddleware.requireAuth,
  roleAuth.requireAdmin,
  validation.validateDateRange,
  validation.validateRequest({
    query: {
      hospitalId: { type: 'objectId', required: false },
      format: { type: 'enum', required: false, values: ['json', 'csv', 'pdf'] }
    }
  }),
  rateLimit.reports(),
  errorHandler.asyncHandler(reportController.generateHospitalPerformanceReport)
);

// Schedule automatic report
router.post('/schedule',
  authMiddleware.requireAuth,
  roleAuth.requireAdmin,
  validation.sanitizeInput,
  validation.validateRequest({
    body: {
      reportType: { type: 'enum', required: true, values: ['donors', 'inventory', 'campaigns', 'requests', 'financial'] },
      frequency: { type: 'enum', required: true, values: ['daily', 'weekly', 'monthly', 'quarterly'] },
      recipients: { type: 'array', required: true },
      format: { type: 'enum', required: false, values: ['json', 'csv', 'pdf'] },
      criteria: { type: 'object', required: false }
    }
  }),
  errorHandler.asyncHandler(reportController.scheduleAutomaticReport)
);

// Delete report (Admin only)
router.delete('/:reportId',
  authMiddleware.requireAuth,
  roleAuth.requireAdmin,
  validation.validateRequest({
    params: {
      reportId: { type: 'objectId', required: true }
    }
  }),
  errorHandler.asyncHandler(reportController.deleteReport)
);

module.exports = router;