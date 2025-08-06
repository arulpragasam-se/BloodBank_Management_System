const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
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
  weight: {
    type: Number,
    required: true
  },
  height: {
    type: Number,
    required: true
  },
  address: {
    street: String,
    city: String,
    district: String,
    zipCode: String
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  medicalHistory: {
    allergies: [String],
    medications: [String],
    diseases: [String],
    surgeries: [String]
  },
  lastDonationDate: {
    type: Date,
    default: null
  },
  totalDonations: {
    type: Number,
    default: 0
  },
  isEligible: {
    type: Boolean,
    default: true
  },
  eligibilityNotes: {
    type: String,
    default: null
  },
  nextEligibleDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

donorSchema.methods.calculateAge = function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

donorSchema.methods.checkEligibility = function() {
  const age = this.calculateAge();
  const currentDate = new Date();
  
  if (age < 18 || age > 65) return false;
  if (this.weight < 50) return false;
  if (this.lastDonationDate && this.nextEligibleDate > currentDate) return false;
  
  return true;
};

module.exports = mongoose.model('Donor', donorSchema);