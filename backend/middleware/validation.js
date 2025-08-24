const Validators = require('../utils/validators');
const Helpers = require('../utils/helpers');
const CONSTANTS = require('../utils/constants');

class ValidationMiddleware {
  validateRequest(schema) {
    return (req, res, next) => {
      try {
        const errors = [];

        // Validate body fields
        if (schema.body) {
          Object.keys(schema.body).forEach(field => {
            const rules = schema.body[field];
            const value = req.body[field];

            if (rules.required && (value === undefined || value === null || value === '')) {
              errors.push(`${field} is required`);
              return;
            }

            if (value !== undefined && value !== null && value !== '') {
              const validation = this.applyValidationRules(field, value, rules);
              if (!validation.isValid) {
                errors.push(validation.message);
              }
            }
          });
        }

        // Validate query parameters
        if (schema.query) {
          Object.keys(schema.query).forEach(field => {
            const rules = schema.query[field];
            const value = req.query[field];

            if (rules.required && !value) {
              errors.push(`Query parameter '${field}' is required`);
              return;
            }

            if (value) {
              const validation = this.applyValidationRules(field, value, rules);
              if (!validation.isValid) {
                errors.push(validation.message);
              }
            }
          });
        }

        // Validate URL parameters
        if (schema.params) {
          Object.keys(schema.params).forEach(field => {
            const rules = schema.params[field];
            const value = req.params[field];

            if (rules.required && !value) {
              errors.push(`URL parameter '${field}' is required`);
              return;
            }

            if (value) {
              const validation = this.applyValidationRules(field, value, rules);
              if (!validation.isValid) {
                errors.push(validation.message);
              }
            }
          });
        }

        if (errors.length > 0) {
          return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Validation failed',
            errors
          });
        }

        next();

      } catch (error) {
        return res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: 'Validation error',
          error: error.message
        });
      }
    };
  }

  applyValidationRules(fieldName, value, rules) {
    if (rules.type === 'email') {
      return Validators.validateEmail(value);
    }

    if (rules.type === 'password') {
      return Validators.validatePassword(value);
    }

    if (rules.type === 'phone') {
      return Validators.validatePhone(value);
    }

    if (rules.type === 'bloodType') {
      return Validators.validateBloodType(value);
    }

    if (rules.type === 'date') {
      return Validators.validateDateOfBirth(value);
    }

    if (rules.type === 'futureDate') {
      return Validators.validateFutureDate(value, fieldName);
    }

    if (rules.type === 'objectId') {
      return Validators.validateObjectId(value, fieldName);
    }

    if (rules.type === 'string') {
      return Validators.validateString(
        value,
        fieldName,
        rules.minLength || 1,
        rules.maxLength || 255
      );
    }

    if (rules.type === 'number') {
      return Validators.validateNumber(
        parseFloat(value),
        fieldName,
        rules.min || 0,
        rules.max || Number.MAX_VALUE
      );
    }

    if (rules.type === 'enum' && Array.isArray(value)) {
    const invalidValues = value.filter(v => !rules.values.includes(v));
    if (invalidValues.length > 0) {
      return {
        isValid: false,
        message: `${fieldName} contains invalid values: ${invalidValues.join(', ')}. Must be one of: ${rules.values.join(', ')}`
      };
    }
    return { isValid: true };
  }

    if (rules.type === 'enum') {
      if (!rules.values.includes(value)) {
        return {
          isValid: false,
          message: `${fieldName} must be one of: ${rules.values.join(', ')}`
        };
      }
      return { isValid: true };
    }

    if (rules.type === 'array') {
      if (!Array.isArray(value)) {
        return {
          isValid: false,
          message: `${fieldName} must be an array`
        };
      }

      if (rules.minItems && value.length < rules.minItems) {
        return {
          isValid: false,
          message: `${fieldName} must have at least ${rules.minItems} items`
        };
      }

      if (rules.maxItems && value.length > rules.maxItems) {
        return {
          isValid: false,
          message: `${fieldName} must have at most ${rules.maxItems} items`
        };
      }

      return { isValid: true };
    }

    return { isValid: true };
  }

  sanitizeInput(req, res, next) {
    try {
      // Sanitize request body


      next();

    } catch (error) {
      return res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Input sanitization error',
        error: error.message
      });
    }
  }

  sanitizeObject(obj) {
    const sanitized = {};

    Object.keys(obj).forEach(key => {
      const value = obj[key];

      if (typeof value === 'string') {
        sanitized[key] = Helpers.sanitizeInput(value);
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeObject(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'string' ? Helpers.sanitizeInput(item) :
          typeof item === 'object' && item !== null ? this.sanitizeObject(item) : item
        );
      } else {
        sanitized[key] = value;
      }
    });

    return sanitized;
  }

