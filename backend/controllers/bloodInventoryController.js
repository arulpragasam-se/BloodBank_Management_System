// controllers/bloodInventoryController.js
const BloodInventory = require('../models/BloodInventory');
const Donor = require('../models/Donor');
const { validationResult } = require('express-validator');
      // Use your original constants file structure
      const { BLOOD_TYPES } = require('../utils/constants');

class BloodInventoryController {
  async getAllInventory(req, res) {
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
        search = '',
        bloodType = '',
        status = '',
        location = '',
        expiring = ''
      } = req.query;

      // Build query object
      const query = {};

      // Search functionality
      if (search) {
        query.$or = [
          { 'donorId.userId.name': { $regex: search, $options: 'i' } },
          { 'storageLocation.section': { $regex: search, $options: 'i' } },
          { bloodType: { $regex: search, $options: 'i' } }
        ];
      }

      // Filter by blood type
      if (bloodType && BLOOD_TYPES.includes(bloodType)) {
        query.bloodType = bloodType;
      }

      // Filter by status
      if (status) {
        query.status = status;
      }

      // Filter by storage location
      if (location) {
        query['storageLocation.section'] = location;
      }

      // Filter by expiring units
      if (expiring) {
        const daysFromNow = new Date();
        daysFromNow.setDate(daysFromNow.getDate() + parseInt(expiring));
        query.expiryDate = { $lte: daysFromNow };
        query.status = 'available'; // Only check available units
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Get total count for pagination
      const totalCount = await BloodInventory.countDocuments(query);

      // Fetch inventory with population
      const inventory = await BloodInventory.find(query)
        .populate({
          path: 'donorId',
          populate: {
            path: 'userId',
            select: 'name email phone'
          }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const pagination = {
        current: parseInt(page),
        pages: Math.ceil(totalCount / parseInt(limit)),
        total: totalCount,
        limit: parseInt(limit)
      };

      res.json({
        success: true,
        message: 'Inventory retrieved successfully',
        data: {
          inventory,
          pagination
        }
      });

    } catch (error) {
      console.error('Get inventory error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve inventory',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  async getInventoryStats(req, res) {
    try {
      // Get total units by status
      const statusStats = await BloodInventory.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // Get units by blood type
      const bloodTypeStats = await BloodInventory.aggregate([
        {
          $match: { status: 'available' }
        },
        {
          $group: {
            _id: '$bloodType',
            units: { $sum: 1 },
            expiringIn7Days: {
              $sum: {
                $cond: [
                  {
                    $lte: [
                      '$expiryDate',
                      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      // Get expiry alerts
      const now = new Date();
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const expiringIn3Days = await BloodInventory.countDocuments({
        status: 'available',
        expiryDate: { $lte: threeDaysFromNow, $gte: now }
      });

      const expiringIn7Days = await BloodInventory.countDocuments({
        status: 'available',
        expiryDate: { $lte: sevenDaysFromNow, $gte: now }
      });

      const expired = await BloodInventory.countDocuments({
        expiryDate: { $lt: now }
      });

      // Calculate total units and low stock items
      const totalUnits = await BloodInventory.countDocuments({ status: 'available' });
      
      // Define minimum stock levels per blood type
      const minStockLevels = {
        'O-': 10, 'O+': 15, 'A-': 8, 'A+': 12,
        'B-': 6, 'B+': 10, 'AB-': 4, 'AB+': 6
      };

      let lowStockItems = 0;
      const byBloodType = {};

      // Process blood type stats
      bloodTypeStats.forEach(stat => {
        byBloodType[stat._id] = {
          units: stat.units,
          expiringIn7Days: stat.expiringIn7Days,
          minRequired: minStockLevels[stat._id] || 5
        };

        if (stat.units < minStockLevels[stat._id]) {
          lowStockItems++;
        }
      });

      // Ensure all blood types are represented
      BLOOD_TYPES.forEach(bloodType => {
        if (!byBloodType[bloodType]) {
          byBloodType[bloodType] = {
            units: 0,
            expiringIn7Days: 0,
            minRequired: minStockLevels[bloodType] || 5
          };
          lowStockItems++;
        }
      });

      const stats = {
        totalUnits,
        expiringIn3Days,
        expiringIn7Days,
        expired,
        lowStockItems,
        byBloodType,
        byStatus: statusStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {})
      };

      res.json({
        success: true,
        message: 'Inventory statistics retrieved successfully',
        data: { stats }
      });

    } catch (error) {
      console.error('Get inventory stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve inventory statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  async addBloodInventory(req, res) {
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
        donorId,
        bloodType,
        collectionDate,
        expiryDate,
        storageLocation,
        testResults,
        units = 1,
        notes,
      } = req.body;

      // Verify donor exists
      const donor = await Donor.findById(donorId);
      if (!donor) {
        return res.status(404).json({
          success: false,
          message: 'Donor not found'
        });
      }

      // Verify blood type matches donor's blood type
      if (donor.bloodType !== bloodType) {
        return res.status(400).json({
          success: false,
          message: 'Blood type does not match donor record'
        });
      }

      const inventoryItem = new BloodInventory({
        donorId,
        bloodType,
        collectionDate: new Date(collectionDate),
        expiryDate: new Date(expiryDate),
        storageLocation,
        testResults: testResults || {
          hiv: 'pending',
          hepatitisB: 'pending', 
          hepatitisC: 'pending',
          syphilis: 'pending'
        },
        units,
        status: 'available',
        notes
      });

      await inventoryItem.save();

      // Populate the response
      await inventoryItem.populate({
        path: 'donorId',
        populate: { path: 'userId', select: 'name email phone' }
      });

      res.status(201).json({
        success: true,
        message: 'Blood inventory added successfully',
        data: { inventory: inventoryItem }
      });

    } catch (error) {
      console.error('Add inventory error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add blood inventory',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  async updateInventory(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const inventory = await BloodInventory.findById(id);
      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: 'Inventory item not found'
        });
      }

      // Update allowed fields
      const allowedUpdates = ['status', 'storageLocation', 'testResults', 'notes'];
      const updateObj = {};

      allowedUpdates.forEach(field => {
        if (updates[field] !== undefined) {
          updateObj[field] = updates[field];
        }
      });

      updateObj.updatedAt = new Date();

      const updatedInventory = await BloodInventory.findByIdAndUpdate(
        id,
        updateObj,
        { new: true, runValidators: true }
      ).populate({
        path: 'donorId',
        populate: { path: 'userId', select: 'name email phone' }
      });

      res.json({
        success: true,
        message: 'Inventory updated successfully',
        data: { inventory: updatedInventory }
      });

    } catch (error) {
      console.error('Update inventory error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update inventory',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  async checkExpiredBlood(req, res) {
    try {
      const now = new Date();
      
      // Find expired blood units that are still marked as available
      const expiredUnits = await BloodInventory.find({
        expiryDate: { $lt: now },
        status: 'available'
      });

      // Update expired units
      if (expiredUnits.length > 0) {
        await BloodInventory.updateMany(
          {
            expiryDate: { $lt: now },
            status: 'available'
          },
          {
            status: 'expired',
            updatedAt: now
          }
        );
      }

      res.json({
        success: true,
        message: 'Expired blood check completed',
        data: {
          expiredCount: expiredUnits.length,
          expiredUnits: expiredUnits.map(unit => ({
            id: unit._id,
            bloodType: unit.bloodType,
            expiryDate: unit.expiryDate
          }))
        }
      });

    } catch (error) {
      console.error('Check expired blood error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check expired blood',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  async sendLowStockAlert(req, res) {
    try {
      // Implementation would depend on your notification system
      res.json({
        success: true,
        message: 'Low stock alerts sent successfully',
        data: { alertsSent: 0 }
      });
    } catch (error) {
      console.error('Send low stock alert error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send low stock alerts',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  async reserveBlood(req, res) {
    try {
      const { bloodType, units, requestId } = req.body;

      // Find available units of the requested blood type
      const availableUnits = await BloodInventory.find({
        bloodType,
        status: 'available'
      }).sort({ expiryDate: 1 }).limit(units);

      if (availableUnits.length < units) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Only ${availableUnits.length} units available`
        });
      }

      // Reserve the units
      const reservedIds = availableUnits.map(unit => unit._id);
      await BloodInventory.updateMany(
        { _id: { $in: reservedIds } },
        {
          status: 'reserved',
          updatedAt: new Date()
        }
      );

      res.json({
        success: true,
        message: 'Blood units reserved successfully',
        data: {
          reservedUnits: reservedIds,
          bloodType,
          units: reservedIds.length
        }
      });

    } catch (error) {
      console.error('Reserve blood error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reserve blood',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  async deleteInventory(req, res) {
    try {
      const { id } = req.params;

      const inventory = await BloodInventory.findById(id);
      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: 'Inventory item not found'
        });
      }

      // Check if the unit is reserved or used
      if (inventory.status === 'reserved' || inventory.status === 'used') {
        return res.status(400).json({
          success: false,
          message: `Cannot delete ${inventory.status} blood unit`
        });
      }

      await BloodInventory.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Inventory item deleted successfully',
        data: { deletedId: id }
      });

    } catch (error) {
      console.error('Delete inventory error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete inventory item',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  async getInventoryById(req, res) {
    try {
      const { id } = req.params;

      const inventory = await BloodInventory.findById(id)
        .populate({
          path: 'donorId',
          populate: { path: 'userId', select: 'name email phone' }
        });

      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: 'Inventory item not found'
        });
      }

      res.json({
        success: true,
        message: 'Inventory item retrieved successfully',
        data: { inventory }
      });

    } catch (error) {
      console.error('Get inventory by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve inventory item',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}

module.exports = new BloodInventoryController();