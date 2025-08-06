const mongoose = require('mongoose');

const recipientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  medicalCondition: {
    type: String,
    required: true
  },
  emergencyContact: {
    name: {
      type: String,
      required: false
    },
    phone: {
      type: String,
      required: false
    },
    relationship: {
      type: String,
      required: false
    }
  },
  transfusionHistory: [{
    date: {
      type: Date,
      required: true
    },
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true
    },
    units: {
      type: Number,
      required: true
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital'
    },
    reason: String,
    complications: String
  }],
  allergies: [String],
  currentMedications: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

recipientSchema.methods.calculateAge = function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

recipientSchema.methods.getCompatibleBloodTypes = function() {
  const compatibility = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    'AB-': ['A-', 'B-', 'AB-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-']
  };
  
  return compatibility[this.bloodType] || [];
};

module.exports = mongoose.model('Recipient', recipientSchema);