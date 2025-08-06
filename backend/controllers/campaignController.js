const Campaign = require('../models/Campaign');
const Donor = require('../models/Donor');
const Donation = require('../models/Donation');
const Validators = require('../utils/validators');
const Helpers = require('../utils/helpers');
const smsService = require('../utils/smsService');
const emailService = require('../utils/emailService');
const CONSTANTS = require('../utils/constants');

class CampaignController {
  async createCampaign(req, res) {
    try {
      const {
        title,
        description,
        startDate,
        endDate,
        location,
        targetBloodTypes,
        targetDonors,
        isPublic
      } = req.body;

      const validation = Validators.validateMultiple([
        Validators.validateString(title, 'Title', 5, 100),
        Validators.validateString(description, 'Description', 10, 500),
        Validators.validateFutureDate(startDate, 'Start date'),
        Validators.validateDateRange(startDate, endDate)
      ]);

      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      if (!location || !location.venue || !location.address) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Complete location information is required'
        });
      }

      if (targetBloodTypes && targetBloodTypes.length > 0) {
        const invalidBloodTypes = targetBloodTypes.filter(type => 
          !CONSTANTS.BLOOD_TYPES.includes(type)
        );

        if (invalidBloodTypes.length > 0) {
          return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: `Invalid blood types: ${invalidBloodTypes.join(', ')}`
          });
        }
      }

      const businessRules = Helpers.validateBusinessRules('campaign_scheduling', {
        startDate
      });

      if (!businessRules.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Business rule validation failed',
          errors: businessRules.violations
        });
      }

      const campaignData = {
        title: Helpers.sanitizeInput(title),
        description: Helpers.sanitizeInput(description),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location: {
          venue: Helpers.sanitizeInput(location.venue),
          address: Helpers.sanitizeInput(location.address),
          city: Helpers.sanitizeInput(location.city),
          district: Helpers.sanitizeInput(location.district)
        },
        organizer: req.user.userId,
        targetBloodTypes: targetBloodTypes || [],
        targetDonors: targetDonors || 0,
        isPublic: isPublic !== false
      };

      const campaign = new Campaign(campaignData);
      await campaign.save();

      res.status(CONSTANTS.HTTP_STATUS.CREATED).json({
        success: true,
        message: CONSTANTS.RESPONSE_MESSAGES.SUCCESS.CREATED,
        data: { campaign }
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async getAllCampaigns(req, res) {
    try {
      const { page = 1, limit = 10, status, bloodType, search, upcoming } = req.query;
      const { page: pageNum, limit: limitNum, skip } = Helpers.paginate(page, limit);

      let query = Helpers.buildQuery({
        ...(status && { status }),
        ...(bloodType && { targetBloodTypes: bloodType }),
        ...(search && { search })
      });

      if (upcoming === 'true') {
        query.startDate = { $gte: new Date() };
        query.status = { $in: [CONSTANTS.CAMPAIGN_STATUS.PLANNED, CONSTANTS.CAMPAIGN_STATUS.ACTIVE] };
      }

      const campaigns = await Campaign.find(query)
        .populate('organizer', 'name email')
        .sort({ startDate: -1 })
        .skip(skip)
        .limit(limitNum);

      const total = await Campaign.countDocuments(query);

      const campaignsWithStats = campaigns.map(campaign => ({
        ...campaign.toObject(),
        registeredCount: campaign.getRegisteredCount(),
        donatedCount: campaign.getDonatedCount(),
        isActive: campaign.isActive()
      }));

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: CONSTANTS.RESPONSE_MESSAGES.SUCCESS.RETRIEVED,
        data: {
          campaigns: campaignsWithStats,
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

  async getCampaignById(req, res) {
    try {
      const { id } = req.params;

      const validation = Validators.validateObjectId(id, 'Campaign ID');
      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validation.message
        });
      }

      const campaign = await Campaign.findById(id)
        .populate('organizer', 'name email phone')
        .populate({
          path: 'registeredDonors.donorId',
          populate: {
            path: 'userId',
            select: 'name phone email'
          }
        });

      if (!campaign) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: CONSTANTS.RESPONSE_MESSAGES.ERROR.NOT_FOUND
        });
      }

      const donations = await Donation.find({ campaignId: id })
        .populate('donorId')
        .populate('collectedBy', 'name');

      const stats = {
        registeredCount: campaign.getRegisteredCount(),
        donatedCount: campaign.getDonatedCount(),
        attendanceRate: campaign.registeredDonors.length > 0 
          ? (campaign.registeredDonors.filter(d => d.status === CONSTANTS.DONOR_STATUS.ATTENDED).length / campaign.registeredDonors.length * 100).toFixed(2)
          : 0,
        donationRate: campaign.registeredDonors.length > 0
          ? (campaign.getDonatedCount() / campaign.registeredDonors.length * 100).toFixed(2)
          : 0,
        totalUnitsCollected: donations.reduce((sum, d) => sum + d.unitsCollected, 0)
      };

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: CONSTANTS.RESPONSE_MESSAGES.SUCCESS.RETRIEVED,
        data: {
          campaign: {
            ...campaign.toObject(),
            isActive: campaign.isActive()
          },
          donations,
          stats
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

  async updateCampaign(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const validation = Validators.validateObjectId(id, 'Campaign ID');
      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validation.message
        });
      }

      const campaign = await Campaign.findById(id);
      if (!campaign) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: CONSTANTS.RESPONSE_MESSAGES.ERROR.NOT_FOUND
        });
      }

      // Check if user is organizer or admin
      if (campaign.organizer.toString() !== req.user.userId && req.user.role !== CONSTANTS.USER_ROLES.ADMIN) {
        return res.status(CONSTANTS.HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: CONSTANTS.RESPONSE_MESSAGES.ERROR.FORBIDDEN
        });
      }

      // Validate date updates
      if (updateData.startDate || updateData.endDate) {
        const startDate = updateData.startDate || campaign.startDate;
        const endDate = updateData.endDate || campaign.endDate;

        const dateValidation = Validators.validateDateRange(startDate, endDate);
        if (!dateValidation.isValid) {
          return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: dateValidation.message
          });
        }
      }

      // Validate blood types
      if (updateData.targetBloodTypes) {
        const invalidBloodTypes = updateData.targetBloodTypes.filter(type => 
          !CONSTANTS.BLOOD_TYPES.includes(type)
        );

        if (invalidBloodTypes.length > 0) {
          return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: `Invalid blood types: ${invalidBloodTypes.join(', ')}`
          });
        }
      }

      const updatedCampaign = await Campaign.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).populate('organizer', 'name email');

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: CONSTANTS.RESPONSE_MESSAGES.SUCCESS.UPDATED,
        data: { campaign: updatedCampaign }
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async registerDonor(req, res) {
    try {
      const { id } = req.params;
      const { donorId, appointmentTime } = req.body;

      const validation = Validators.validateMultiple([
        Validators.validateObjectId(id, 'Campaign ID'),
        Validators.validateObjectId(donorId, 'Donor ID')
      ]);

      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      const campaign = await Campaign.findById(id);
      if (!campaign) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Campaign not found'
        });
      }

      const donor = await Donor.findById(donorId).populate('userId', 'name phone email');
      if (!donor) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Donor not found'
        });
      }

      if (!donor.isEligible) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Donor is not eligible for donation'
        });
      }

      const existingRegistration = campaign.registeredDonors.find(
        reg => reg.donorId.toString() === donorId
      );

      if (existingRegistration) {
        return res.status(CONSTANTS.HTTP_STATUS.CONFLICT).json({
          success: false,
          message: 'Donor already registered for this campaign'
        });
      }

      campaign.registeredDonors.push({
        donorId,
        appointmentTime: appointmentTime ? new Date(appointmentTime) : null,
        status: CONSTANTS.DONOR_STATUS.REGISTERED
      });

      await campaign.save();

      // Send notifications
      if (donor.userId.phone) {
        await smsService.sendCampaignInvitation(
          donor.userId.phone,
          campaign.title,
          Helpers.formatDate(campaign.startDate, 'DD/MM/YYYY'),
          campaign.location.venue
        );
      }

      if (donor.userId.email) {
        await emailService.sendCampaignInvitation(
          donor.userId.email,
          donor.userId.name,
          campaign.title,
          Helpers.formatDate(campaign.startDate, 'DD/MM/YYYY HH:mm'),
          campaign.location.venue,
          campaign.description
        );
      }

      res.status(CONSTANTS.HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Donor registered for campaign successfully',
        data: {
          campaignId: id,
          donorId,
          appointmentTime,
          status: CONSTANTS.DONOR_STATUS.REGISTERED
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

  async updateDonorStatus(req, res) {
    try {
      const { id, donorId } = req.params;
      const { status, notes } = req.body;

      const validation = Validators.validateMultiple([
        Validators.validateObjectId(id, 'Campaign ID'),
        Validators.validateObjectId(donorId, 'Donor ID')
      ]);

      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      if (!Object.values(CONSTANTS.DONOR_STATUS).includes(status)) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Invalid donor status'
        });
      }

      const campaign = await Campaign.findById(id);
      if (!campaign) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Campaign not found'
        });
      }

      const donorRegistration = campaign.registeredDonors.find(
        reg => reg.donorId.toString() === donorId
      );

      if (!donorRegistration) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Donor not registered for this campaign'
        });
      }

      donorRegistration.status = status;
      if (notes) donorRegistration.notes = notes;

      await campaign.save();

      // Update campaign results if donor donated
      if (status === CONSTANTS.DONOR_STATUS.DONATED) {
        campaign.results.successfulDonations += 1;
        await campaign.save();
      }

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: 'Donor status updated successfully',
        data: {
          campaignId: id,
          donorId,
          status,
          notes
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

  async sendCampaignReminders(req, res) {
    try {
      const { id } = req.params;

      const validation = Validators.validateObjectId(id, 'Campaign ID');
      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validation.message
        });
      }

      const campaign = await Campaign.findById(id)
        .populate({
          path: 'registeredDonors.donorId',
          populate: {
            path: 'userId',
            select: 'name phone email'
          }
        });

      if (!campaign) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: CONSTANTS.RESPONSE_MESSAGES.ERROR.NOT_FOUND
        });
      }

      const confirmedDonors = campaign.registeredDonors.filter(
        reg => reg.status === CONSTANTS.DONOR_STATUS.CONFIRMED || 
               reg.status === CONSTANTS.DONOR_STATUS.REGISTERED
      );

      let smsSent = 0;
      let emailsSent = 0;

      for (const registration of confirmedDonors) {
        const donor = registration.donorId;
        
        if (donor.userId.phone) {
          const appointmentDate = registration.appointmentTime 
            ? Helpers.formatDate(registration.appointmentTime, 'DD/MM/YYYY HH:mm')
            : Helpers.formatDate(campaign.startDate, 'DD/MM/YYYY');
            
          await smsService.sendAppointmentReminder(
            donor.userId.phone,
            appointmentDate,
            campaign.location.venue
          );
          smsSent++;
        }

        if (donor.userId.email) {
          const appointmentDate = registration.appointmentTime 
            ? Helpers.formatDate(registration.appointmentTime, 'DD/MM/YYYY HH:mm')
            : Helpers.formatDate(campaign.startDate, 'DD/MM/YYYY HH:mm');
            
          await emailService.sendAppointmentConfirmation(
            donor.userId.email,
            donor.userId.name,
            appointmentDate,
            campaign.location.venue,
            campaign.title
          );
          emailsSent++;
        }
      }

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: 'Campaign reminders sent successfully',
        data: {
          campaignId: id,
          donorsContacted: confirmedDonors.length,
          smsSent,
          emailsSent
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

  async getCampaignStats(req, res) {
    try {
      const { id } = req.params;

      const validation = Validators.validateObjectId(id, 'Campaign ID');
      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validation.message
        });
      }

      const campaign = await Campaign.findById(id);
      if (!campaign) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: CONSTANTS.RESPONSE_MESSAGES.ERROR.NOT_FOUND
        });
      }

      const donations = await Donation.find({ campaignId: id });

      const stats = {
        campaign: {
          title: campaign.title,
          status: campaign.status,
          startDate: campaign.startDate,
          endDate: campaign.endDate,
          targetDonors: campaign.targetDonors
        },
        registration: {
          totalRegistered: campaign.registeredDonors.length,
          confirmed: campaign.registeredDonors.filter(d => d.status === CONSTANTS.DONOR_STATUS.CONFIRMED).length,
          attended: campaign.registeredDonors.filter(d => d.status === CONSTANTS.DONOR_STATUS.ATTENDED).length,
          donated: campaign.registeredDonors.filter(d => d.status === CONSTANTS.DONOR_STATUS.DONATED).length,
          cancelled: campaign.registeredDonors.filter(d => d.status === CONSTANTS.DONOR_STATUS.CANCELLED).length
        },
        donations: {
          totalDonations: donations.length,
          successfulDonations: donations.filter(d => d.isSuccessful()).length,
          totalUnitsCollected: donations.reduce((sum, d) => sum + d.unitsCollected, 0),
          unitsCollectedByType: {}
        },
        performance: {
          registrationRate: campaign.targetDonors > 0 
            ? (campaign.registeredDonors.length / campaign.targetDonors * 100).toFixed(2)
            : 0,
          attendanceRate: campaign.registeredDonors.length > 0
            ? (campaign.registeredDonors.filter(d => d.status === CONSTANTS.DONOR_STATUS.ATTENDED).length / campaign.registeredDonors.length * 100).toFixed(2)
            : 0,
          donationRate: campaign.registeredDonors.length > 0
            ? (campaign.getDonatedCount() / campaign.registeredDonors.length * 100).toFixed(2)
            : 0
        }
      };

      // Calculate units by blood type
      CONSTANTS.BLOOD_TYPES.forEach(bloodType => {
        stats.donations.unitsCollectedByType[bloodType] = donations
          .filter(d => d.bloodType === bloodType)
          .reduce((sum, d) => sum + d.unitsCollected, 0);
      });

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

  async deleteCampaign(req, res) {
    try {
      const { id } = req.params;

      if (req.user.role !== CONSTANTS.USER_ROLES.ADMIN) {
        return res.status(CONSTANTS.HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: CONSTANTS.RESPONSE_MESSAGES.ERROR.FORBIDDEN
        });
      }

      const validation = Validators.validateObjectId(id, 'Campaign ID');
      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validation.message
        });
      }

      const campaign = await Campaign.findById(id);
      if (!campaign) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: CONSTANTS.RESPONSE_MESSAGES.ERROR.NOT_FOUND
        });
      }

      // Check if campaign has donations
      const donationsCount = await Donation.countDocuments({ campaignId: id });
      if (donationsCount > 0) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Cannot delete campaign with existing donations. Consider marking as cancelled instead.'
        });
      }

      await Campaign.findByIdAndDelete(id);

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

module.exports = new CampaignController();