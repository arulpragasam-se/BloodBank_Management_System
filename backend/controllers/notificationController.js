const Notification = require('../models/Notification');
const User = require('../models/User');
const Validators = require('../utils/validators');
const Helpers = require('../utils/helpers');
const smsService = require('../utils/smsService');
const emailService = require('../utils/emailService');
const CONSTANTS = require('../utils/constants');

class NotificationController {

  async getUserNotifications(req, res) {
    try {
      const { page = 1, limit = 10, type, read, priority } = req.query;
      const userId = req.user.userId;
      const { page: pageNum, limit: limitNum, skip } = Helpers.paginate(page, limit);

      let query = { recipient: userId };
      
      if (type) query.type = type;
      console.log('Read status:', read);
      if (read !== undefined) query['channels.inApp.read'] = read === 'true';
      if (priority) query.priority = priority;

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      const total = await Notification.countDocuments(query);
      const unreadCount = await Notification.countDocuments({
        recipient: userId,
        'channels.inApp.read': false,
        isActive: true
      });

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: CONSTANTS.RESPONSE_MESSAGES.SUCCESS.RETRIEVED,
        data: {
          notifications,
          unreadCount,
          pagination: {
            current: pageNum,
            pages: Math.ceil(total / limitNum),
            total,
            limit: limitNum
          }
        }
      });

    } catch (error) {
      console.error('Error fetching user notifications:', error);
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async getAllNotifications(req, res) {
  try {
    const { page = 1, limit = 10, type, read, priority, recipient } = req.query;
    const { page: pageNum, limit: limitNum, skip } = Helpers.paginate(page, limit);

    let query = {};
    
    if (type) query.type = type;
    if (read !== undefined) query['channels.inApp.read'] = read === 'true';
    if (priority) query.priority = priority;
    if (recipient) query.recipient = recipient;

    const notifications = await Notification.find(query)
      .populate('recipient', 'name email phone role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Notification.countDocuments(query);

    res.status(CONSTANTS.HTTP_STATUS.OK).json({
      success: true,
      message: CONSTANTS.RESPONSE_MESSAGES.SUCCESS.RETRIEVED,
      data: {
        notifications,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total,
          limit: limitNum
        }
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

async createNotification(req, res) {
  try {
    const {
      recipient,
      type,
      title,
      message,
      channels,
      data,
      priority = 'medium',
      scheduledFor
    } = req.body;

    const validation = Validators.validateMultiple([
      Validators.validateObjectId(recipient, 'Recipient ID'),
      Validators.validateString(title, 'Title', 5, 100),
      Validators.validateString(message, 'Message', 10, 500)
    ]);

    if (!validation.isValid) {
      return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    if (!Object.values(CONSTANTS.NOTIFICATION_TYPES).includes(type)) {
      return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Invalid notification type'
      });
    }

    if (!Object.values(CONSTANTS.NOTIFICATION_PRIORITY).includes(priority)) {
      return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Invalid priority level'
      });
    }

    const user = await User.findById(recipient);
    if (!user) {
      return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    const notificationData = {
      recipient,
      type,
      title: Helpers.sanitizeInput(title),
      message: Helpers.sanitizeInput(message),
      data: data || {},
      priority,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date()
    };

    const notification = new Notification(notificationData);
    await notification.save();

    // Send immediate notifications if not scheduled for future
    if (!scheduledFor || new Date(scheduledFor) <= new Date()) {
      try {
        // Default channels if not provided
        const notificationChannels = channels || { inApp: true, sms: false, email: false };

        // Send SMS if enabled and user has phone
        if (notificationChannels.sms && user.phone) {
          try {
            const smsResult = await smsService.sendSMS(user.phone, notification.message, notification.type);
            
            notification.channels.sms.sent = smsResult.success;
            notification.channels.sms.sentAt = new Date();
            notification.channels.sms.phone = user.phone;
            notification.channels.sms.messageId = smsResult.messageId;
            notification.channels.sms.status = smsResult.success ? 'sent' : 'failed';
          } catch (smsError) {
            console.error('SMS sending failed:', smsError);
            notification.channels.sms.sent = false;
            notification.channels.sms.status = 'failed';
            notification.channels.sms.error = smsError.message;
          }
        }

        // Send email if enabled and user has email
        if (notificationChannels.email && user.email) {
          try {
            const emailResult = await emailService.sendEmail(
              user.email,
              notification.title,
              `<p>${notification.message}</p>`
            );
            
            notification.channels.email.sent = emailResult.success;
            notification.channels.email.sentAt = new Date();
            notification.channels.email.email = user.email;
            notification.channels.email.status = emailResult.success ? 'sent' : 'failed';
          } catch (emailError) {
            console.error('Email sending failed:', emailError);
            notification.channels.email.sent = false;
            notification.channels.email.status = 'failed';
            notification.channels.email.error = emailError.message;
          }
        }

        // In-app notifications are handled by default when the notification is created
        // Just ensure the inApp channel is marked as delivered
        if (notificationChannels.inApp !== false) {
          notification.channels.inApp.delivered = true;
          notification.channels.inApp.deliveredAt = new Date();
        }

        // Save the updated notification with channel status
        await notification.save();

      } catch (channelError) {
        console.error('Error sending notification channels:', channelError);
        // Don't fail the entire request if channel sending fails
        // The notification is still created successfully
      }
    }

    res.status(CONSTANTS.HTTP_STATUS.CREATED).json({
      success: true,
      message: CONSTANTS.RESPONSE_MESSAGES.SUCCESS.CREATED,
      data: { notification }
    });

  } catch (error) {
    console.error('Error in createNotification:', error);
    res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
      error: error.message
    });
  }
}

async sendNotificationChannels(notification, user, channels = { inApp: true, sms: false, email: false }) {
    try {
      // Send SMS if enabled and user has phone
      if (channels.sms && user.phone) {
        const smsResult = await smsService.sendSMS(user.phone, notification.message, notification.type);
        
        notification.channels.sms.sent = smsResult.success;
        notification.channels.sms.sentAt = new Date();
        notification.channels.sms.phone = user.phone;
        notification.channels.sms.messageId = smsResult.messageId;
        notification.channels.sms.status = smsResult.success ? 'sent' : 'failed';
      }

      // Send email if enabled and user has email
      if (channels.email && user.email) {
        const emailResult = await emailService.sendEmail(
          user.email,
          notification.title,
          `<p>${notification.message}</p>`
        );
        
        notification.channels.email.sent = emailResult.success;
        notification.channels.email.sentAt = new Date();
        notification.channels.email.email = user.email;
        notification.channels.email.status = emailResult.success ? 'sent' : 'failed';
      }

      await notification.save();
    } catch (error) {
      console.error('Error sending notification channels:', error);
      throw error;
    }
  }

  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const validation = Validators.validateObjectId(id, 'Notification ID');
      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validation.message
        });
      }

      const notification = await Notification.findOne({
        _id: id,
        recipient: userId
      });

      if (!notification) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: CONSTANTS.RESPONSE_MESSAGES.ERROR.NOT_FOUND
        });
      }

      await notification.markAsRead();

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: 'Notification marked as read'
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async markAllAsRead(req, res) {
    try {
      const userId = req.user.userId;

      await Notification.updateMany(
        { 
          recipient: userId,
          'channels.inApp.read': false
        },
        {
          $set: {
            'channels.inApp.read': true,
            'channels.inApp.readAt': new Date()
          }
        }
      );

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: 'All notifications marked as read'
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async sendSMS(req, res) {
    try {
      const { phone, message, type } = req.body;

      const validation = Validators.validateMultiple([
        Validators.validatePhone(phone),
        Validators.validateString(message, 'Message', 10, 160)
      ]);

      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      const result = await smsService.sendSMS(
        Helpers.formatPhone(phone),
        Helpers.sanitizeInput(message),
        type
      );

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: result.success,
        message: result.success ? 'SMS sent successfully' : 'Failed to send SMS',
        data: result
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async sendEmail(req, res) {
    try {
      const { email, subject, message, type } = req.body;

      const validation = Validators.validateMultiple([
        Validators.validateEmail(email),
        Validators.validateString(subject, 'Subject', 5, 100),
        Validators.validateString(message, 'Message', 10)
      ]);

      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      const result = await emailService.sendEmail(
        email,
        Helpers.sanitizeInput(subject),
        `<p>${Helpers.sanitizeInput(message)}</p>`
      );

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: result.success,
        message: result.success ? 'Email sent successfully' : 'Failed to send email',
        data: result
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async sendBulkNotification(req, res) {
    try {
      const {
        recipients,
        type,
        title,
        message,
        channels = ['inApp'],
        priority = 'medium'
      } = req.body;

      if (!Array.isArray(recipients) || recipients.length === 0) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Recipients array is required and cannot be empty'
        });
      }

      const validation = Validators.validateMultiple([
        Validators.validateString(title, 'Title', 5, 100),
        Validators.validateString(message, 'Message', 10, 500)
      ]);

      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      const users = await User.find({
        _id: { $in: recipients },
        isActive: true
      });

      if (users.length === 0) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'No valid recipients found'
        });
      }

      const results = {
        total: users.length,
        successful: 0,
        failed: 0,
        details: []
      };

      for (const user of users) {
        try {
          const notificationData = {
            recipient: user._id,
            type,
            title: Helpers.sanitizeInput(title),
            message: Helpers.sanitizeInput(message),
            priority
          };

          const notification = new Notification(notificationData);
          await notification.save();

          if (channels.includes('sms') || channels.includes('email')) {
            await this.sendNotificationChannels(notification, user);
          }

          results.successful++;
          results.details.push({
            userId: user._id,
            email: user.email,
            phone: user.phone,
            status: 'success'
          });

        } catch (error) {
          results.failed++;
          results.details.push({
            userId: user._id,
            email: user.email,
            phone: user.phone,
            status: 'failed',
            error: error.message
          });
        }
      }

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: 'Bulk notification processing completed',
        data: results
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async getNotificationStats(req, res) {
    try {
      const { from, to } = req.query;
      
      let dateFilter = {};
      if (from || to) {
        dateFilter.createdAt = {};
        if (from) dateFilter.createdAt.$gte = new Date(from);
        if (to) dateFilter.createdAt.$lte = new Date(to);
      }

      const stats = await Notification.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            totalNotifications: { $sum: 1 },
            sentSMS: { $sum: { $cond: ['$channels.sms.sent', 1, 0] } },
            sentEmails: { $sum: { $cond: ['$channels.email.sent', 1, 0] } },
            readNotifications: { $sum: { $cond: ['$channels.inApp.read', 1, 0] } },
            byType: { $push: '$type' },
            byPriority: { $push: '$priority' }
          }
        }
      ]);

      const typeStats = await Notification.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]);

      const priorityStats = await Notification.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]);

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: CONSTANTS.RESPONSE_MESSAGES.SUCCESS.RETRIEVED,
        data: {
          overview: stats[0] || {
            totalNotifications: 0,
            sentSMS: 0,
            sentEmails: 0,
            readNotifications: 0
          },
          byType: typeStats,
          byPriority: priorityStats
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

  async getUnreadCount(req, res) {
    try {
      const userId = req.user.userId;

      const count = await Notification.countDocuments({
        recipient: userId,
        'channels.inApp.read': false,
        isActive: true
      });

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: 'Unread count retrieved successfully',
        data: { count }
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const validation = Validators.validateObjectId(id, 'Notification ID');
      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validation.message
        });
      }

      const notification = await Notification.findOne({
        _id: id,
        $or: [
          { recipient: userId },
          // Admin can delete any notification
          { recipient: { $exists: true } }
        ]
      });

      if (!notification) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: CONSTANTS.RESPONSE_MESSAGES.ERROR.NOT_FOUND
        });
      }

      // Check if user is admin or notification owner
      if (notification.recipient.toString() !== userId && req.user.role !== CONSTANTS.USER_ROLES.ADMIN) {
        return res.status(CONSTANTS.HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: CONSTANTS.RESPONSE_MESSAGES.ERROR.FORBIDDEN
        });
      }

      await Notification.findByIdAndDelete(id);

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: CONSTANTS.RESPONSE_MESSAGES.SUCCESS.DELETED
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

module.exports = new NotificationController();