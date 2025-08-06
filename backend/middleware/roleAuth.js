const CONSTANTS = require('../utils/constants');

class RoleAuthMiddleware {
  requireRole(roles) {
    return (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: CONSTANTS.RESPONSE_MESSAGES.ERROR.UNAUTHORIZED
          });
        }

        const userRole = req.user.role;
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(userRole)) {
          return res.status(CONSTANTS.HTTP_STATUS.FORBIDDEN).json({
            success: false,
            message: CONSTANTS.RESPONSE_MESSAGES.ERROR.FORBIDDEN,
            requiredRoles: allowedRoles,
            userRole
          });
        }

        next();

      } catch (error) {
        return res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: 'Role authorization error',
          error: error.message
        });
      }
    };
  }

  requireAdmin = (req, res, next) => {
    return this.requireRole(CONSTANTS.USER_ROLES.ADMIN)(req, res, next);
  }

  requireHospitalStaff = (req, res, next) => {
    return this.requireRole([
      CONSTANTS.USER_ROLES.ADMIN,
      CONSTANTS.USER_ROLES.HOSPITAL_STAFF
    ])(req, res, next);
  }

  requireDonor = (req, res, next) => {
    return this.requireRole(CONSTANTS.USER_ROLES.DONOR)(req, res, next);
  }

  requireRecipient = (req, res, next) => {
    return this.requireRole(CONSTANTS.USER_ROLES.RECIPIENT)(req, res, next);
  }

  allowAdminOrOwner = (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: CONSTANTS.RESPONSE_MESSAGES.ERROR.UNAUTHORIZED
        });
      }

      const userRole = req.user.role;
      const userId = req.user.userId;

      if (userRole === CONSTANTS.USER_ROLES.ADMIN) {
        return next();
      }

      const resourceUserId = req.params.userId || req.params.id || req.body.userId;

      if (resourceUserId && resourceUserId === userId) {
        return next();
      }

      if (userRole === CONSTANTS.USER_ROLES.DONOR && req.route.path.includes('/donors/')) {
        return next();
      }

      if (userRole === CONSTANTS.USER_ROLES.RECIPIENT && req.route.path.includes('/recipients/')) {
        return next();
      }

      return res.status(CONSTANTS.HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Access denied. Admin privileges or resource ownership required.'
      });

    } catch (error) {
      return res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Authorization error',
        error: error.message
      });
    }
  }

  checkResourceOwnership(resourceType) {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: CONSTANTS.RESPONSE_MESSAGES.ERROR.UNAUTHORIZED
          });
        }

        if (req.user.role === CONSTANTS.USER_ROLES.ADMIN) {
          return next();
        }

        const userId = req.user.userId;
        const resourceId = req.params.id;

        let Model;
        let ownershipField = 'userId';

        switch (resourceType) {
          case 'donor':
            Model = require('../models/Donor');
            break;
          case 'recipient':
            Model = require('../models/Recipient');
            break;
          case 'campaign':
            Model = require('../models/Campaign');
            ownershipField = 'organizer';
            break;
          case 'hospital':
            Model = require('../models/Hospital');
            ownershipField = 'staffMembers.userId';
            break;
          default:
            return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
              success: false,
              message: 'Invalid resource type'
            });
        }

        const resource = await Model.findById(resourceId);

        if (!resource) {
          return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
            success: false,
            message: 'Resource not found'
          });
        }

        let isOwner = false;

        if (ownershipField === 'staffMembers.userId') {
          isOwner = resource.staffMembers.some(staff => 
            staff.userId.toString() === userId
          );
        } else {
          const ownerId = ownershipField.includes('.') 
            ? resource[ownershipField.split('.')[0]][ownershipField.split('.')[1]]
            : resource[ownershipField];
          
          isOwner = ownerId && ownerId.toString() === userId;
        }

        if (!isOwner) {
          return res.status(CONSTANTS.HTTP_STATUS.FORBIDDEN).json({
            success: false,
            message: 'Access denied. Resource ownership required.'
          });
        }

        req.resource = resource;
        next();

      } catch (error) {
        return res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: 'Resource ownership check error',
          error: error.message
        });
      }
    };
  }

  allowRolesOrOwner = (roles, resourceType) => {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: CONSTANTS.RESPONSE_MESSAGES.ERROR.UNAUTHORIZED
          });
        }

        const userRole = req.user.role;
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (allowedRoles.includes(userRole)) {
          return next();
        }

        return this.checkResourceOwnership(resourceType)(req, res, next);

      } catch (error) {
        return res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: 'Role and ownership authorization error',
          error: error.message
        });
      }
    };
  }

  requireActiveAccount = (req, res, next) => {
    try {
      if (!req.userDoc) {
        return res.status(CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'User information not available'
        });
      }

      if (!req.userDoc.isActive) {
        return res.status(CONSTANTS.HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Account is deactivated. Please contact administrator.'
        });
      }

      next();

    } catch (error) {
      return res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Account status check error',
        error: error.message
      });
    }
  }

  checkPermission(permission) {
    return (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: CONSTANTS.RESPONSE_MESSAGES.ERROR.UNAUTHORIZED
          });
        }

        const userRole = req.user.role;

        const permissions = {
          [CONSTANTS.USER_ROLES.ADMIN]: [
            'create_user', 'update_user', 'delete_user', 'view_all_users',
            'manage_inventory', 'manage_campaigns', 'manage_hospitals',
            'view_reports', 'send_notifications', 'manage_system'
          ],
          [CONSTANTS.USER_ROLES.HOSPITAL_STAFF]: [
            'manage_inventory', 'view_donors', 'create_requests',
            'view_campaigns', 'manage_recipients', 'view_reports'
          ],
          [CONSTANTS.USER_ROLES.DONOR]: [
            'view_profile', 'update_profile', 'view_campaigns',
            'register_campaign', 'view_donation_history'
          ],
          [CONSTANTS.USER_ROLES.RECIPIENT]: [
            'view_profile', 'update_profile', 'view_requests',
            'view_transfusion_history'
          ]
        };

        const userPermissions = permissions[userRole] || [];

        if (!userPermissions.includes(permission)) {
          return res.status(CONSTANTS.HTTP_STATUS.FORBIDDEN).json({
            success: false,
            message: `Permission '${permission}' required`,
            userRole,
            requiredPermission: permission
          });
        }

        next();

      } catch (error) {
        return res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: 'Permission check error',
          error: error.message
        });
      }
    };
  }
}

module.exports = new RoleAuthMiddleware();