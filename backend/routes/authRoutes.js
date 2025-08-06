const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const validation = require('../middleware/validation');
const rateLimit = require('../middleware/rateLimit');
const errorHandler = require('../middleware/errorHandler');

const router = express.Router();

// Register new user
router.post('/register',
  rateLimit.auth(),
  validation.sanitizeInput,
  validation.validateRequest(validation.schemas.userRegistration),
  errorHandler.asyncHandler(authController.register)
);

// User login
router.post('/login',
  rateLimit.auth(),
  validation.sanitizeInput,
  validation.validateRequest(validation.schemas.userLogin),
  errorHandler.asyncHandler(authController.login)
);

// Refresh access token
router.post('/refresh-token',
  rateLimit.general(),
  authMiddleware.validateRefreshToken,
  errorHandler.asyncHandler(authController.refreshToken)
);

// User logout
router.post('/logout',
  authMiddleware.requireAuth,
  errorHandler.asyncHandler(authController.logout)
);

// Forgot password
router.post('/forgot-password',
  rateLimit.passwordReset(),
  validation.sanitizeInput,
  validation.validateRequest({
    body: {
      email: { type: 'email', required: true }
    }
  }),
  errorHandler.asyncHandler(authController.forgotPassword)
);

// Reset password
router.post('/reset-password',
  rateLimit.passwordReset(),
  validation.sanitizeInput,
  validation.validateRequest({
    body: {
      token: { type: 'string', required: true },
      newPassword: { type: 'password', required: true }
    }
  }),
  errorHandler.asyncHandler(authController.resetPassword)
);

// Change password (authenticated)
router.post('/change-password',
  authMiddleware.requireAuth,
  validation.sanitizeInput,
  validation.validateRequest({
    body: {
      currentPassword: { type: 'string', required: true },
      newPassword: { type: 'password', required: true }
    }
  }),
  errorHandler.asyncHandler(authController.changePassword)
);

// Get user profile
router.get('/profile',
  authMiddleware.requireAuth,
  errorHandler.asyncHandler(authController.getProfile)
);

// Update user profile
router.put('/profile',
  authMiddleware.requireAuth,
  validation.sanitizeInput,
  validation.validateRequest({
    body: {
      name: { type: 'string', required: false, minLength: 2, maxLength: 50 },
      phone: { type: 'phone', required: false }
    }
  }),
  errorHandler.asyncHandler(authController.updateProfile)
);

module.exports = router;