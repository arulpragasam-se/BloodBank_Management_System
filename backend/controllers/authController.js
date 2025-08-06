const User = require('../models/User');
const Donor = require('../models/Donor');
const Recipient = require('../models/Recipient');
const jwtConfig = require('../config/jwt');
const emailService = require('../utils/emailService');
const Validators = require('../utils/validators');
const Helpers = require('../utils/helpers');
const CONSTANTS = require('../utils/constants');

class AuthController {
  async register(req, res) {
    try {
      const { name, email, password, phone, role, additionalData } = req.body;

      const validation = Validators.validateMultiple([
        Validators.validateString(name, 'Name', 2, 50),
        Validators.validateEmail(email),
        Validators.validatePassword(password),
        Validators.validatePhone(phone),
        Validators.validateRole(role)
      ]);

      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      const existingUser = await User.findOne({ 
        $or: [{ email }, { phone: Helpers.formatPhone(phone) }] 
      });

      if (existingUser) {
        return res.status(CONSTANTS.HTTP_STATUS.CONFLICT).json({
          success: false,
          message: 'User with this email or phone already exists'
        });
      }

      const userData = {
        name: Helpers.sanitizeInput(name),
        email: email.toLowerCase(),
        password,
        phone: Helpers.formatPhone(phone),
        role
      };

      const user = new User(userData);
      await user.save();

      if (role === CONSTANTS.USER_ROLES.DONOR && additionalData) {
        const donorValidation = Validators.validateMultiple([
          Validators.validateBloodType(additionalData.bloodType),
          Validators.validateDateOfBirth(additionalData.dateOfBirth),
          Validators.validateWeight(additionalData.weight),
          Validators.validateHeight(additionalData.height)
        ]);

        if (!donorValidation.isValid) {
          await User.findByIdAndDelete(user._id);
          return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Donor validation failed',
            errors: donorValidation.errors
          });
        }

        const donor = new Donor({
          userId: user._id,
          ...additionalData,
          address: additionalData.address || {},
          emergencyContact: additionalData.emergencyContact || {},
          medicalHistory: additionalData.medicalHistory || {}
        });

        await donor.save();
      }

