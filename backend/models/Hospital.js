const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    street: {
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
    },
    zipCode: String
  },
  contactInfo: {
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    emergencyPhone: String
  },
  staffMembers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    position: {
      type: String,
      enum: ['doctor', 'nurse', 'lab_technician', 'blood_bank_officer', 'administrator']
    },
    department: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  bloodBankCapacity: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Hospital', hospitalSchema);