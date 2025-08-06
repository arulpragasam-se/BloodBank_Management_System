const Donor = require('../models/Donor');
const BloodInventory = require('../models/BloodInventory');
const Campaign = require('../models/Campaign');
const BloodRequest = require('../models/BloodRequest');
const Donation = require('../models/Donation');
const Hospital = require('../models/Hospital');
const Validators = require('../utils/validators');
const Helpers = require('../utils/helpers');
const CONSTANTS = require('../utils/constants');

class ReportController {
  async generateDonorReport(req, res) {
    try {
      const { from, to, bloodType, format = 'json', includeInactive } = req.query;

      let dateFilter = {};
      if (from || to) {
        dateFilter.createdAt = {};
        if (from) dateFilter.createdAt.$gte = new Date(from);
        if (to) dateFilter.createdAt.$lte = new Date(to);
      }

      let query = { ...dateFilter };
      if (bloodType) query.bloodType = bloodType;

      const donors = await Donor.find(query)
        .populate('userId', 'name email phone isActive createdAt')
        .sort({ createdAt: -1 });

      const filteredDonors = includeInactive === 'true' 
        ? donors 
        : donors.filter(d => d.userId?.isActive !== false);

      const totalDonors = filteredDonors.length;
      const activeDonors = filteredDonors.filter(d => d.userId?.isActive !== false).length;
      const eligibleDonors = filteredDonors.filter(d => d.isEligible).length;

      const bloodTypeDistribution = {};
      CONSTANTS.BLOOD_TYPES.forEach(type => {
        bloodTypeDistribution[type] = filteredDonors.filter(d => d.bloodType === type).length;
      });

      const ageGroups = {
        '18-25': 0,
        '26-35': 0,
        '36-45': 0,
        '46-55': 0,
        '56-65': 0
      };

      filteredDonors.forEach(donor => {
        const age = Helpers.calculateAge(donor.dateOfBirth);
        if (age >= 18 && age <= 25) ageGroups['18-25']++;
        else if (age >= 26 && age <= 35) ageGroups['26-35']++;
        else if (age >= 36 && age <= 45) ageGroups['36-45']++;
        else if (age >= 46 && age <= 55) ageGroups['46-55']++;
        else if (age >= 56 && age <= 65) ageGroups['56-65']++;
      });

      const report = Helpers.generateReport({
        totalDonors,
        activeDonors,
        eligibleDonors,
        details: filteredDonors,
        from,
        to
      }, 'donor_report');

      report.summary.bloodTypeDistribution = bloodTypeDistribution;
      report.summary.ageGroups = ageGroups;

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: 'Donor report generated successfully',
        data: { report }
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async generateInventoryReport(req, res) {
    try {
      const { bloodType, status, format = 'json', includeExpired } = req.query;

      let query = {};
      if (bloodType) query.bloodType = bloodType;
      if (status) query.status = status;
      if (includeExpired !== 'true') {
        query.status = { $ne: CONSTANTS.BLOOD_STATUS.EXPIRED };
      }

      const inventory = await BloodInventory.find(query)
        .populate('donorId', 'bloodType')
        .sort({ expiryDate: 1 });

      const stats = Helpers.calculateInventoryStats(inventory);

      const expiryAnalysis = {
        expired: inventory.filter(item => item.isExpired()).length,
        expiringIn7Days: inventory.filter(item => {
          const days = Helpers.getDaysUntilExpiry(item.expiryDate);
          return days > 0 && days <= 7;
        }).length,
        expiringIn30Days: inventory.filter(item => {
          const days = Helpers.getDaysUntilExpiry(item.expiryDate);
          return days > 7 && days <= 30;
        }).length
      };

      const testResultsAnalysis = {
        pending: inventory.filter(item => !item.isTestsComplete()).length,
        passed: inventory.filter(item => item.isTestsPassed()).length,
        failed: inventory.filter(item => item.isTestsComplete() && !item.isTestsPassed()).length
      };

      const report = Helpers.generateReport({
        details: inventory,
        from: req.query.from,
        to: req.query.to
      }, 'inventory_report');

      report.summary = {
        ...stats,
        expiryAnalysis,
        testResultsAnalysis
      };

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: 'Inventory report generated successfully',
        data: { report }
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async generateCampaignReport(req, res) {
    try {
      const { from, to, status, organizer, format = 'json' } = req.query;

      let dateFilter = {};
      if (from || to) {
        dateFilter.startDate = {};
        if (from) dateFilter.startDate.$gte = new Date(from);
        if (to) dateFilter.startDate.$lte = new Date(to);
      }

      let query = { ...dateFilter };
      if (status) query.status = status;
      if (organizer) query.organizer = organizer;

      const campaigns = await Campaign.find(query)
        .populate('organizer', 'name email')
        .sort({ startDate: -1 });

      const totalCampaigns = campaigns.length;
      const activeCampaigns = campaigns.filter(c => c.status === CONSTANTS.CAMPAIGN_STATUS.ACTIVE).length;
      const completedCampaigns = campaigns.filter(c => c.status === CONSTANTS.CAMPAIGN_STATUS.COMPLETED).length;

      let totalParticipants = 0;
      let successfulDonations = 0;

      campaigns.forEach(campaign => {
        totalParticipants += campaign.getRegisteredCount();
        successfulDonations += campaign.getDonatedCount();
      });

      const performanceMetrics = {
        averageParticipation: totalCampaigns > 0 ? (totalParticipants / totalCampaigns).toFixed(2) : 0,
        averageDonationRate: totalParticipants > 0 ? ((successfulDonations / totalParticipants) * 100).toFixed(2) : 0,
        mostSuccessfulCampaign: campaigns.reduce((best, current) => 
          current.getDonatedCount() > (best?.getDonatedCount() || 0) ? current : best, null
        )
      };

      const report = Helpers.generateReport({
        totalCampaigns,
        activeCampaigns,
        totalParticipants,
        successfulDonations,
        details: campaigns,
        from,
        to
      }, 'campaign_report');

      report.summary.performanceMetrics = performanceMetrics;

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: 'Campaign report generated successfully',
        data: { report }
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async generateRequestsReport(req, res) {
    try {
      const { from, to, status, urgency, hospitalId, format = 'json' } = req.query;

      let dateFilter = {};
      if (from || to) {
        dateFilter.createdAt = {};
        if (from) dateFilter.createdAt.$gte = new Date(from);
        if (to) dateFilter.createdAt.$lte = new Date(to);
      }

      let query = { ...dateFilter };
      if (status) query.status = status;
      if (urgency) query.urgencyLevel = urgency;
      if (hospitalId) query.hospitalId = hospitalId;

      const requests = await BloodRequest.find(query)
        .populate('hospitalId', 'name address.city')
        .populate('requestedBy', 'name')
        .populate('recipientId', 'bloodType')
        .sort({ createdAt: -1 });

      const totalRequests = requests.length;
      const fulfilledRequests = requests.filter(r => r.status === CONSTANTS.REQUEST_STATUS.FULFILLED).length;
      const urgentRequests = requests.filter(r => r.urgencyLevel === CONSTANTS.URGENCY_LEVELS.CRITICAL).length;

      const responseTimeAnalysis = {
        averageResponseTime: this.calculateAverageResponseTime(requests),
        urgentRequestsResponseTime: this.calculateAverageResponseTime(
          requests.filter(r => r.urgencyLevel === CONSTANTS.URGENCY_LEVELS.CRITICAL)
        )
      };

      const bloodTypeDistribution = {};
      CONSTANTS.BLOOD_TYPES.forEach(type => {
        const typeRequests = requests.filter(r => r.bloodType === type);
        bloodTypeDistribution[type] = {
          count: typeRequests.length,
          totalUnits: typeRequests.reduce((sum, r) => sum + r.unitsRequired, 0),
          fulfilled: typeRequests.filter(r => r.status === CONSTANTS.REQUEST_STATUS.FULFILLED).length
        };
      });

      const report = {
        generatedAt: new Date(),
        type: 'blood_requests_report',
        period: { from, to },
        summary: {
          totalRequests,
          fulfilledRequests,
          urgentRequests,
          fulfillmentRate: totalRequests > 0 ? ((fulfilledRequests / totalRequests) * 100).toFixed(2) : 0,
          responseTimeAnalysis,
          bloodTypeDistribution
        },
        details: requests
      };

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: 'Blood requests report generated successfully',
        data: { report }
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async generateDonationsReport(req, res) {
    try {
      const { from, to, donorId, campaignId, bloodType, status, format = 'json' } = req.query;

      let dateFilter = {};
      if (from || to) {
        dateFilter.donationDate = {};
        if (from) dateFilter.donationDate.$gte = new Date(from);
        if (to) dateFilter.donationDate.$lte = new Date(to);
      }

      let query = { ...dateFilter };
      if (donorId) query.donorId = donorId;
      if (campaignId) query.campaignId = campaignId;
      if (bloodType) query.bloodType = bloodType;
      if (status) query.status = status;

      const donations = await Donation.find(query)
        .populate('donorId')
        .populate('campaignId', 'title location.venue')
        .populate('collectedBy', 'name')
        .sort({ donationDate: -1 });

      const totalDonations = donations.length;
      const successfulDonations = donations.filter(d => d.isSuccessful()).length;
      const totalUnitsCollected = donations.reduce((sum, d) => sum + d.unitsCollected, 0);

      const bloodTypeBreakdown = {};
      CONSTANTS.BLOOD_TYPES.forEach(type => {
        const typeDonations = donations.filter(d => d.bloodType === type);
        bloodTypeBreakdown[type] = {
          count: typeDonations.length,
          units: typeDonations.reduce((sum, d) => sum + d.unitsCollected, 0)
        };
      });

      const monthlyTrends = this.calculateMonthlyTrends(donations);

      const report = {
        generatedAt: new Date(),
        type: 'donations_report',
        period: { from, to },
        summary: {
          totalDonations,
          successfulDonations,
          totalUnitsCollected,
          successRate: totalDonations > 0 ? ((successfulDonations / totalDonations) * 100).toFixed(2) : 0,
          averageUnitsPerDonation: totalDonations > 0 ? (totalUnitsCollected / totalDonations).toFixed(2) : 0,
          bloodTypeBreakdown,
          monthlyTrends
        },
        details: donations
      };

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: 'Donations report generated successfully',
        data: { report }
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async generateMonthlySummary(req, res) {
    try {
      const { year, month, format = 'json' } = req.query;

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const [donors, inventory, campaigns, requests, donations] = await Promise.all([
        Donor.find({ createdAt: { $gte: startDate, $lte: endDate } }),
        BloodInventory.find({ collectionDate: { $gte: startDate, $lte: endDate } }),
        Campaign.find({ startDate: { $gte: startDate, $lte: endDate } }),
        BloodRequest.find({ createdAt: { $gte: startDate, $lte: endDate } }),
        Donation.find({ donationDate: { $gte: startDate, $lte: endDate } })
      ]);

      const summary = {
        period: {
          year: parseInt(year),
          month: parseInt(month),
          monthName: new Date(year, month - 1).toLocaleString('default', { month: 'long' })
        },
        newDonors: donors.length,
        bloodCollected: inventory.reduce((sum, item) => sum + item.units, 0),
        campaignsHeld: campaigns.length,
        bloodRequestsFulfilled: requests.filter(r => r.status === CONSTANTS.REQUEST_STATUS.FULFILLED).length,
        totalDonations: donations.length,
        topPerformers: {
          mostActiveDonor: await this.getMostActiveDonor(startDate, endDate),
          bestCampaign: campaigns.reduce((best, current) => 
            current.getDonatedCount() > (best?.getDonatedCount() || 0) ? current : best, null
          )
        }
      };

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: 'Monthly summary generated successfully',
        data: { summary }
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async generateAnnualReport(req, res) {
    try {
      const { year, format = 'json' } = req.query;

      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);

      const [donors, inventory, campaigns, requests, donations] = await Promise.all([
        Donor.find({ createdAt: { $gte: startDate, $lte: endDate } }),
        BloodInventory.find({ collectionDate: { $gte: startDate, $lte: endDate } }),
        Campaign.find({ startDate: { $gte: startDate, $lte: endDate } }),
        BloodRequest.find({ createdAt: { $gte: startDate, $lte: endDate } }),
        Donation.find({ donationDate: { $gte: startDate, $lte: endDate } })
      ]);

      const quarterlyBreakdown = await this.getQuarterlyBreakdown(year);
      const yearOverYearComparison = await this.getYearOverYearComparison(year);

      const annualSummary = {
        year: parseInt(year),
        overview: {
          totalNewDonors: donors.length,
          totalBloodCollected: inventory.reduce((sum, item) => sum + item.units, 0),
          totalCampaigns: campaigns.length,
          totalRequests: requests.length,
          totalDonations: donations.length
        },
        quarterlyBreakdown,
        yearOverYearComparison,
        achievements: await this.getAnnualAchievements(year)
      };

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: 'Annual report generated successfully',
        data: { annualSummary }
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  async generateCustomReport(req, res) {
    try {
      const { title, description, criteria, format = 'json' } = req.body;

      // Build query based on custom criteria
      const query = this.buildCustomQuery(criteria);

      const results = await this.executeCustomQuery(query, criteria);

      const customReport = {
        generatedAt: new Date(),
        title: Helpers.sanitizeInput(title),
        description: Helpers.sanitizeInput(description || ''),
        criteria,
        results,
        summary: this.generateCustomSummary(results, criteria)
      };

      res.status(CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        message: 'Custom report generated successfully',
        data: { report: customReport }
      });

    } catch (error) {
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CONSTANTS.RESPONSE_MESSAGES.ERROR.INTERNAL_ERROR,
        error: error.message
      });
    }
  }

  // Helper methods
  calculateAverageResponseTime(requests) {
    if (requests.length === 0) return 0;
    
    const responseTimes = requests
      .filter(r => r.processedAt)
      .map(r => (new Date(r.processedAt) - new Date(r.createdAt)) / (1000 * 60 * 60)); // hours
    
    return responseTimes.length > 0 
      ? (responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length).toFixed(2)
      : 0;
  }

  calculateMonthlyTrends(donations) {
    const trends = {};
    donations.forEach(donation => {
      const monthKey = new Date(donation.donationDate).toISOString().slice(0, 7);
      if (!trends[monthKey]) {
        trends[monthKey] = { count: 0, units: 0 };
      }
      trends[monthKey].count++;
      trends[monthKey].units += donation.unitsCollected;
    });
    return trends;
  }

  async getMostActiveDonor(startDate, endDate) {
    const donations = await Donation.find({
      donationDate: { $gte: startDate, $lte: endDate }
    }).populate('donorId');

    const donorCounts = {};
    donations.forEach(donation => {
      const donorId = donation.donorId._id.toString();
      donorCounts[donorId] = (donorCounts[donorId] || 0) + 1;
    });

    const mostActiveDonorId = Object.keys(donorCounts).reduce((a, b) => 
      donorCounts[a] > donorCounts[b] ? a : b, null
    );

    return mostActiveDonorId ? donations.find(d => d.donorId._id.toString() === mostActiveDonorId)?.donorId : null;
  }

  async getQuarterlyBreakdown(year) {
    const quarters = [
      { q: 1, start: new Date(year, 0, 1), end: new Date(year, 2, 31) },
      { q: 2, start: new Date(year, 3, 1), end: new Date(year, 5, 30) },
      { q: 3, start: new Date(year, 6, 1), end: new Date(year, 8, 30) },
      { q: 4, start: new Date(year, 9, 1), end: new Date(year, 11, 31) }
    ];

    const breakdown = {};
    for (const quarter of quarters) {
      const donations = await Donation.countDocuments({
        donationDate: { $gte: quarter.start, $lte: quarter.end }
      });
      breakdown[`Q${quarter.q}`] = donations;
    }

    return breakdown;
  }

  async getYearOverYearComparison(currentYear) {
    const previousYear = currentYear - 1;
    
    const [currentYearData, previousYearData] = await Promise.all([
      this.getYearData(currentYear),
      this.getYearData(previousYear)
    ]);

    return {
      current: currentYearData,
      previous: previousYearData,
      growth: {
        donors: this.calculateGrowthRate(previousYearData.donors, currentYearData.donors),
        donations: this.calculateGrowthRate(previousYearData.donations, currentYearData.donations),
        campaigns: this.calculateGrowthRate(previousYearData.campaigns, currentYearData.campaigns)
      }
    };
  }

  async getYearData(year) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const [donors, donations, campaigns] = await Promise.all([
      Donor.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
      Donation.countDocuments({ donationDate: { $gte: startDate, $lte: endDate } }),
      Campaign.countDocuments({ startDate: { $gte: startDate, $lte: endDate } })
    ]);

    return { donors, donations, campaigns };
  }

  calculateGrowthRate(previous, current) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return (((current - previous) / previous) * 100).toFixed(2);
  }

  async getAnnualAchievements(year) {
    // Define achievements based on milestones
    const achievements = [];
    
    const totalDonations = await Donation.countDocuments({
      donationDate: { 
        $gte: new Date(year, 0, 1), 
        $lte: new Date(year, 11, 31) 
      }
    });

    if (totalDonations >= 1000) achievements.push('1000+ Donations Milestone');
    if (totalDonations >= 500) achievements.push('500+ Donations Achievement');

    return achievements;
  }

  buildCustomQuery(criteria) {
    // Implementation for building custom queries based on criteria
    return {};
  }

  async executeCustomQuery(query, criteria) {
    // Implementation for executing custom queries
    return [];
  }

  generateCustomSummary(results, criteria) {
    // Implementation for generating custom summaries
    return {};
  }
}

module.exports = new ReportController();