      if (role === CONSTANTS.USER_ROLES.RECIPIENT && additionalData) {
        const recipientValidation = Validators.validateMultiple([
          Validators.validateBloodType(additionalData.bloodType),
          Validators.validateDateOfBirth(additionalData.dateOfBirth),
          Validators.validateString(additionalData.medicalCondition, 'Medical condition', 5, 200)
        ]);

        if (!recipientValidation.isValid) {
          await User.findByIdAndDelete(user._id);
          return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Recipient validation failed',
            errors: recipientValidation.errors
          });
        }

        const recipient = new Recipient({
          userId: user._id,
          ...additionalData,
          emergencyContact: additionalData.emergencyContact || {}
        });

        await recipient.save();
      }

      const tokenPayload = {
        userId: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      };

      const tokens = jwtConfig.generateTokenPair(tokenPayload);

      await emailService.sendWelcomeEmail(user.email, user.name, user.role);

      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      };

      res.status(CONSTANTS.HTTP_STATUS.CREATED).json({
        success: true,
        message: CONSTANTS.RESPONSE_MESSAGES.SUCCESS.CREATED,
        data: {
          user: userResponse,
          tokens
        }
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const validation = Validators.validateMultiple([
        Validators.validateEmail(email),
        Validators.validateString(password, 'Password')
      ]);

      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user || !await user.comparePassword(password)) {
        return res.status(CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: CONSTANTS.RESPONSE_MESSAGES.AUTH.INVALID_CREDENTIALS
        });
      }

      if (!user.isActive) {
        return res.status(CONSTANTS.HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Account is deactivated. Please contact administrator.'
        });
      }

      const tokenPayload = {
        userId: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      };

      const tokens = jwtConfig.generateTokenPair(tokenPayload);

      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive
      };

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: CONSTANTS.RESPONSE_MESSAGES.AUTH.LOGIN_SUCCESS,
        data: {
          user: userResponse,
          tokens
        }
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async refreshToken(req, res) {
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

      const user = await User.findById(verification.decoded.userId);

      if (!user || !user.isActive) {
        return res.status(CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid user or account deactivated'
        });
      }

      const tokenPayload = {
        userId: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      };

      const newAccessToken = jwtConfig.generateAccessToken(tokenPayload);

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: newAccessToken,
          expiresIn: jwtConfig.accessTokenExpiry
        }
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async logout(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (token) {
        jwtConfig.blacklistToken(token);
      }

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: CONSTANTS.RESPONSE_MESSAGES.AUTH.LOGOUT_SUCCESS
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const validation = Validators.validateEmail(email);
      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validation.message
        });
      }

      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return res.status(CONSTANTS.HTTP_STATUS.OK).json({
          success: true,
          message: 'If email exists, password reset instructions have been sent'
        });
      }

      const resetToken = jwtConfig.generateResetToken(user.email);

      // In production, send email with reset link
      // await emailService.sendPasswordResetEmail(user.email, user.name, resetToken);

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: 'Password reset instructions sent to your email',
        resetToken // Remove this in production
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      const validation = Validators.validatePassword(newPassword);
      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validation.message
        });
      }

      const verification = jwtConfig.verifyResetToken(token);

      if (!verification.valid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }

      const user = await User.findOne({ email: verification.email });

      if (!user) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'User not found'
        });
      }

      user.password = newPassword;
      await user.save();

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: 'Password reset successfully'
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.userId;

      const validation = Validators.validateMultiple([
        Validators.validateString(currentPassword, 'Current password'),
        Validators.validatePassword(newPassword)
      ]);

      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: CONSTANTS.RESPONSE_MESSAGES.ERROR.NOT_FOUND
        });
      }

      const isCurrentPasswordValid = await user.comparePassword(currentPassword);

      if (!isCurrentPasswordValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      user.password = newPassword;
      await user.save();

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async getProfile(req, res) {
    try {
      const userId = req.user.userId;

      const user = await User.findById(userId).select('-password');

      if (!user) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: CONSTANTS.RESPONSE_MESSAGES.ERROR.NOT_FOUND
        });
      }

      let additionalData = null;

      if (user.role === CONSTANTS.USER_ROLES.DONOR) {
        additionalData = await Donor.findOne({ userId }).populate('userId', 'name email phone');
      } else if (user.role === CONSTANTS.USER_ROLES.RECIPIENT) {
        additionalData = await Recipient.findOne({ userId }).populate('userId', 'name email phone');
      }

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: CONSTANTS.RESPONSE_MESSAGES.SUCCESS.RETRIEVED,
        data: {
          user,
          profile: additionalData
        }
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const userId = req.user.userId;
      const { name, phone, profileImage, additionalData } = req.body;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: CONSTANTS.RESPONSE_MESSAGES.ERROR.NOT_FOUND
        });
      }

      if (name) {
        const nameValidation = Validators.validateString(name, 'Name', 2, 50);
        if (!nameValidation.isValid) {
          return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: nameValidation.message
          });
        }
        user.name = Helpers.sanitizeInput(name);
      }

      if (phone) {
        const phoneValidation = Validators.validatePhone(phone);
        if (!phoneValidation.isValid) {
          return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: phoneValidation.message
          });
        }
        user.phone = Helpers.formatPhone(phone);
      }

      if (profileImage) {
        user.profileImage = profileImage;
      }

      await user.save();

      if (additionalData && user.role === CONSTANTS.USER_ROLES.DONOR) {
        await Donor.findOneAndUpdate({ userId }, additionalData, { new: true });
      }

      if (additionalData && user.role === CONSTANTS.USER_ROLES.RECIPIENT) {
        await Recipient.findOneAndUpdate({ userId }, additionalData, { new: true });
      }

      const updatedUser = await User.findById(userId).select('-password');

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: CONSTANTS.RESPONSE_MESSAGES.SUCCESS.UPDATED,
        data: { user: updatedUser }
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }
}

module.exports = new AuthController();