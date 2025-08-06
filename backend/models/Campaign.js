const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  location: {
    venue: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    district: {
      type: String,
      required: true
    }
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetBloodTypes: [{
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  }],
  targetDonors: {
    type: Number,
    default: 0
  },
  registeredDonors: [{
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor'
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'confirmed', 'attended', 'donated', 'cancelled'],
      default: 'registered'
    },
    appointmentTime: Date
  }],
  status: {
    type: String,
    enum: ['planned', 'active', 'completed', 'cancelled'],
    default: 'planned'
  },
  results: {
    totalAttendees: {
      type: Number,
      default: 0
    },
    successfulDonations: {
      type: Number,
      default: 0
    },
    unitsCollected: {
      type: Number,
      default: 0
    }
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

campaignSchema.methods.isActive = function() {
  const now = new Date();
  return this.startDate <= now && this.endDate >= now && this.status === 'active';
};

campaignSchema.methods.getRegisteredCount = function() {
  return this.registeredDonors.filter(donor => donor.status !== 'cancelled').length;
};

campaignSchema.methods.getDonatedCount = function() {
  return this.registeredDonors.filter(donor => donor.status === 'donated').length;
};

module.exports = mongoose.model('Campaign', campaignSchema);