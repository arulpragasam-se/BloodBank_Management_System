const Hospital = require('../models/Hospital');
const User = require('../models/User');
const BloodRequest = require('../models/BloodRequest');
const Validators = require('../utils/validators');
const Helpers = require('../utils/helpers');
const CONSTANTS = require('../utils/constants');

class HospitalController {
  async getAllHospitals(req, res) {
    try {
      console.log('Fetching all hospitals with query:', req.query);
      const { page = 1, limit = 10, search, district, isActive } = req.query;
      const { page: pageNum, limit: limitNum, skip } = Helpers.paginate(page, limit);

      const query = Helpers.buildQuery({
        ...(district && { 'address.district': district }),
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
        ...(search && { search })
      });

      const hospitals = await Hospital.find(query)
        .populate('staffMembers.userId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

        console.log('hospitals', hospitals);

      const total = await Hospital.countDocuments(query);

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: CONSTANTS.RESPONSE_MESSAGES.SUCCESS.RETRIEVED,
        data: {
          hospitals,
          pagination: {
            current: pageNum,
            pages: Math.ceil(total / limitNum),
            total,
            limit: limitNum
          }
        }
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async createHospital(req, res) {
    try {
      const { name, registrationNumber, address, contactInfo, bloodBankCapacity } = req.body;

      const validation = Validators.validateMultiple([
        Validators.validateString(name, 'Hospital name', 3, 100),
        Validators.validateString(registrationNumber, 'Registration number', 5, 50),
        Validators.validateEmail(contactInfo?.email),
        Validators.validatePhone(contactInfo?.phone)
      ]);

      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      const existingHospital = await Hospital.findOne({ registrationNumber });
      if (existingHospital) {
        return res.status(CONSTANTS.HTTP_STATUS.CONFLICT).json({
          success: false,
          message: 'Hospital with this registration number already exists'
        });
      }

      const hospitalData = {
        name: Helpers.sanitizeInput(name),
        registrationNumber: Helpers.sanitizeInput(registrationNumber),
        address: {
          street: Helpers.sanitizeInput(address.street),
          city: Helpers.sanitizeInput(address.city),
          district: Helpers.sanitizeInput(address.district),
          zipCode: address.zipCode || ''
        },
        contactInfo: {
          phone: Helpers.formatPhone(contactInfo.phone),
          email: contactInfo.email.toLowerCase(),
          emergencyPhone: contactInfo.emergencyPhone ? Helpers.formatPhone(contactInfo.emergencyPhone) : ''
        },
        bloodBankCapacity: bloodBankCapacity || 0
      };

      const hospital = new Hospital(hospitalData);
      await hospital.save();

      res.status(CONSTANTS.HTTP_STATUS.CREATED).json({
        success: true,
        message: CONSTANTS.RESPONSE_MESSAGES.SUCCESS.CREATED,
        data: { hospital }
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async getHospitalById(req, res) {
    try {
      const { id } = req.params;

      const validation = Validators.validateObjectId(id, 'Hospital ID');
      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validation.message
        });
      }

      const hospital = await Hospital.findById(id)
        .populate('staffMembers.userId', 'name email phone role');

      if (!hospital) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: CONSTANTS.RESPONSE_MESSAGES.ERROR.NOT_FOUND
        });
      }

      const bloodRequests = await BloodRequest.find({ hospitalId: id })
        .populate('requestedBy', 'name')
        .populate('recipientId', 'bloodType')
        .sort({ createdAt: -1 })
        .limit(10);

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: CONSTANTS.RESPONSE_MESSAGES.SUCCESS.RETRIEVED,
        data: {
          hospital,
          recentRequests: bloodRequests
        }
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async updateHospital(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const validation = Validators.validateObjectId(id, 'Hospital ID');
      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validation.message
        });
      }

      const hospital = await Hospital.findById(id);
      if (!hospital) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: CONSTANTS.RESPONSE_MESSAGES.ERROR.NOT_FOUND
        });
      }

      if (updateData.contactInfo?.email) {
        const emailValidation = Validators.validateEmail(updateData.contactInfo.email);
        if (!emailValidation.isValid) {
          return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: emailValidation.message
          });
        }
      }

      if (updateData.contactInfo?.phone) {
        const phoneValidation = Validators.validatePhone(updateData.contactInfo.phone);
        if (!phoneValidation.isValid) {
          return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: phoneValidation.message
          });
        }
        updateData.contactInfo.phone = Helpers.formatPhone(updateData.contactInfo.phone);
      }

      const updatedHospital = await Hospital.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).populate('staffMembers.userId', 'name email');

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: CONSTANTS.RESPONSE_MESSAGES.SUCCESS.UPDATED,
        data: { hospital: updatedHospital }
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async addStaffMember(req, res) {
    try {
      const { id } = req.params;
      const { userId, position, department } = req.body;

      const validation = Validators.validateMultiple([
        Validators.validateObjectId(id, 'Hospital ID'),
        Validators.validateObjectId(userId, 'User ID')
      ]);

      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      if (!Object.values(CONSTANTS.HOSPITAL_POSITIONS).includes(position)) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Invalid position'
        });
      }

      const hospital = await Hospital.findById(id);
      if (!hospital) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Hospital not found'
        });
      }

      const user = await User.findById(userId);
      if (!user || user.role !== CONSTANTS.USER_ROLES.HOSPITAL_STAFF) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'User not found or not a hospital staff member'
        });
      }

      const existingStaff = hospital.staffMembers.find(
        staff => staff.userId.toString() === userId
      );

      if (existingStaff) {
        return res.status(CONSTANTS.HTTP_STATUS.CONFLICT).json({
          success: false,
          message: 'User is already a staff member of this hospital'
        });
      }

      hospital.staffMembers.push({
        userId,
        position,
        department: department || ''
      });

      await hospital.save();

      res.status(CONSTANTS.HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Staff member added successfully',
        data: {
          hospitalId: id,
          userId,
          position,
          department
        }
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async removeStaffMember(req, res) {
    try {
      const { id, userId } = req.params;

      const validation = Validators.validateMultiple([
        Validators.validateObjectId(id, 'Hospital ID'),
        Validators.validateObjectId(userId, 'User ID')
      ]);

      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      const hospital = await Hospital.findById(id);
      if (!hospital) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Hospital not found'
        });
      }

      const staffIndex = hospital.staffMembers.findIndex(
        staff => staff.userId.toString() === userId
      );

      if (staffIndex === -1) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Staff member not found in this hospital'
        });
      }

      hospital.staffMembers.splice(staffIndex, 1);
      await hospital.save();

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: 'Staff member removed successfully'
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async getHospitalRequests(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10, status, urgency } = req.query;

      const validation = Validators.validateObjectId(id, 'Hospital ID');
      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validation.message
        });
      }

      const { page: pageNum, limit: limitNum, skip } = Helpers.paginate(page, limit);

      let query = { hospitalId: id };
      if (status) query.status = status;
      if (urgency) query.urgencyLevel = urgency;

      const requests = await BloodRequest.find(query)
        .populate('requestedBy', 'name')
        .populate('recipientId', 'bloodType')
        .populate('processedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      const total = await BloodRequest.countDocuments(query);

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: CONSTANTS.RESPONSE_MESSAGES.SUCCESS.RETRIEVED,
        data: {
          requests,
          pagination: {
            current: pageNum,
            pages: Math.ceil(total / limitNum),
            total,
            limit: limitNum
          }
        }
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async deleteHospital(req, res) {
    try {
      const { id } = req.params;

      const validation = Validators.validateObjectId(id, 'Hospital ID');
      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validation.message
        });
      }

      const hospital = await Hospital.findById(id);
      if (!hospital) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: CONSTANTS.RESPONSE_MESSAGES.ERROR.NOT_FOUND
        });
      }

      // Check if hospital has active blood requests
      const activeRequests = await BloodRequest.countDocuments({
        hospitalId: id,
        status: { $in: [CONSTANTS.REQUEST_STATUS.PENDING, CONSTANTS.REQUEST_STATUS.APPROVED] }
      });

      if (activeRequests > 0) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Cannot delete hospital with active blood requests'
        });
      }

      await Hospital.findByIdAndDelete(id);

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: CONSTANTS.RESPONSE_MESSAGES.SUCCESS.DELETED
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }
}

module.exports = new HospitalController();