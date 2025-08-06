// controllers/bloodRequestController.js
const BloodRequest = require('../models/BloodRequest');
const BloodInventory = require('../models/BloodInventory');
const Hospital = require('../models/Hospital');
const Recipient = require('../models/Recipient');
const { validationResult } = require('express-validator');
const { BLOOD_TYPES } = require('../utils/constants');

class BloodRequestController {

  async getAllRequests(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { 
        page = 1, 
        limit = 10, 
        status, 
        urgency, 
        bloodType, 
        hospitalId, 
        search 
      } = req.query;
      
      // Build filter object
      const filter = {};
      
      if (status) {
        filter.status = Array.isArray(status) ? { $in: status } : status;
      }
      
      if (urgency) {
        filter.urgency = Array.isArray(urgency) ? { $in: urgency } : urgency;
      }
      
      if (bloodType && BLOOD_TYPES.includes(bloodType)) {
        filter.bloodType = bloodType;
      }
      
      if (hospitalId) {
        filter.hospitalId = hospitalId;
      }
      
      if (search) {
        filter.$or = [
          { reason: { $regex: search, $options: 'i' } },
          { patientCondition: { $regex: search, $options: 'i' } },
          { notes: { $regex: search, $options: 'i' } }
        ];
      }

      // Apply role-based filtering
      if (req.user.role === 'hospital_staff') {
        // Hospital staff can only see their hospital's requests
        const userHospital = await Hospital.findOne({ 'staff.userId': req.user.id });
        if (userHospital) {
          filter.hospitalId = userHospital._id;
        }
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Get total count for pagination
      const total = await BloodRequest.countDocuments(filter);

      // Fetch requests with population
      const requests = await BloodRequest.find(filter)
        .populate('hospitalId', 'name registrationNumber address')
        .populate('recipientId', 'userId bloodType medicalCondition')
        .populate('requestedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const pagination = {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total: total,
        limit: parseInt(limit)
      };
      
      res.json({ 
        success: true, 
        message: 'Blood requests retrieved successfully', 
        data: { 
          requests,
          pagination
        } 
      });
    } catch (error) {
      console.error('Get all requests error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve blood requests',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  async createRequest(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const {
        hospitalId,
        recipientId,
        bloodType,
        units,
        urgency,
        reason,
        patientCondition,
        requiredBy,
        notes
      } = req.body;

      // Verify hospital exists
      const hospital = await Hospital.findById(hospitalId);
      if (!hospital) {
        return res.status(404).json({
          success: false,
          message: 'Hospital not found'
        });
      }

      // Verify recipient if provided
      if (recipientId) {
        const recipient = await Recipient.findById(recipientId);
        if (!recipient) {
          return res.status(404).json({
            success: false,
            message: 'Recipient not found'
          });
        }

        // Check blood type compatibility
        if (recipient.bloodType !== bloodType) {
          return res.status(400).json({
            success: false,
            message: 'Blood type does not match recipient record'
          });
        }
      }

      // Check current inventory availability
      const availableUnits = await BloodInventory.countDocuments({
        bloodType,
        status: 'available',
        expiryDate: { $gt: new Date() }
      });

      const bloodRequest = new BloodRequest({
        hospitalId,
        recipientId,
        bloodType,
        units,
        urgency,
        reason,
        patientCondition,
        requiredBy: new Date(requiredBy),
        notes,
        requestedBy: req.user.id,
        status: 'pending',
        availableUnits
      });

      await bloodRequest.save();

      // Populate the response
      await bloodRequest.populate([
        { path: 'hospitalId', select: 'name registrationNumber' },
        { path: 'recipientId', select: 'userId bloodType' },
        { path: 'requestedBy', select: 'name email' }
      ]);

      // Auto-approve if sufficient inventory and low urgency
      if (availableUnits >= units && urgency === 'low') {
        bloodRequest.status = 'approved';
        await bloodRequest.save();
      }

      res.status(201).json({
        success: true,
        message: 'Blood request created successfully',
        data: { request: bloodRequest }
      });

    } catch (error) {
      console.error('Create request error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create blood request',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  async getRequestStats(req, res) {
    try {
      // Get total requests by status
      const statusStats = await BloodRequest.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // Get requests by urgency
      const urgencyStats = await BloodRequest.aggregate([
        {
          $group: {
            _id: '$urgency',
            count: { $sum: 1 }
          }
        }
      ]);

      // Get requests by blood type
      const bloodTypeStats = await BloodRequest.aggregate([
        {
          $match: { status: { $in: ['pending', 'approved'] } }
        },
        {
          $group: {
            _id: '$bloodType',
            count: { $sum: 1 },
            totalUnits: { $sum: '$units' }
          }
        }
      ]);

      // Get time-based statistics
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const startOfWeek = new Date(startOfDay);
      startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const todayRequests = await BloodRequest.countDocuments({
        createdAt: { $gte: startOfDay }
      });

      const weekRequests = await BloodRequest.countDocuments({
        createdAt: { $gte: startOfWeek }
      });

      const monthRequests = await BloodRequest.countDocuments({
        createdAt: { $gte: startOfMonth }
      });

      // Get critical requests (high/critical urgency with pending status)
      const criticalRequests = await BloodRequest.countDocuments({
        urgency: { $in: ['high', 'critical'] },
        status: 'pending'
      });

      // Get overdue requests
      const overdueRequests = await BloodRequest.countDocuments({
        requiredBy: { $lt: new Date() },
        status: { $in: ['pending', 'approved'] }
      });

      // Calculate fulfillment rate
      const totalRequests = await BloodRequest.countDocuments();
      const fulfilledRequests = await BloodRequest.countDocuments({ status: 'fulfilled' });
      const fulfillmentRate = totalRequests > 0 ? (fulfilledRequests / totalRequests * 100).toFixed(2) : 0;

      // Process stats into readable format
      const byStatus = statusStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {});

      const byUrgency = urgencyStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {});

      const byBloodType = {};
      bloodTypeStats.forEach(stat => {
        byBloodType[stat._id] = {
          requests: stat.count,
          units: stat.totalUnits
        };
      });

      const stats = {
        totalRequests,
        pendingRequests: byStatus.pending || 0,
        approvedRequests: byStatus.approved || 0,
        fulfilledRequests: byStatus.fulfilled || 0,
        cancelledRequests: byStatus.cancelled || 0,
        criticalRequests,
        overdueRequests,
        todayRequests,
        weekRequests,
        monthRequests,
        fulfillmentRate: parseFloat(fulfillmentRate),
        byStatus,
        byUrgency,
        byBloodType
      };

      res.json({ 
        success: true, 
        message: 'Request statistics retrieved successfully', 
        data: { stats }
      });
    } catch (error) {
      console.error('Get request stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve request statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  async getRequestById(req, res) {
    try {
      const { id } = req.params;

      const request = await BloodRequest.findById(id)
        .populate('hospitalId', 'name registrationNumber address contactInfo')
        .populate({
          path: 'recipientId',
          populate: { path: 'userId', select: 'name email phone' }
        })
        .populate('requestedBy', 'name email');

      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Blood request not found'
        });
      }

      // Check if user has permission to view this request
      if (req.user.role === 'hospital_staff') {
        const userHospital = await Hospital.findOne({ 'staff.userId': req.user.id });
        if (!userHospital || !userHospital._id.equals(request.hospitalId._id)) {
          return res.status(403).json({
            success: false,
            message: 'Access denied'
          });
        }
      }

      res.json({
        success: true,
        message: 'Blood request retrieved successfully',
        data: { request }
      });

    } catch (error) {
      console.error('Get request by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve blood request',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  async updateRequestStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes, fulfillmentNotes } = req.body;

      const request = await BloodRequest.findById(id);
      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Blood request not found'
        });
      }

      // Status transition validation
      const validTransitions = {
        pending: ['approved', 'cancelled'],
        approved: ['fulfilled', 'cancelled'],
        fulfilled: [], // Cannot change from fulfilled
        cancelled: [] // Cannot change from cancelled
      };

      if (!validTransitions[request.status].includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot change status from ${request.status} to ${status}`
        });
      }

      // Update request based on status
      const updateData = {
        status,
        notes: notes || request.notes,
        updatedAt: new Date()
      };

      if (status === 'approved') {
        updateData.approvedBy = req.user.id;
        updateData.approvedAt = new Date();
        
        // Reserve blood units if approved
        const availableUnits = await BloodInventory.find({
          bloodType: request.bloodType,
          status: 'available',
          expiryDate: { $gt: new Date() }
        }).sort({ expiryDate: 1 }).limit(request.units);

        if (availableUnits.length < request.units) {
          return res.status(400).json({
            success: false,
            message: `Insufficient blood units. Only ${availableUnits.length} units available`
          });
        }

        // Reserve the units
        const reservedIds = availableUnits.map(unit => unit._id);
        await BloodInventory.updateMany(
          { _id: { $in: reservedIds } },
          { 
            status: 'reserved',
            reservedFor: request._id,
            updatedBy: req.user.id
          }
        );

        updateData.reservedUnits = reservedIds;
      }

      if (status === 'fulfilled') {
        updateData.fulfilledBy = req.user.id;
        updateData.fulfilledAt = new Date();
        updateData.fulfillmentNotes = fulfillmentNotes;

        // Mark reserved units as used
        if (request.reservedUnits && request.reservedUnits.length > 0) {
          await BloodInventory.updateMany(
            { _id: { $in: request.reservedUnits } },
            { 
              status: 'used',
              usedFor: request._id,
              updatedBy: req.user.id
            }
          );
        }
      }

      if (status === 'cancelled') {
        // Release reserved units back to available
        if (request.reservedUnits && request.reservedUnits.length > 0) {
          await BloodInventory.updateMany(
            { _id: { $in: request.reservedUnits } },
            { 
              status: 'available',
              $unset: { reservedFor: 1 },
              updatedBy: req.user.id
            }
          );
        }
      }

      const updatedRequest = await BloodRequest.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate([
        { path: 'hospitalId', select: 'name registrationNumber' },
        { path: 'recipientId', select: 'userId bloodType' },
        { path: 'requestedBy', select: 'name email' }
      ]);

      res.json({
        success: true,
        message: 'Request status updated successfully',
        data: { request: updatedRequest }
      });

    } catch (error) {
      console.error('Update request status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update request status',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  async deleteRequest(req, res) {
    try {
      const { id } = req.params;

      const request = await BloodRequest.findById(id);
      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Blood request not found'
        });
      }

      // Check if request can be deleted
      if (request.status === 'fulfilled') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete fulfilled request'
        });
      }

      // Release any reserved units
      if (request.reservedUnits && request.reservedUnits.length > 0) {
        await BloodInventory.updateMany(
          { _id: { $in: request.reservedUnits } },
          { 
            status: 'available',
            $unset: { reservedFor: 1 },
            updatedBy: req.user.id
          }
        );
      }

      await BloodRequest.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Blood request deleted successfully',
        data: { deletedId: id }
      });

    } catch (error) {
      console.error('Delete request error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete blood request',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  async getUrgentRequests(req, res) {
    try {
      const urgentRequests = await BloodRequest.find({
        urgency: { $in: ['high', 'critical'] },
        status: { $in: ['pending', 'approved'] }
      })
      .populate('hospitalId', 'name registrationNumber')
      .populate('recipientId', 'userId bloodType')
      .sort({ urgency: -1, createdAt: -1 })
      .limit(20);

      res.json({
        success: true,
        message: 'Urgent requests retrieved successfully',
        data: { requests: urgentRequests }
      });

    } catch (error) {
      console.error('Get urgent requests error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve urgent requests',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  async updateRequest(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const request = await BloodRequest.findById(id);
      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Blood request not found'
        });
      }

      // Only allow updates if request is pending
      if (request.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Can only update pending requests'
        });
      }

      // Update allowed fields
      const allowedUpdates = ['units', 'urgency', 'reason', 'patientCondition', 'requiredBy', 'notes'];
      const updateObj = {};

      allowedUpdates.forEach(field => {
        if (updates[field] !== undefined) {
          updateObj[field] = updates[field];
        }
      });

      updateObj.updatedAt = new Date();

      const updatedRequest = await BloodRequest.findByIdAndUpdate(
        id,
        updateObj,
        { new: true, runValidators: true }
      ).populate([
        { path: 'hospitalId', select: 'name registrationNumber' },
        { path: 'recipientId', select: 'userId bloodType' },
        { path: 'requestedBy', select: 'name email' }
      ]);

      res.json({
        success: true,
        message: 'Blood request updated successfully',
        data: { request: updatedRequest }
      });

    } catch (error) {
      console.error('Update request error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update blood request',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}

module.exports = new BloodRequestController();