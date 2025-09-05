const express = require('express');
const router = express.Router();
const { Delivery, User, Item } = require('../models');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireAuth, canAssignDeliveries, requireAdmin } = require('../middleware/roleMiddleware');

/**
 * @route   GET /api/deliveries
 * @desc    Get all deliveries
 * @access  Private
 */
router.get('/', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, assignedTo } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {};
    if (status) whereClause.status = status;
    if (assignedTo) whereClause.assigned_to = assignedTo;

    const deliveries = await Delivery.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'name', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        deliveries: deliveries.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(deliveries.count / limit),
          totalDeliveries: deliveries.count,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get deliveries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch deliveries'
    });
  }
});

/**
 * @route   GET /api/deliveries/:id
 * @desc    Get delivery by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, requireAuth, async (req, res) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    res.json({
      success: true,
      data: delivery
    });
  } catch (error) {
    console.error('Get delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery'
    });
  }
});

/**
 * @route   POST /api/deliveries
 * @desc    Create new delivery (Store Keeper/Admin only)
 * @access  Private/Store Keeper/Admin
 */
router.post('/', authenticateToken, canAssignDeliveries, async (req, res) => {
  try {
    const deliveryData = {
      ...req.body,
      assigned_by: req.user.id // Set assigned by from token
    };

    // Validate assigned user exists
    const assignedUser = await User.findByPk(deliveryData.assigned_to);
    if (!assignedUser) {
      return res.status(400).json({
        success: false,
        message: 'Assigned user not found'
      });
    }

    const delivery = await Delivery.create(deliveryData);

    res.status(201).json({
      success: true,
      message: 'Delivery created successfully',
      data: delivery
    });
  } catch (error) {
    console.error('Create delivery error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   PUT /api/deliveries/:id/assign
 * @desc    Assign delivery to user (Store Keeper/Admin only)
 * @access  Private/Store Keeper/Admin
 */
router.put('/:id/assign', authenticateToken, canAssignDeliveries, async (req, res) => {
  try {
    const { assigned_to, notes } = req.body;

    if (!assigned_to) {
      return res.status(400).json({
        success: false,
        message: 'Assigned user ID is required'
      });
    }

    const delivery = await Delivery.findByPk(req.params.id);
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    // Validate assigned user exists
    const assignedUser = await User.findByPk(assigned_to);
    if (!assignedUser) {
      return res.status(400).json({
        success: false,
        message: 'Assigned user not found'
      });
    }

    await delivery.update({
      assigned_to,
      notes: notes || delivery.notes,
      status: 'In-Progress'
    });

    res.json({
      success: true,
      message: 'Delivery assigned successfully',
      data: delivery
    });
  } catch (error) {
    console.error('Assign delivery error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   PUT /api/deliveries/:id/status
 * @desc    Update delivery status
 * @access  Private
 */
router.put('/:id/status', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!status || !['Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required'
      });
    }

    const delivery = await Delivery.findByPk(req.params.id);
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    // Check if user can update this delivery
    if (delivery.assigned_to !== req.user.id && req.user.role !== 'Admin' && req.user.role !== 'Store Keeper') {
      return res.status(403).json({
        success: false,
        message: 'You can only update deliveries assigned to you'
      });
    }

    const updateData = {
      status,
      notes: notes || delivery.notes
    };

    // Set completion data if status is completed
    if (status === 'Completed') {
      updateData.completed_by = req.user.id;
      updateData.completed_at = new Date();
    }

    await delivery.update(updateData);

    res.json({
      success: true,
      message: 'Delivery status updated successfully',
      data: delivery
    });
  } catch (error) {
    console.error('Update delivery status error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/deliveries/user/:userId
 * @desc    Get deliveries assigned to a specific user
 * @access  Private
 */
router.get('/user/:userId', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    // Build where clause
    const whereClause = { assigned_to: userId };
    if (status) whereClause.status = status;

    const deliveries = await Delivery.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: deliveries
    });
  } catch (error) {
    console.error('Get user deliveries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user deliveries'
    });
  }
});

/**
 * @route   GET /api/deliveries/my-deliveries
 * @desc    Get current user's deliveries
 * @access  Private
 */
router.get('/my-deliveries', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { status } = req.query;

    // Build where clause
    const whereClause = { assigned_to: req.user.id };
    if (status) whereClause.status = status;

    const deliveries = await Delivery.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: deliveries
    });
  } catch (error) {
    console.error('Get my deliveries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your deliveries'
    });
  }
});

/**
 * @route   GET /api/deliveries/stats
 * @desc    Get delivery statistics
 * @access  Private
 */
router.get('/stats', authenticateToken, requireAuth, async (req, res) => {
  try {
    const stats = await Delivery.findAll({
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('delivery_id')), 'count']
      ],
      group: ['status']
    });

    const result = {
      Pending: 0,
      'In-Progress': 0,
      Completed: 0,
      total: 0
    };

    stats.forEach(stat => {
      const status = stat.dataValues.status;
      const count = parseInt(stat.dataValues.count);
      if (!result[status]) result[status] = 0;
      result[status] = count;
      result.total += count;
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get delivery stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery statistics'
    });
  }
});

/**
 * @route   DELETE /api/deliveries/:id
 * @desc    Delete delivery (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id);
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    await delivery.destroy();

    res.json({
      success: true,
      message: 'Delivery deleted successfully'
    });
  } catch (error) {
    console.error('Delete delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete delivery'
    });
  }
});

module.exports = router;
