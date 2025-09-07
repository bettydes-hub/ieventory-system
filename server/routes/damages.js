const express = require('express');
const router = express.Router();
const DamageService = require('../services/damageService');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireAuth, canResolveDamage } = require('../middleware/roleMiddleware');

/**
 * @route   GET /api/damages
 * @desc    Get all damage reports
 * @access  Private
 */
router.get('/', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, itemType, itemId } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {};
    if (status) whereClause.status = status;
    if (itemType) whereClause.item_type = itemType;
    if (itemId) whereClause.item_id = itemId;

    const { Damage, User } = require('../models');
    const damages = await Damage.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'resolver',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date_reported', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        damages: damages.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(damages.count / limit),
          totalDamages: damages.count,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get damages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch damage reports'
    });
  }
});

/**
 * @route   GET /api/damages/:id
 * @desc    Get damage report by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { Damage, User } = require('../models');
    const damage = await Damage.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'resolver',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    if (!damage) {
      return res.status(404).json({
        success: false,
        message: 'Damage report not found'
      });
    }

    res.json({
      success: true,
      data: damage
    });
  } catch (error) {
    console.error('Get damage error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch damage report'
    });
  }
});

/**
 * @route   POST /api/damages
 * @desc    Report new damage
 * @access  Private
 */
router.post('/', authenticateToken, requireAuth, async (req, res) => {
  try {
    const damageData = {
      ...req.body,
      reported_by: req.user.id // Set reporter from token
    };

    const damage = await DamageService.reportDamage(damageData);

    res.status(201).json({
      success: true,
      message: 'Damage reported successfully',
      data: damage
    });
  } catch (error) {
    console.error('Report damage error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   PUT /api/damages/:id/resolve
 * @desc    Resolve damage report (Store Keeper/Admin only)
 * @access  Private/Store Keeper/Admin
 */
router.put('/:id/resolve', authenticateToken, canResolveDamage, async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!status || !['Fixed', 'Discarded'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "Fixed" or "Discarded"'
      });
    }

    const damage = await DamageService.resolveDamage(
      req.params.id,
      status,
      req.user.id,
      notes
    );

    res.json({
      success: true,
      message: 'Damage resolved successfully',
      data: damage
    });
  } catch (error) {
    console.error('Resolve damage error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/damages/serial/:serialNumber
 * @desc    Get damage reports by serial number
 * @access  Private
 */
router.get('/serial/:serialNumber', authenticateToken, requireAuth, async (req, res) => {
  try {
    const damages = await DamageService.getDamageBySerial(req.params.serialNumber);

    res.json({
      success: true,
      data: damages
    });
  } catch (error) {
    console.error('Get damage by serial error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch damage reports'
    });
  }
});

/**
 * @route   GET /api/damages/type/:itemType
 * @desc    Get damage reports by item type (serial/bulk)
 * @access  Private
 */
router.get('/type/:itemType', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { itemType } = req.params;
    
    if (!['serial', 'bulk'].includes(itemType)) {
      return res.status(400).json({
        success: false,
        message: 'Item type must be either "serial" or "bulk"'
      });
    }

    const damages = await DamageService.getDamageByType(itemType);

    res.json({
      success: true,
      data: damages
    });
  } catch (error) {
    console.error('Get damage by type error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch damage reports'
    });
  }
});

/**
 * @route   GET /api/damages/overdue
 * @desc    Get overdue damage reports
 * @access  Private
 */
router.get('/overdue', authenticateToken, requireAuth, async (req, res) => {
  try {
    const overdueDamages = await DamageService.getOverdueDamage();

    res.json({
      success: true,
      data: overdueDamages
    });
  } catch (error) {
    console.error('Get overdue damages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overdue damage reports'
    });
  }
});

/**
 * @route   GET /api/damages/stats
 * @desc    Get damage statistics
 * @access  Private
 */
router.get('/stats', authenticateToken, requireAuth, async (req, res) => {
  try {
    const stats = await DamageService.getDamageStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get damage stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch damage statistics'
    });
  }
});

/**
 * @route   GET /api/damages/item/:itemId/total-damaged
 * @desc    Get total damaged quantity for a bulk item
 * @access  Private
 */
router.get('/item/:itemId/total-damaged', authenticateToken, requireAuth, async (req, res) => {
  try {
    const totalDamaged = await DamageService.getTotalDamagedQuantity(req.params.itemId);

    res.json({
      success: true,
      data: {
        itemId: req.params.itemId,
        totalDamaged
      }
    });
  } catch (error) {
    console.error('Get total damaged quantity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch total damaged quantity'
    });
  }
});

module.exports = router;