validatePagination(req, res, next) {
  try {
    const { page, limit } = req.query;
    
    // Set defaults if not provided or undefined
    const pageNum = page && page !== 'undefined' ? parseInt(page) : 1;
    const limitNum = limit && limit !== 'undefined' ? parseInt(limit) : 10;
    
    // Validate page
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Page must be a positive integer'
      });
    }
    
    // Validate limit
    if (isNaN(limitNum) || limitNum < 1 || limitNum > CONSTANTS.PAGINATION.MAX_LIMIT) {
      return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: `Limit must be between 1 and ${CONSTANTS.PAGINATION.MAX_LIMIT}`
      });
    }

    req.pagination = {
      page: pageNum,
      limit: limitNum,
      skip: (pageNum - 1) * limitNum
    };
    
    next();
  } catch (error) {
    return res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Pagination validation error',
      error: error.message
    });
  }
}

  validateDateRange(req, res, next) {
    try {
      const { startDate, endDate, from, to } = req.query;

      const start = startDate || from;
      const end = endDate || to;

      if (start && end) {
        const validation = Validators.validateDateRange(start, end);
        if (!validation.isValid) {
          return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: validation.message
          });
        }
      }

      next();

    } catch (error) {
      return res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Date range validation error',
        error: error.message
      });
    }
  }

  validateFileUpload(options = {}) {
    return (req, res, next) => {
      try {
        if (!req.file && !req.files) {
          if (options.required) {
            return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
              success: false,
              message: 'File upload is required'
            });
          }
          return next();
        }

        const files = req.files || [req.file];
        const maxSize = options.maxSize || CONSTANTS.FILE_UPLOAD.MAX_SIZE;
        const allowedTypes = options.allowedTypes || CONSTANTS.FILE_UPLOAD.ALLOWED_TYPES;

        for (const file of files) {
          if (file.size > maxSize) {
            return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
              success: false,
              message: `File size exceeds limit of ${maxSize / (1024 * 1024)}MB`
            });
          }

          if (!allowedTypes.includes(file.mimetype)) {
            return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
              success: false,
              message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
            });
          }
        }

        next();

      } catch (error) {
        return res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: 'File validation error',
          error: error.message
        });
      }
    };
  }

  validateBloodRequest(req, res, next) {
    try {
      const { bloodType, unitsRequired, urgencyLevel, requiredBy } = req.body;

      const validations = [
        Validators.validateBloodType(bloodType),
        Validators.validateUrgencyLevel(urgencyLevel)
      ];

      const validation = Validators.validateMultiple(validations);

      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Blood request validation failed',
          errors: validation.errors
        });
      }

      next();

    } catch (error) {
      return res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Blood request validation error',
        error: error.message
      });
    }
  }

  validateVitalSigns(req, res, next) {
    try {
      const { preScreening } = req.body;

      if (!preScreening) {
        return next();
      }

      const validation = Validators.validateVitalSigns(preScreening);

      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validation.message
        });
      }

      next();

    } catch (error) {
      return res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Vital signs validation error',
        error: error.message
      });
    }
  }

  validateBusinessRules(operation) {
    return (req, res, next) => {
      try {
        const validation = Helpers.validateBusinessRules(operation, req.body);

        if (!validation.isValid) {
          return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Business rule validation failed',
            errors: validation.violations
          });
        }

        next();

      } catch (error) {
        return res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: 'Business rule validation error',
          error: error.message
        });
      }
    };
  }

  // Predefined validation schemas
  schemas = {
    userRegistration: {
      body: {
        name: { type: 'string', required: true, minLength: 2, maxLength: 50 },
        email: { type: 'email', required: true },
        password: { type: 'password', required: true },
        phone: { type: 'phone', required: true },
        role: { type: 'enum', required: true, values: Object.values(CONSTANTS.USER_ROLES) }
      }
    },

    userLogin: {
      body: {
        email: { type: 'email', required: true },
        password: { type: 'string', required: true }
      }
    },

    donorRegistration: {
      body: {
        bloodType: { type: 'bloodType', required: true },
        dateOfBirth: { type: 'date', required: true },
        weight: { type: 'number', required: true, min: 30, max: 300 },
        height: { type: 'number', required: true, min: 100, max: 250 }
      }
    },

    campaignCreation: {
      body: {
        title: { type: 'string', required: true, minLength: 5, maxLength: 100 },
        description: { type: 'string', required: true, minLength: 10, maxLength: 500 },
        startDate: { type: 'futureDate', required: true },
        endDate: { type: 'futureDate', required: true }
      }
    },

    inventoryAddition: {
      body: {
        bloodType: { type: 'bloodType', required: true },
        units: { type: 'number', required: true, min: 1, max: 10 },
        donorId: { type: 'objectId', required: true }
      }
    },

    objectIdParam: {
      params: {
        id: { type: 'objectId', required: true }
      }
    }
  };
}

module.exports = new ValidationMiddleware();