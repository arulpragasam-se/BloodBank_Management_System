const validator = require('validator');

class Validators {
  static validateEmail(email) {
    if (!email) {
      return { isValid: false, message: 'Email is required' };
    }
    if (!validator.isEmail(email)) {
      return { isValid: false, message: 'Invalid email format' };
    }
    return { isValid: true };
  }

  static validatePassword(password) {
    if (!password) {
      return { isValid: false, message: 'Password is required' };
    }
    if (password.length < 6) {
      return { isValid: false, message: 'Password must be at least 6 characters long' };
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' };
    }
    return { isValid: true };
  }

  static validatePhone(phone) {
    if (!phone) {
      return { isValid: false, message: 'Phone number is required' };
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return { isValid: false, message: 'Phone number must be between 10-15 digits' };
    }
    return { isValid: true };
  }

  static validateBloodType(bloodType) {
    const validTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!bloodType) {
      return { isValid: false, message: 'Blood type is required' };
    }
    if (!validTypes.includes(bloodType)) {
      return { isValid: false, message: 'Invalid blood type' };
    }
    return { isValid: true };
  }

  static validateDateOfBirth(dateOfBirth) {
    if (!dateOfBirth) {
      return { isValid: false, message: 'Date of birth is required' };
    }
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    
    if (birthDate >= today) {
      return { isValid: false, message: 'Date of birth cannot be in the future' };
    }
    
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 16 || age > 100) {
      return { isValid: false, message: 'Age must be between 16 and 100 years' };
    }
    
    return { isValid: true };
  }

  static validateWeight(weight) {
    if (!weight) {
      return { isValid: false, message: 'Weight is required' };
    }
    if (weight < 30 || weight > 300) {
      return { isValid: false, message: 'Weight must be between 30-300 kg' };
    }
    return { isValid: true };
  }

  static validateHeight(height) {
    if (!height) {
      return { isValid: false, message: 'Height is required' };
    }
    if (height < 100 || height > 250) {
      return { isValid: false, message: 'Height must be between 100-250 cm' };
    }
    return { isValid: true };
  }

  static validateRole(role) {
    const validRoles = ['admin', 'hospital_staff', 'donor', 'recipient'];
    if (!role) {
      return { isValid: false, message: 'Role is required' };
    }
    if (!validRoles.includes(role)) {
      return { isValid: false, message: 'Invalid role' };
    }
    return { isValid: true };
  }

  static validateUnits(units) {
    if (!units) {
      return { isValid: false, message: 'Units is required' };
    }
    if (units < 1 || units > 10) {
      return { isValid: false, message: 'Units must be between 1-10' };
    }
    return { isValid: true };
  }

  static validateUrgencyLevel(urgency) {
    const validLevels = ['low', 'medium', 'high', 'critical'];
    if (!urgency) {
      return { isValid: false, message: 'Urgency level is required' };
    }
    if (!validLevels.includes(urgency)) {
      return { isValid: false, message: 'Invalid urgency level' };
    }
    return { isValid: true };
  }

  static validateFutureDate(date, fieldName = 'Date') {
    if (!date) {
      return { isValid: false, message: `${fieldName} is required` };
    }
    
    const inputDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (inputDate <= today) {
      return { isValid: false, message: `${fieldName} must be in the future` };
    }
    
    return { isValid: true };
  }

  static validateDateRange(startDate, endDate) {
    if (!startDate || !endDate) {
      return { isValid: false, message: 'Start date and end date are required' };
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return { isValid: false, message: 'End date must be after start date' };
    }
    
    return { isValid: true };
  }

  static validateVitalSigns(vitals) {
    const errors = [];

    if (vitals.bloodPressure) {
      const { systolic, diastolic } = vitals.bloodPressure;
      if (systolic && (systolic < 90 || systolic > 180)) {
        errors.push('Systolic blood pressure should be between 90-180 mmHg');
      }
      if (diastolic && (diastolic < 60 || diastolic > 120)) {
        errors.push('Diastolic blood pressure should be between 60-120 mmHg');
      }
    }

    if (vitals.hemoglobin && (vitals.hemoglobin < 8 || vitals.hemoglobin > 20)) {
      errors.push('Hemoglobin should be between 8-20 g/dL');
    }

    if (vitals.temperature && (vitals.temperature < 35 || vitals.temperature > 40)) {
      errors.push('Temperature should be between 35-40°C');
    }

    if (vitals.pulse && (vitals.pulse < 50 || vitals.pulse > 120)) {
      errors.push('Pulse should be between 50-120 bpm');
    }

    return {
      isValid: errors.length === 0,
      message: errors.join(', ')
    };
  }

  static validateObjectId(id, fieldName = 'ID') {
    if (!id) {
      return { isValid: false, message: `${fieldName} is required` };
    }
    if (!validator.isMongoId(id)) {
      return { isValid: false, message: `Invalid ${fieldName} format` };
    }
    return { isValid: true };
  }

  static validateString(str, fieldName, minLength = 1, maxLength = 255) {
    if (!str) {
      return { isValid: false, message: `${fieldName} is required` };
    }
    if (typeof str !== 'string') {
      return { isValid: false, message: `${fieldName} must be a string` };
    }
    if (str.trim().length < minLength) {
      return { isValid: false, message: `${fieldName} must be at least ${minLength} characters long` };
    }
    if (str.length > maxLength) {
      return { isValid: false, message: `${fieldName} must not exceed ${maxLength} characters` };
    }
    return { isValid: true };
  }

  static validateNumber(num, fieldName, min = 0, max = Number.MAX_VALUE) {
    if (num === undefined || num === null) {
      return { isValid: false, message: `${fieldName} is required` };
    }
    if (typeof num !== 'number' || isNaN(num)) {
      return { isValid: false, message: `${fieldName} must be a valid number` };
    }
    if (num < min || num > max) {
      return { isValid: false, message: `${fieldName} must be between ${min} and ${max}` };
    }
    return { isValid: true };
  }

  static validateMultiple(validations) {
    const errors = [];
    
    for (const validation of validations) {
      if (!validation.isValid) {
        errors.push(validation.message);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = Validators;