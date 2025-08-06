const crypto = require('crypto');

class Helpers {
  static formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    switch (format) {
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'YYYY-MM-DD HH:mm':
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      case 'DD/MM/YYYY HH:mm':
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      default:
        return d.toISOString();
    }
  }

  static formatPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('0')) {
      return '+94' + cleaned.substring(1);
    }
    if (cleaned.startsWith('94')) {
      return '+' + cleaned;
    }
    if (cleaned.startsWith('+94')) {
      return cleaned;
    }
    
    return '+94' + cleaned;
  }

  static calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  static calculateNextEligibleDate(lastDonationDate, donorGender = 'male') {
    if (!lastDonationDate) return new Date();
    
    const lastDonation = new Date(lastDonationDate);
    const intervalDays = donorGender === 'female' ? 112 : 84; // 16 weeks for female, 12 weeks for male
    
    const nextEligible = new Date(lastDonation);
    nextEligible.setDate(nextEligible.getDate() + intervalDays);
    
    return nextEligible;
  }

  static getBloodCompatibility(bloodType) {
    const compatibility = {
      'A+': {
        canReceiveFrom: ['A+', 'A-', 'O+', 'O-'],
        canDonateTo: ['A+', 'AB+']
      },
      'A-': {
        canReceiveFrom: ['A-', 'O-'],
        canDonateTo: ['A+', 'A-', 'AB+', 'AB-']
      },
      'B+': {
        canReceiveFrom: ['B+', 'B-', 'O+', 'O-'],
        canDonateTo: ['B+', 'AB+']
      },
      'B-': {
        canReceiveFrom: ['B-', 'O-'],
        canDonateTo: ['B+', 'B-', 'AB+', 'AB-']
      },
      'AB+': {
        canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        canDonateTo: ['AB+']
      },
      'AB-': {
        canReceiveFrom: ['A-', 'B-', 'AB-', 'O-'],
        canDonateTo: ['AB+', 'AB-']
      },
      'O+': {
        canReceiveFrom: ['O+', 'O-'],
        canDonateTo: ['A+', 'B+', 'AB+', 'O+']
      },
      'O-': {
        canReceiveFrom: ['O-'],
        canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
      }
    };
    
    return compatibility[bloodType] || { canReceiveFrom: [], canDonateTo: [] };
  }

  static generateUniqueId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const randomStr = crypto.randomBytes(6).toString('hex');
    return `${prefix}${timestamp}${randomStr}`.toUpperCase();
  }

  static calculateBloodExpiry(collectionDate, bloodComponent = 'whole_blood') {
    const collection = new Date(collectionDate);
    const expiryDays = {
      whole_blood: 35,
      red_cells: 42,
      platelets: 5,
      plasma: 365,
      cryoprecipitate: 365
    };
    
    const days = expiryDays[bloodComponent] || 35;
    const expiryDate = new Date(collection);
    expiryDate.setDate(expiryDate.getDate() + days);
    
    return expiryDate;
  }

  static getDaysUntilExpiry(expiryDate) {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const timeDiff = expiry.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  static checkDonorEligibility(donor) {
    const eligibilityChecks = {
      age: this.calculateAge(donor.dateOfBirth),
      weight: donor.weight,
      lastDonation: donor.lastDonationDate,
      medicalHistory: donor.medicalHistory
    };

    const issues = [];

    if (eligibilityChecks.age < 18 || eligibilityChecks.age > 65) {
      issues.push('Age must be between 18-65 years');
    }

    if (eligibilityChecks.weight < 50) {
      issues.push('Weight must be at least 50kg');
    }

    if (eligibilityChecks.lastDonation) {
      const nextEligible = this.calculateNextEligibleDate(eligibilityChecks.lastDonation);
      if (new Date() < nextEligible) {
        issues.push(`Not eligible until ${this.formatDate(nextEligible)}`);
      }
    }

    const restrictedConditions = ['hiv', 'hepatitis', 'cancer', 'heart_disease'];
    if (eligibilityChecks.medicalHistory?.diseases) {
      const hasRestricted = eligibilityChecks.medicalHistory.diseases.some(disease => 
        restrictedConditions.some(condition => 
          disease.toLowerCase().includes(condition.replace('_', ' '))
        )
      );
      if (hasRestricted) {
        issues.push('Medical history contains restricting conditions');
      }
    }

    return {
      isEligible: issues.length === 0,
      issues,
      nextEligibleDate: eligibilityChecks.lastDonation ? 
        this.calculateNextEligibleDate(eligibilityChecks.lastDonation) : null
    };
  }

  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .trim()
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '');
  }

  static generateOTP(length = 6) {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }
    return otp;
  }

  static hashData(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  static maskSensitiveData(data, fields = []) {
    const masked = { ...data };
    
    const defaultFields = ['password', 'ssn', 'nationalId'];
    const fieldsToMask = [...defaultFields, ...fields];
    
    fieldsToMask.forEach(field => {
      if (masked[field]) {
        masked[field] = '*'.repeat(masked[field].length);
      }
    });
    
    return masked;
  }

  static paginate(page = 1, limit = 10) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;
    
    return {
      page: pageNum,
      limit: limitNum,
      skip
    };
  }

  static buildQuery(filters = {}) {
    const query = {};
    
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      
      if (value !== undefined && value !== null && value !== '') {
        if (key.includes('Date') && typeof value === 'object') {
          if (value.from || value.to) {
            query[key] = {};
            if (value.from) query[key].$gte = new Date(value.from);
            if (value.to) query[key].$lte = new Date(value.to);
          }
        } else if (typeof value === 'string' && key.includes('search')) {
          query[key.replace('search', 'name')] = { $regex: value, $options: 'i' };
        } else {
          query[key] = value;
        }
      }
    });
    
    return query;
  }

  static calculateInventoryStats(inventoryItems) {
    const stats = {
      totalUnits: 0,
      byBloodType: {},
      expiringIn7Days: 0,
      expiringIn3Days: 0,
      expired: 0
    };

    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    bloodTypes.forEach(type => {
      stats.byBloodType[type] = { units: 0, expiringSoon: 0 };
    });

    inventoryItems.forEach(item => {
      if (item.status === 'available') {
        stats.totalUnits += item.units;
        stats.byBloodType[item.bloodType].units += item.units;

        const daysUntilExpiry = this.getDaysUntilExpiry(item.expiryDate);
        
        if (daysUntilExpiry <= 0) {
          stats.expired += item.units;
        } else if (daysUntilExpiry <= 3) {
          stats.expiringIn3Days += item.units;
          stats.byBloodType[item.bloodType].expiringSoon += item.units;
        } else if (daysUntilExpiry <= 7) {
          stats.expiringIn7Days += item.units;
        }
      }
    });

    return stats;
  }

  static generateReport(data, type) {
    const report = {
      generatedAt: new Date(),
      type,
      period: {
        from: data.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: data.to || new Date()
      },
      summary: {},
      details: data.details || []
    };

    switch (type) {
      case 'donor_report':
        report.summary = {
          totalDonors: data.totalDonors || 0,
          activeDonors: data.activeDonors || 0,
          newRegistrations: data.newRegistrations || 0,
          totalDonations: data.totalDonations || 0
        };
        break;
      
      case 'inventory_report':
        report.summary = this.calculateInventoryStats(data.details);
        break;
        
      case 'campaign_report':
        report.summary = {
          totalCampaigns: data.totalCampaigns || 0,
          activeCampaigns: data.activeCampaigns || 0,
          totalParticipants: data.totalParticipants || 0,
          successfulDonations: data.successfulDonations || 0
        };
        break;
    }

    return report;
  }

  static validateBusinessRules(operation, data) {
    const rules = [];

    switch (operation) {
      case 'blood_allocation':
        if (data.requestedUnits > data.availableUnits) {
          rules.push('Requested units exceed available stock');
        }
        if (data.urgency === 'critical' && data.bloodType === 'O-') {
          rules.push('Critical request for universal donor blood - verify availability');
        }
        break;

      case 'donor_registration':
        const eligibility = this.checkDonorEligibility(data);
        if (!eligibility.isEligible) {
          rules.push(...eligibility.issues);
        }
        break;

      case 'campaign_scheduling':
        const campaignDate = new Date(data.startDate);
        const minAdvanceNotice = 7; // days
        const advanceNotice = (campaignDate - new Date()) / (1000 * 60 * 60 * 24);
        
        if (advanceNotice < minAdvanceNotice) {
          rules.push(`Campaign must be scheduled at least ${minAdvanceNotice} days in advance`);
        }
        break;
    }

    return {
      isValid: rules.length === 0,
      violations: rules
    };
  }
}

module.exports = Helpers;