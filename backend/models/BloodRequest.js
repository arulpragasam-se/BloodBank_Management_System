const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipient'
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  unitsRequired: {
    type: Number,
    required: true,
    min: 1
  },
  urgencyLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  requiredBy: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  patientCondition: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'partially_fulfilled', 'fulfilled', 'rejected', 'cancelled','critical'],
    default: 'pending'
  },
  allocatedBlood: [{
    inventoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodInventory'
    },
    units: Number,
    allocationDate: {
      type: Date,
      default: Date.now
    }
  }],
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: Date,
  notes: String,
  rejectionReason: String
}, {
  timestamps: true
});

bloodRequestSchema.methods.getAllocatedUnits = function() {
  return this.allocatedBlood.reduce((total, allocation) => total + allocation.units, 0);
};

bloodRequestSchema.methods.getRemainingUnits = function() {
  return this.unitsRequired - this.getAllocatedUnits();
};

bloodRequestSchema.methods.isUrgent = function() {
  return this.urgencyLevel === 'high' || this.urgencyLevel === 'critical';
};

bloodRequestSchema.methods.isOverdue = function() {
  return new Date() > this.requiredBy && this.status !== 'fulfilled';
};

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);