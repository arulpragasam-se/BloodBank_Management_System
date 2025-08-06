const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor',
    required: true
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  },
  donationDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  unitsCollected: {
    type: Number,
    required: true,
    min: 1
  },
  preScreening: {
    weight: {
      type: Number,
      required: true
    },
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    hemoglobin: Number,
    temperature: Number,
    pulse: Number,
    passed: {
      type: Boolean,
      default: true
    },
    notes: String
  },
  collectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    venue: String,
    address: String
  },
  status: {
    type: String,
    enum: ['collected', 'tested', 'processed', 'stored', 'discarded'],
    default: 'collected'
  },
  inventoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodInventory'
  },
  complications: String,
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpNotes: String
}, {
  timestamps: true
});

donationSchema.methods.isSuccessful = function() {
  return this.status !== 'discarded' && this.preScreening.passed;
};

module.exports = mongoose.model('Donation', donationSchema);