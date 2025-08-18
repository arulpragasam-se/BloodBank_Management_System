export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  if (!password || password.length < 6) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  return hasUpper && hasLower && hasNumber;
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15 && phoneRegex.test(phone);
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

export const validateBloodType = (bloodType) => {
  const validTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  return validTypes.includes(bloodType);
};

export const validateAge = (dateOfBirth, minAge = 18, maxAge = 65) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  const age = today.getFullYear() - birthDate.getFullYear();
  return age >= minAge && age <= maxAge;
};

export const validateWeight = (weight) => {
  const numWeight = parseFloat(weight);
  return !isNaN(numWeight) && numWeight >= 30 && numWeight <= 300;
};

export const validateHeight = (height) => {
  const numHeight = parseFloat(height);
  return !isNaN(numHeight) && numHeight >= 100 && numHeight <= 250;
};

export const validateUnits = (units) => {
  const numUnits = parseInt(units);
  return !isNaN(numUnits) && numUnits >= 1 && numUnits <= 10;
};

export const validateDate = (date) => {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj);
};

export const validateFutureDate = (date) => {
  const dateObj = new Date(date);
  const today = new Date();
  return dateObj > today;
};

export const validateForm = (formData, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = formData[field];
    const rule = rules[field];
    
    if (rule.required && !validateRequired(value)) {
      errors[field] = `${field} is required`;
      return;
    }
    
    if (value && rule.type) {
      switch (rule.type) {
        case 'email':
          if (!validateEmail(value)) {
            errors[field] = 'Invalid email format';
          }
          break;
        case 'password':
          if (!validatePassword(value)) {
            errors[field] = 'Password must be at least 6 characters with uppercase, lowercase, and number';
          }
          break;
        case 'phone':
          if (!validatePhone(value)) {
            errors[field] = 'Invalid phone number';
          }
          break;
        case 'bloodType':
          if (!validateBloodType(value)) {
            errors[field] = 'Invalid blood type';
          }
          break;
        case 'number':
          if (isNaN(value) || (rule.min && value < rule.min) || (rule.max && value > rule.max)) {
            errors[field] = `Invalid number ${rule.min ? `(min: ${rule.min})` : ''} ${rule.max ? `(max: ${rule.max})` : ''}`;
          }
          break;
        case 'date':
          if (!validateDate(value)) {
            errors[field] = 'Invalid date';
          }
          break;
        default:
          break;
      }
    }
    
    if (value && rule.minLength && value.length < rule.minLength) {
      errors[field] = `Minimum ${rule.minLength} characters required`;
    }
    
    if (value && rule.maxLength && value.length > rule.maxLength) {
      errors[field] = `Maximum ${rule.maxLength} characters allowed`;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};