const Recipient = require('../models/Recipient');
const User = require('../models/User');
const BloodRequest = require('../models/BloodRequest');
const Validators = require('../utils/validators');
const Helpers = require('../utils/helpers');
const CONSTANTS = require('../utils/constants');

class RecipientController {
  async getAllRecipients(req, res) {
    try {
      const { page = 1, limit = 10, bloodType, search, isActive } = req.query;
      const { page: pageNum, limit: limitNum, skip } = Helpers.paginate(page, limit);

      const query = Helpers.buildQuery({
        ...(bloodType && { bloodType }),
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
        ...(search && { search })
      });

      const recipients = await Recipient.find(query)
        .populate('userId', 'name email phone isActive')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      const total = await Recipient.countDocuments(query);

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: CONSTANTS.RESPONSE_MESSAGES.SUCCESS.RETRIEVED,
        data: {
          recipients,
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

  async getRecipientById(req, res) {
    try {
      const { id } = req.params;

      const validation = Validators.validateObjectId(id, 'Recipient ID');
      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validation.message
        });
      }

      const recipient = await Recipient.findById(id)
        .populate('userId', 'name email phone isActive profileImage createdAt')
        .populate('transfusionHistory.hospitalId', 'name address.city');

      if (!recipient) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: CONSTANTS.RESPONSE_MESSAGES.ERROR.NOT_FOUND
        });
      }

      const bloodRequests = await BloodRequest.find({ recipientId: id })
        .populate('hospitalId', 'name')
        .populate('requestedBy', 'name')
        .sort({ createdAt: -1 })
        .limit(10);

      const compatibleBloodTypes = recipient.getCompatibleBloodTypes();

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: CONSTANTS.RESPONSE_MESSAGES.SUCCESS.RETRIEVED,
        data: {
          recipient,
          bloodRequests,
          compatibleBloodTypes,
          age: recipient.calculateAge()
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

  async updateRecipient(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const validation = Validators.validateObjectId(id, 'Recipient ID');
      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validation.message
        });
      }

      const recipient = await Recipient.findById(id);
      if (!recipient) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: CONSTANTS.RESPONSE_MESSAGES.ERROR.NOT_FOUND
        });
      }

      if (updateData.medicalCondition) {
        const conditionValidation = Validators.validateString(updateData.medicalCondition, 'Medical condition', 5, 200);
        if (!conditionValidation.isValid) {
          return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: conditionValidation.message
          });
        }
      }

      const updatedRecipient = await Recipient.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).populate('userId', 'name email phone');

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: CONSTANTS.RESPONSE_MESSAGES.SUCCESS.UPDATED,
        data: { recipient: updatedRecipient }
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async getTransfusionHistory(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10, from, to } = req.query;

      const validation = Validators.validateObjectId(id, 'Recipient ID');
      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validation.message
        });
      }

      const { page: pageNum, limit: limitNum, skip } = Helpers.paginate(page, limit);

      const recipient = await Recipient.findById(id);
      if (!recipient) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: CONSTANTS.RESPONSE_MESSAGES.ERROR.NOT_FOUND
        });
      }

      let transfusions = recipient.transfusionHistory;

      // Filter by date range if provided
      if (from || to) {
        transfusions = transfusions.filter(transfusion => {
          const transfusionDate = new Date(transfusion.date);
          if (from && transfusionDate < new Date(from)) return false;
          if (to && transfusionDate > new Date(to)) return false;
          return true;
        });
      }

      // Sort by date (newest first)
      transfusions.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Pagination
      const total = transfusions.length;
      const paginatedTransfusions = transfusions.slice(skip, skip + limitNum);

      // Calculate statistics
      const stats = {
        totalTransfusions: total,
        totalUnitsReceived: transfusions.reduce((sum, t) => sum + t.units, 0),
        lastTransfusion: transfusions.length > 0 ? transfusions[0].date : null,
        bloodTypesReceived: [...new Set(transfusions.map(t => t.bloodType))],
        complicationsCount: transfusions.filter(t => t.complications).length
      };

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: CONSTANTS.RESPONSE_MESSAGES.SUCCESS.RETRIEVED,
        data: {
          transfusions: paginatedTransfusions,
          stats,
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

  async addTransfusionRecord(req, res) {
    try {
      const { id } = req.params;
      const { date, bloodType, units, hospitalId, reason, complications } = req.body;

      const validation = Validators.validateMultiple([
        Validators.validateObjectId(id, 'Recipient ID'),
        Validators.validateBloodType(bloodType),
        Validators.validateUnits(units),
        Validators.validateObjectId(hospitalId, 'Hospital ID')
      ]);

      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      const recipient = await Recipient.findById(id);
      if (!recipient) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Recipient not found'
        });
      }

      // Check blood compatibility
      const compatibleTypes = recipient.getCompatibleBloodTypes();
      if (!compatibleTypes.includes(bloodType)) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: `Blood type ${bloodType} is not compatible with recipient's blood type ${recipient.bloodType}`
        });
      }

      const transfusionRecord = {
        date: new Date(date),
        bloodType,
        units,
        hospitalId,
        reason: reason || '',
        complications: complications || ''
      };

      recipient.transfusionHistory.push(transfusionRecord);
      await recipient.save();

      res.status(CONSTANTS.HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Transfusion record added successfully',
        data: { transfusionRecord }
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async getCompatibleBloodTypes(req, res) {
    try {
      const { id } = req.params;

      const validation = Validators.validateObjectId(id, 'Recipient ID');
      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validation.message
        });
      }

      const recipient = await Recipient.findById(id);
      if (!recipient) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: CONSTANTS.RESPONSE_MESSAGES.ERROR.NOT_FOUND
        });
      }

      const compatibleBloodTypes = recipient.getCompatibleBloodTypes();

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: 'Compatible blood types retrieved successfully',
        data: {
          recipientBloodType: recipient.bloodType,
          compatibleBloodTypes
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

  async getRecipientRequests(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10, status } = req.query;

      const validation = Validators.validateObjectId(id, 'Recipient ID');
      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validation.message
        });
      }

      const { page: pageNum, limit: limitNum, skip } = Helpers.paginate(page, limit);

      let query = { recipientId: id };
      if (status) query.status = status;

      const requests = await BloodRequest.find(query)
        .populate('hospitalId', 'name address.city')
        .populate('requestedBy', 'name')
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

  async getRecipientStats(req, res) {
    try {
      const { id } = req.params;

      const validation = Validators.validateObjectId(id, 'Recipient ID');
      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validation.message
        });
      }

      const recipient = await Recipient.findById(id);
      if (!recipient) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: CONSTANTS.RESPONSE_MESSAGES.ERROR.NOT_FOUND
        });
      }

      const bloodRequests = await BloodRequest.find({ recipientId: id });

      const stats = {
        personalInfo: {
          age: recipient.calculateAge(),
          bloodType: recipient.bloodType,
          medicalCondition: recipient.medicalCondition,
          isActive: recipient.isActive
        },
        transfusionStats: {
          totalTransfusions: recipient.transfusionHistory.length,
          totalUnitsReceived: recipient.transfusionHistory.reduce((sum, t) => sum + t.units, 0),
          lastTransfusion: recipient.transfusionHistory.length > 0 
            ? recipient.transfusionHistory[recipient.transfusionHistory.length - 1].date 
            : null,
          complicationsCount: recipient.transfusionHistory.filter(t => t.complications).length,
          bloodTypesReceived: [...new Set(recipient.transfusionHistory.map(t => t.bloodType))]
        },
        requestStats: {
          totalRequests: bloodRequests.length,
          pendingRequests: bloodRequests.filter(r => r.status === CONSTANTS.REQUEST_STATUS.PENDING).length,
          fulfilledRequests: bloodRequests.filter(r => r.status === CONSTANTS.REQUEST_STATUS.FULFILLED).length,
          urgentRequests: bloodRequests.filter(r => r.urgencyLevel === CONSTANTS.URGENCY_LEVELS.CRITICAL).length
        },
        healthMetrics: {
          allergiesCount: recipient.allergies.length,
          medicationsCount: recipient.currentMedications.length,
          yearsAsRecipient: Math.floor((new Date() - new Date(recipient.createdAt)) / (365 * 24 * 60 * 60 * 1000))
        }
      };

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: CONSTANTS.RESPONSE_MESSAGES.SUCCESS.RETRIEVED,
        data: { stats }
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async searchCompatibleRecipients(req, res) {
    try {
      const { bloodType } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const validation = Validators.validateBloodType(bloodType);
      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validation.message
        });
      }

      const { page: pageNum, limit: limitNum, skip } = Helpers.paginate(page, limit);

      // Get blood compatibility for the given blood type
      const compatibility = Helpers.getBloodCompatibility(bloodType);
      
      // Find recipients who can receive this blood type
      const recipients = await Recipient.find({
        bloodType: { $in: compatibility.canDonateTo },
        isActive: true
      })
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      const total = await Recipient.countDocuments({
        bloodType: { $in: compatibility.canDonateTo },
        isActive: true
      });

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: 'Compatible recipients retrieved successfully',
        data: {
          bloodType,
          recipients,
          compatibility: compatibility.canDonateTo,
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

  async deleteRecipient(req, res) {
    try {
      const { id } = req.params;

      const validation = Validators.validateObjectId(id, 'Recipient ID');
      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validation.message
        });
      }

      const recipient = await Recipient.findById(id);
      if (!recipient) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: CONSTANTS.RESPONSE_MESSAGES.ERROR.NOT_FOUND
        });
      }

      // Check if recipient has active blood requests
      const activeRequests = await BloodRequest.countDocuments({
        recipientId: id,
        status: { $in: [CONSTANTS.REQUEST_STATUS.PENDING, CONSTANTS.REQUEST_STATUS.APPROVED] }
      });

      if (activeRequests > 0) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Cannot delete recipient with active blood requests'
        });
      }

      // Deactivate user instead of deleting
      await User.findByIdAndUpdate(recipient.userId, { isActive: false });
      await Recipient.findByIdAndDelete(id);

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

module.exports = new RecipientController();