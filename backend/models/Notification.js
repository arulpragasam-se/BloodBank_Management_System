const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'appointment_reminder',
      'eligibility_update',
      'campaign_invitation',
      'blood_request',
      'low_stock_alert',
      'expiry_alert',
      'donation_thanks',
      'test_results',
      'emergency_request'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign'
    },
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation'
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest'
    },
    inventoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodInventory'
    }
  },
  channels: {
    sms: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      phone: String,
      messageId: String,
      status: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'failed']
      }
    },
    email: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      email: String,
      status: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'failed']
      }
    },
    inApp: {
      read: {
        type: Boolean,
        default: false
      },
      readAt: Date
    }
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  scheduledFor: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

notificationSchema.methods.markAsRead = function() {
  this.channels.inApp.read = true;
  this.channels.inApp.readAt = new Date();
  return this.save();
};

notificationSchema.methods.isUrgent = function() {
  return this.priority === 'high' || this.priority === 'urgent';
};

module.exports = mongoose.model('Notification', notificationSchema);