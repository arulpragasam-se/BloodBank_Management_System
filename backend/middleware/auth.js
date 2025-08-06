const jwtConfig = require('../config/jwt');
const User = require('../models/User');
const CONSTANTS = require('../utils/constants');

class AuthMiddleware {
  async authenticate(req, res, next) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Authorization header is required'
        });
      }

      const token = authHeader.split(' ')[1];

      if (!token) {
        return res.status(CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Token is required'
        });
      }

      const verification = jwtConfig.verifyAccessToken(token);

      if (!verification.valid) {
        if (verification.expired) {
          return res.status(CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: CONSTANTS.RESPONSE_MESSAGES.AUTH.TOKEN_EXPIRED,
            code: 'TOKEN_EXPIRED'
          });
        }

        return res.status(CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: CONSTANTS.RESPONSE_MESSAGES.AUTH.TOKEN_INVALID
        });
      }

      const user = await User.findById(verification.decoded.userId).select('-password');

      if (!user) {
        return res.status(CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!user.isActive) {
        return res.status(CONSTANTS.HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      req.user = verification.decoded;
      req.userDoc = user;
      next();

    } catch (error) {
      return res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Authentication error',
        error: error.message
      });
    }
  }

  optional(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    try {
      const verification = jwtConfig.verifyAccessToken(token);

      if (verification.valid) {
        req.user = verification.decoded;
      }
    } catch (error) {
      // Silent fail for optional authentication
    }

    next();
  }

  // Bind the context properly for requireAuth
  requireAuth = async (req, res, next) => {
    return await this.authenticate(req, res, next);
  }

  checkTokenExpiry(req, res, next) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return next();
      }

      const token = authHeader.split(' ')[1];

      if (!token) {
        return next();
      }

      const isExpired = jwtConfig.isTokenExpired(token);

      if (isExpired) {
        return res.status(CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: CONSTANTS.RESPONSE_MESSAGES.AUTH.TOKEN_EXPIRED,
          code: 'TOKEN_EXPIRED'
        });
      }

      next();

    } catch (error) {
      return res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Token validation error',
        error: error.message
      });
    }
  }

  validateRefreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Refresh token is required'
        });
      }

      const verification = jwtConfig.verifyRefreshToken(refreshToken);

      if (!verification.valid) {
        return res.status(CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: verification.error
        });
      }

      req.refreshTokenData = verification.decoded;
      next();

    } catch (error) {
      return res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Refresh token validation error',
        error: error.message
      });
    }
  }

  


}

module.exports = new AuthMiddleware();