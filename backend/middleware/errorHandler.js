const CONSTANTS = require('../utils/constants');

class ErrorHandler {
  // Main error handling middleware
  handle(error, req, res, next) {
    let statusCode = CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR;
    let message = CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR;
    let details = {};

    // Log error for debugging
    console.error('Error occurred:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      body: req.body,
      user: req.user?.userId || 'unauthenticated',
      timestamp: new Date().toISOString()
    });

    // Handle different types of errors
    if (error.name === 'ValidationError') {
      statusCode = CONSTANTS.HTTP_STATUS.BAD_REQUEST;
      message = 'Validation error';
      details = this.handleValidationError(error);
    } else if (error.name === 'CastError') {
      statusCode = CONSTANTS.HTTP_STATUS.BAD_REQUEST;
      message = 'Invalid data format';
      details = this.handleCastError(error);
    } else if (error.code === 11000) {
      statusCode = CONSTANTS.HTTP_STATUS.CONFLICT;
      message = 'Duplicate entry';
      details = this.handleDuplicateError(error);
    } else if (error.name === 'JsonWebTokenError') {
      statusCode = CONSTANTS.HTTP_STATUS.UNAUTHORIZED;
      message = CONSTANTS.RESPONSE_MESSAGES.AUTH.TOKEN_INVALID;
    } else if (error.name === 'TokenExpiredError') {
      statusCode = CONSTANTS.HTTP_STATUS.UNAUTHORIZED;
      message = CONSTANTS.RESPONSE_MESSAGES.AUTH.TOKEN_EXPIRED;
    } else if (error.name === 'MongoError') {
      statusCode = CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR;
      message = 'Database error';
      details = this.handleMongoError(error);
    } else if (error.name === 'MulterError') {
      statusCode = CONSTANTS.HTTP_STATUS.BAD_REQUEST;
      message = 'File upload error';
      details = this.handleMulterError(error);
    } else if (error.statusCode) {
      statusCode = error.statusCode;
      message = error.message;
    }

    // Don't expose internal error details in production
    const response = {
      success: false,
      message,
      ...(process.env.NODE_ENV === 'development' && {
        error: error.message,
        stack: error.stack
      }),
      ...(Object.keys(details).length > 0 && { details })
    };

    res.status(statusCode).json(response);
  }

  handleValidationError(error) {
    const errors = {};
    
    Object.keys(error.errors).forEach(key => {
      errors[key] = error.errors[key].message;
    });

    return { validationErrors: errors };
  }

  handleCastError(error) {
    return {
      field: error.path,
      value: error.value,
      expectedType: error.kind
    };
  }

  handleDuplicateError(error) {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];
    
    return {
      field,
      value,
      message: `${field} '${value}' already exists`
    };
  }

  handleMongoError(error) {
    return {
      code: error.code,
      message: 'Database operation failed'
    };
  }

  handleMulterError(error) {
    const details = { code: error.code };

    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        details.message = 'File size exceeds limit';
        break;
      case 'LIMIT_FILE_COUNT':
        details.message = 'Too many files uploaded';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        details.message = 'Unexpected file field';
        break;
      default:
        details.message = 'File upload error';
    }

    return details;
  }

  // Handle async errors
  asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  // Custom error class
  createError(statusCode, message, details = {}) {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.details = details;
    return error;
  }

  // 404 handler
  notFound(req, res, next) {
    const error = this.createError(
      CONSTANTS.HTTP_STATUS.NOT_FOUND,
      `Route ${req.originalUrl} not found`
    );
    next(error);
  }

  // Rate limit handler
  rateLimitHandler(req, res) {
    res.status(CONSTANTS.HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      message: 'Too many requests, please try again later',
      retryAfter: req.rateLimit?.resetTime || '15 minutes'
    });
  }

  // Validation error creator
  validationError(message, errors = []) {
    const error = this.createError(
      CONSTANTS.HTTP_STATUS.BAD_REQUEST,
      message,
      { validationErrors: errors }
    );
    return error;
  }

  // Unauthorized error creator
  unauthorizedError(message = 'Unauthorized access') {
    return this.createError(CONSTANTS.HTTP_STATUS.UNAUTHORIZED, message);
  }

  // Forbidden error creator
  forbiddenError(message = 'Access forbidden') {
    return this.createError(CONSTANTS.HTTP_STATUS.FORBIDDEN, message);
  }

  // Not found error creator
  notFoundError(message = 'Resource not found') {
    return this.createError(CONSTANTS.HTTP_STATUS.NOT_FOUND, message);
  }

  // Conflict error creator
  conflictError(message = 'Resource conflict') {
    return this.createError(CONSTANTS.HTTP_STATUS.CONFLICT, message);
  }

  // Business logic error creator
  businessError(message, details = {}) {
    return this.createError(CONSTANTS.HTTP_STATUS.UNPROCESSABLE_ENTITY, message, details);
  }

  // Handle process errors
  handleProcessErrors() {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

    // Handle SIGTERM
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      process.exit(0);
    });

    // Handle SIGINT
    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully');
      process.exit(0);
    });
  }

  // Log error to external service (implement as needed)
  logError(error, req) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      url: req?.url,
      method: req?.method,
      userAgent: req?.get('User-Agent'),
      ip: req?.ip,
      user: req?.user?.userId,
      body: req?.body,
      params: req?.params,
      query: req?.query
    };

    // In production, send to logging service like Winston, Sentry, etc.
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorLog });
      console.error('Production Error:', errorLog);
    } else {
      console.error('Development Error:', errorLog);
    }
  }

  // Health check error handler
  healthCheckError(service, error) {
    return {
      service,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }

  // Database connection error handler
  dbConnectionError(error) {
    console.error('Database connection error:', error);
    
    return {
      success: false,
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    };
  }

  // External service error handler
  externalServiceError(serviceName, error) {
    console.error(`${serviceName} service error:`, error);
    
    return {
      success: false,
      message: `${serviceName} service temporarily unavailable`,
      service: serviceName,
      timestamp: new Date().toISOString()
    };
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

// Initialize process error handlers
errorHandler.handleProcessErrors();

module.exports = errorHandler;