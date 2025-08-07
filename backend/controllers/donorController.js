const Donor = require('../models/Donor');
const User = require('../models/User');
const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');
const Validators = require('../utils/validators');
const Helpers = require('../utils/helpers');
const smsService = require('../utils/smsService');
const CONSTANTS = require('../utils/constants');

class DonorController {
  async getAllDonors(req, res) {
    try {
      const { page = 1, limit = 10, bloodType, search, isEligible } = req.query;
      const { page: pageNum, limit: limitNum, skip } = Helpers.paginate(page, limit);

      const query = Helpers.buildQuery({
        ...(bloodType && { bloodType }),
        ...(isEligible !== undefined && { isEligible: isEligible === 'true' }),
        ...(search && { search })
      });

      const donors = await Donor.find(query)
        .populate('userId', 'name email phone isActive')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      const total = await Donor.countDocuments(query);

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: CONSTANTS.RESPONSE_MESSAGES.SUCCESS.RETRIEVED,
        data: {
          donors,
          pagination: {
            current: pageNum,
            pages: Math.ceil(total / limitNum),
            total,
            limit: limitNum
          }
        }
      });

    } catch (error) {
      console.error('Error fetching donors:', error);
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async getDonorById(req, res) {
    try {
      const { id } = req.params;

      const validation = Validators.validateObjectId(id, 'Donor ID');
      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validation.message
        });
      }

      const donor = await Donor.findById(id)
        .populate('userId', 'name email phone isActive profileImage createdAt');

      if (!donor) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: CONSTANTS.RESPONSE_MESSAGES.ERROR.NOT_FOUND
        });
      }

      const donations = await Donation.find({ donorId: id })
        .populate('campaignId', 'title location')
        .populate('collectedBy', 'name')
        .sort({ donationDate: -1 })
        .limit(10);

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: CONSTANTS.RESPONSE_MESSAGES.SUCCESS.RETRIEVED,
        data: {
          donor,
          donations,
          eligibility: Helpers.checkDonorEligibility(donor)
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

  async updateDonor(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const validation = Validators.validateObjectId(id, 'Donor ID');
      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validation.message
        });
      }

      const donor = await Donor.findById(id);
      if (!donor) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: CONSTANTS.RESPONSE_MESSAGES.ERROR.NOT_FOUND
        });
      }

      if (updateData.bloodType) {
        const bloodTypeValidation = Validators.validateBloodType(updateData.bloodType);
        if (!bloodTypeValidation.isValid) {
          return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: bloodTypeValidation.message
          });
        }
      }

      if (updateData.weight) {
        const weightValidation = Validators.validateWeight(updateData.weight);
        if (!weightValidation.isValid) {
          return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: weightValidation.message
          });
        }
      }

      if (updateData.height) {
        const heightValidation = Validators.validateHeight(updateData.height);
        if (!heightValidation.isValid) {
          return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: heightValidation.message
          });
        }
      }

      const updatedDonor = await Donor.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).populate('userId', 'name email phone');

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: CONSTANTS.RESPONSE_MESSAGES.SUCCESS.UPDATED,
        data: { donor: updatedDonor }
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async checkEligibility(req, res) {
    try {
      const { id } = req.params;

      const validation = Validators.validateObjectId(id, 'Donor ID');
      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validation.message
        });
      }

      const donor = await Donor.findById(id).populate('userId', 'phone');
      if (!donor) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: CONSTANTS.RESPONSE_MESSAGES.ERROR.NOT_FOUND
        });
      }

      const eligibility = Helpers.checkDonorEligibility(donor);

      if (eligibility.isEligible !== donor.isEligible) {
        donor.isEligible = eligibility.isEligible;
        donor.eligibilityNotes = eligibility.issues.join(', ');
        donor.nextEligibleDate = eligibility.nextEligibleDate;
        await donor.save();

        if (donor.userId.phone) {
          await smsService.sendEligibilityUpdate(
            donor.userId.phone,
            eligibility.isEligible,
            eligibility.nextEligibleDate
          );
        }
      }

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: 'Eligibility checked successfully',
        data: {
          eligibility,
          donor: {
            _id: donor._id,
            isEligible: donor.isEligible,
            eligibilityNotes: donor.eligibilityNotes,
            nextEligibleDate: donor.nextEligibleDate
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

  async getDonorHistory(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const validation = Validators.validateObjectId(id, 'Donor ID');
      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validation.message
        });
      }

      const { page: pageNum, limit: limitNum, skip } = Helpers.paginate(page, limit);

      const donations = await Donation.find({ donorId: id })
        .populate('campaignId', 'title location.venue')
        .populate('collectedBy', 'name')
        .populate('inventoryId', 'status testResults')
        .sort({ donationDate: -1 })
        .skip(skip)
        .limit(limitNum);

      const total = await Donation.countDocuments({ donorId: id });

      const stats = {
        totalDonations: total,
        successfulDonations: donations.filter(d => d.isSuccessful()).length,
        lastDonation: donations.length > 0 ? donations[0].donationDate : null,
        totalUnitsCollected: donations.reduce((sum, d) => sum + d.unitsCollected, 0)
      };

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: CONSTANTS.RESPONSE_MESSAGES.SUCCESS.RETRIEVED,
        data: {
          donations,
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

  async getEligibleDonors(req, res) {
    try {
      const { bloodType, urgency = 'medium' } = req.query;

      let query = { isEligible: true };

      if (bloodType) {
        const compatibility = Helpers.getBloodCompatibility(bloodType);
        query.bloodType = { $in: compatibility.canReceiveFrom };
      }

      const donors = await Donor.find(query)
        .populate('userId', 'name email phone')
        .sort({ lastDonationDate: 1 });

      const prioritizedDonors = donors.filter(donor => {
        if (urgency === CONSTANTS.URGENCY_LEVELS.CRITICAL) {
          return donor.bloodType === bloodType || donor.bloodType === 'O-';
        }
        return true;
      });

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: 'Eligible donors retrieved successfully',
        data: {
          donors: prioritizedDonors,
          total: prioritizedDonors.length,
          bloodType,
          urgency
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

  async registerForCampaign(req, res) {
    try {
      const { donorId, campaignId, appointmentTime } = req.body;

      const validation = Validators.validateMultiple([
        Validators.validateObjectId(donorId, 'Donor ID'),
        Validators.validateObjectId(campaignId, 'Campaign ID')
      ]);

      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      const donor = await Donor.findById(donorId).populate('userId', 'name phone');
      if (!donor) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Donor not found'
        });
      }

      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Campaign not found'
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

      if (donor.userId.phone) {
        await smsService.sendCampaignInvitation(
          donor.userId.phone,
          campaign.title,
          Helpers.formatDate(campaign.startDate, 'DD/MM/YYYY'),
          campaign.location.venue
        );
      }

      res.status(CONSTANTS.HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Successfully registered for campaign',
        data: {
          campaignId,
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

  async getDonorCampaigns(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.query;

      const validation = Validators.validateObjectId(id, 'Donor ID');
      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validation.message
        });
      }

      let query = { 'registeredDonors.donorId': id };
      if (status) {
        query['registeredDonors.status'] = status;
      }

      const campaigns = await Campaign.find(query)
        .populate('organizer', 'name')
        .sort({ startDate: -1 });

      const donorCampaigns = campaigns.map(campaign => {
        const registration = campaign.registeredDonors.find(
          reg => reg.donorId.toString() === id
        );
        
        return {
          _id: campaign._id,
          title: campaign.title,
          description: campaign.description,
          startDate: campaign.startDate,
          endDate: campaign.endDate,
          location: campaign.location,
          status: campaign.status,
          organizer: campaign.organizer,
          registration: {
            registrationDate: registration.registrationDate,
            status: registration.status,
            appointmentTime: registration.appointmentTime
          }
        };
      });

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: CONSTANTS.RESPONSE_MESSAGES.SUCCESS.RETRIEVED,
        data: {
          campaigns: donorCampaigns,
          total: donorCampaigns.length
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

  async sendBulkNotification(req, res) {
    try {
      const { bloodType, message, urgency = 'medium' } = req.body;

      if (req.user.role !== CONSTANTS.USER_ROLES.ADMIN) {
        return res.status(CONSTANTS.HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: CONSTANTS.RESPONSE_MESSAGES.ERROR.FORBIDDEN
        });
      }

      const validation = Validators.validateMultiple([
        Validators.validateBloodType(bloodType),
        Validators.validateString(message, 'Message', 10, 160),
        Validators.validateUrgencyLevel(urgency)
      ]);

      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      const compatibility = Helpers.getBloodCompatibility(bloodType);
      const donors = await Donor.find({
        bloodType: { $in: compatibility.canReceiveFrom },
        isEligible: true
      }).populate('userId', 'phone name');

      const phoneNumbers = donors
        .filter(donor => donor.userId.phone)
        .map(donor => donor.userId.phone);

      if (phoneNumbers.length === 0) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'No eligible donors found with phone numbers'
        });
      }

      const smsResults = await smsService.sendBulkSMS(phoneNumbers, message);

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: 'Bulk notification sent successfully',
        data: {
          bloodType,
          totalDonors: donors.length,
          notificationsSent: smsResults.successful,
          notificationsFailed: smsResults.failed,
          results: smsResults.results
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

  async getDonorStats(req, res) {
    try {
      const { id } = req.params;

      const validation = Validators.validateObjectId(id, 'Donor ID');
      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validation.message
        });
      }

      const donor = await Donor.findById(id);
      if (!donor) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: CONSTANTS.RESPONSE_MESSAGES.ERROR.NOT_FOUND
        });
      }

      const donations = await Donation.find({ donorId: id });
      const campaigns = await Campaign.find({ 'registeredDonors.donorId': id });

      const stats = {
        personalInfo: {
          age: Helpers.calculateAge(donor.dateOfBirth),
          bloodType: donor.bloodType,
          weight: donor.weight,
          isEligible: donor.isEligible
        },
        donationStats: {
          totalDonations: donations.length,
          successfulDonations: donations.filter(d => d.isSuccessful()).length,
          totalUnitsContributed: donations.reduce((sum, d) => sum + d.unitsCollected, 0),
          lastDonationDate: donor.lastDonationDate,
          nextEligibleDate: donor.nextEligibleDate
        },
        campaignStats: {
          totalCampaigns: campaigns.length,
          activeCampaigns: campaigns.filter(c => c.status === CONSTANTS.CAMPAIGN_STATUS.ACTIVE).length,
          completedCampaigns: campaigns.filter(c => c.status === CONSTANTS.CAMPAIGN_STATUS.COMPLETED).length
        },
        impactStats: {
          livesSaved: Math.floor(donations.length * 3), // Approximate: 1 donation = 3 lives
          contributionRank: 'Gold', // This could be calculated based on donation frequency
          yearsContributing: Math.floor((new Date() - new Date(donor.createdAt)) / (365 * 24 * 60 * 60 * 1000))
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

  async deleteDonor(req, res) {
    try {
      const { id } = req.params;

      if (req.user.role !== CONSTANTS.USER_ROLES.ADMIN) {
        return res.status(CONSTANTS.HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: CONSTANTS.RESPONSE_MESSAGES.ERROR.FORBIDDEN
        });
      }

      const validation = Validators.validateObjectId(id, 'Donor ID');
      if (!validation.isValid) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validation.message
        });
      }

      const donor = await Donor.findById(id);
      if (!donor) {
        return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: CONSTANTS.RESPONSE_MESSAGES.ERROR.NOT_FOUND
        });
      }

      // Check if donor has active donations or campaigns
      const activeDonations = await Donation.countDocuments({ 
        donorId: id, 
        status: { $in: [CONSTANTS.DONATION_STATUS.COLLECTED, CONSTANTS.DONATION_STATUS.TESTED] }
      });

      if (activeDonations > 0) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Cannot delete donor with active donations'
        });
      }

      // Deactivate user instead of deleting
      await User.findByIdAndUpdate(donor.userId, { isActive: false });
      await Donor.findByIdAndDelete(id);

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

module.exports = new DonorController();