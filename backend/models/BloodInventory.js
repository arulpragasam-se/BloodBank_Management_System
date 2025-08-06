const mongoose = require('mongoose');

const bloodInventorySchema = new mongoose.Schema({
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  units: {
    type: Number,
    required: true,
    min: 0
  },
  collectionDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor',
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'used', 'expired'],
    default: 'available'
  },
  testResults: {
    hiv: {
      type: String,
      enum: ['positive', 'negative', 'pending'],
      default: 'pending'
    },
    hepatitisB: {
      type: String,
      enum: ['positive', 'negative', 'pending'],
      default: 'pending'
    },
    hepatitisC: {
      type: String,
      enum: ['positive', 'negative', 'pending'],
      default: 'pending'
    },
    syphilis: {
      type: String,
      enum: ['positive', 'negative', 'pending'],
      default: 'pending'
    }
  },
  storageLocation: {
    section: String,
    shelf: String,
    position: String
  },
  notes: String
}, {
  timestamps: true
});

bloodInventorySchema.methods.isExpired = function() {
  return new Date() > this.expiryDate;
};

bloodInventorySchema.methods.daysUntilExpiry = function() {
  const today = new Date();
  const expiry = new Date(this.expiryDate);
  const timeDiff = expiry.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

bloodInventorySchema.methods.isTestsComplete = function() {
  const tests = this.testResults;
  return tests.hiv !== 'pending' && 
         tests.hepatitisB !== 'pending' && 
         tests.hepatitisC !== 'pending' && 
         tests.syphilis !== 'pending';
};

bloodInventorySchema.methods.isTestsPassed = function() {
  const tests = this.testResults;
  return tests.hiv === 'negative' && 
         tests.hepatitisB === 'negative' && 
         tests.hepatitisC === 'negative' && 
         tests.syphilis === 'negative';
};

module.exports = mongoose.model('BloodInventory', bloodInventorySchema);