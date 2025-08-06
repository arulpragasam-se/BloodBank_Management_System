const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit'); // Add this import
const CONSTANTS = require('../utils/constants');

class RateLimitMiddleware {
  // General API rate limiting
  general() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: process.env.NODE_ENV === 'development' ? 1000 : 100,
      message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => {
        // Skip rate limiting for health checks
        return req.path === '/health';
      }
    });
  }

  // Authentication endpoints rate limiting
  auth() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 attempts per window
      message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: true
    });
  }

  // Password reset rate limiting
  passwordReset() {
    return rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3, // 3 attempts per hour
      message: {
        success: false,
        message: 'Too many password reset attempts, please try again later.',
        retryAfter: '1 hour'
      },
      standardHeaders: true,
      legacyHeaders: false
    });
  }

  // SMS sending rate limiting
  sms() {
    return rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // 10 SMS per hour
      message: {
        success: false,
        message: 'SMS rate limit exceeded, please try again later.',
        retryAfter: '1 hour'
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => {
        // Rate limit per user if authenticated, otherwise per IP with IPv6 support
        return req.user?.userId || ipKeyGenerator(req);
      }
    });
  }

  // Email sending rate limiting
  email() {
    return rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 20, // 20 emails per hour
      message: {
        success: false,
        message: 'Email rate limit exceeded, please try again later.',
        retryAfter: '1 hour'
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => {
        return req.user?.userId || ipKeyGenerator(req);
      }
    });
  }

  // File upload rate limiting
  upload() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // 10 uploads per window
      message: {
        success: false,
        message: 'File upload rate limit exceeded, please try again later.',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false
    });
  }

  // Search endpoints rate limiting
  search() {
    return rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 30, // 30 searches per minute
      message: {
        success: false,
        message: 'Search rate limit exceeded, please try again later.',
        retryAfter: '1 minute'
      },
      standardHeaders: true,
      legacyHeaders: false
    });
  }

  // Report generation rate limiting
  reports() {
    return rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 5, // 5 reports per hour
      message: {
        success: false,
        message: 'Report generation rate limit exceeded, please try again later.',
        retryAfter: '1 hour'
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => {
        return req.user?.userId || ipKeyGenerator(req);
      }
    });
  }

  // Bulk operations rate limiting
  bulk() {
    return rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3, // 3 bulk operations per hour
      message: {
        success: false,
        message: 'Bulk operation rate limit exceeded, please try again later.',
        retryAfter: '1 hour'
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => {
        return req.user?.userId || ipKeyGenerator(req);
      }
    });
  }

  // Admin operations rate limiting
  admin() {
    return rateLimit({
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 50, // 50 admin operations per 5 minutes
      message: {
        success: false,
        message: 'Admin operation rate limit exceeded, please try again later.',
        retryAfter: '5 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => {
        return req.user?.userId || ipKeyGenerator(req);
      },
      skip: (req) => {
        // Only apply to admin users
        return req.user?.role !== CONSTANTS.USER_ROLES.ADMIN;
      }
    });
  }

  // Campaign registration rate limiting
  campaignRegistration() {
    return rateLimit({
      windowMs: 24 * 60 * 60 * 1000, // 24 hours
      max: 5, // 5 campaign registrations per day
      message: {
        success: false,
        message: 'Campaign registration rate limit exceeded, please try again tomorrow.',
        retryAfter: '24 hours'
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => {
        return req.user?.userId || ipKeyGenerator(req);
      }
    });
  }

  // Blood request rate limiting
  bloodRequest() {
    return rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // 10 blood requests per hour
      message: {
        success: false,
        message: 'Blood request rate limit exceeded, please try again later.',
        retryAfter: '1 hour'
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => {
        return req.user?.userId || ipKeyGenerator(req);
      }
    });
  }

  // Custom rate limiter with dynamic configuration
  custom(options = {}) {
    const {
      windowMs = 15 * 60 * 1000,
      max = 100,
      message = 'Rate limit exceeded',
      keyGenerator,
      skip,
      onLimitReached
    } = options;

    return rateLimit({
      windowMs,
      max,
      message: {
        success: false,
        message,
        retryAfter: `${windowMs / (60 * 1000)} minutes`
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: keyGenerator || ((req) => ipKeyGenerator(req)),
      skip: skip || (() => false),
      onLimitReached: (req, res, options) => {
        console.warn(`Rate limit exceeded for ${req.ip} on ${req.path}`);
        if (onLimitReached) {
          onLimitReached(req, res, options);
        }
      }
    });
  }

  // Create rate limiter based on user role
  byRole(limits = {}) {
    return (req, res, next) => {
      const userRole = req.user?.role;
      const defaultLimit = limits.default || { windowMs: 15 * 60 * 1000, max: 100 };
      const roleLimit = limits[userRole] || defaultLimit;

      const limiter = rateLimit({
        windowMs: roleLimit.windowMs,
        max: roleLimit.max,
        message: {
          success: false,
          message: `Rate limit exceeded for ${userRole || 'unauthenticated'} users`,
          retryAfter: `${roleLimit.windowMs / (60 * 1000)} minutes`
        },
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => {
          return req.user?.userId || ipKeyGenerator(req);
        }
      });

      return limiter(req, res, next);
    };
  }

  // Emergency rate limiting (very strict)
  emergency() {
    return rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // Very low limit
      message: {
        success: false,
        message: 'System is under maintenance. Please try again later.',
        retryAfter: '1 hour'
      },
      standardHeaders: true,
      legacyHeaders: false
    });
  }

  // Conditional rate limiting
  conditional(condition, limiter) {
    return (req, res, next) => {
      if (condition(req)) {
        return limiter(req, res, next);
      }
      next();
    };
  }

  // IP whitelist bypass
  whitelist(ips = []) {
    return (req, res, next) => {
      const clientIP = req.ip || req.connection.remoteAddress;
      
      if (ips.includes(clientIP)) {
        return next();
      }
      
      // Apply default rate limiting for non-whitelisted IPs
      return this.general()(req, res, next);
    };
  }
}

module.exports = new RateLimitMiddleware();