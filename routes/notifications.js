const express = require('express');
const router = express.Router();
const NotificationService = require('../services/notificationService');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireAuth, requireAdmin } = require('../middleware/roleMiddleware');

/**
 * @route   GET /api/notifications
 * @desc    Get user notifications
 * @access  Private
 */
router.get('/', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { limit = 50, status } = req.query;
    
    let notifications;
    if (status) {
      notifications = await NotificationService.getUserNotifications(req.user.id, limit);
      // Filter by status
      notifications = notifications.filter(n => n.status === status);
    } else {
      notifications = await NotificationService.getUserNotifications(req.user.id, limit);
    }

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

/**
 * @route   POST /api/notifications
 * @desc    Create new notification (Admin only)
 * @access  Private/Admin
 */
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { user_id, type, message } = req.body;

    // Validate required fields
    if (!user_id || !type || !message) {
      return res.status(400).json({
        success: false,
        message: 'User ID, type, and message are required'
      });
    }

    // Validate notification type
    if (!['email', 'dashboard alert'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "email" or "dashboard alert"'
      });
    }

    const notification = await NotificationService.createNotification({
      user_id,
      type,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notification
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   POST /api/notifications/bulk
 * @desc    Create bulk notifications for multiple users (Admin only)
 * @access  Private/Admin
 */
router.post('/bulk', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { user_ids, type, message } = req.body;

    // Validate required fields
    if (!user_ids || !Array.isArray(user_ids) || !type || !message) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array, type, and message are required'
      });
    }

    // Validate notification type
    if (!['email', 'dashboard alert'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "email" or "dashboard alert"'
      });
    }

    const notifications = await NotificationService.createBulkNotifications(
      user_ids,
      { type, message }
    );

    res.status(201).json({
      success: true,
      message: `Notifications created successfully for ${notifications.length} users`,
      data: notifications
    });
  } catch (error) {
    console.error('Create bulk notifications error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   PUT /api/notifications/:id/mark-sent
 * @desc    Mark notification as sent
 * @access  Private
 */
router.put('/:id/mark-sent', authenticateToken, requireAuth, async (req, res) => {
  try {
    const notification = await NotificationService.markAsSent(req.params.id);

    res.json({
      success: true,
      message: 'Notification marked as sent',
      data: notification
    });
  } catch (error) {
    console.error('Mark notification as sent error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/notifications/pending
 * @desc    Get pending notifications (Admin only)
 * @access  Private/Admin
 */
router.get('/pending', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pendingNotifications = await NotificationService.getPendingNotifications();

    res.json({
      success: true,
      data: pendingNotifications
    });
  } catch (error) {
    console.error('Get pending notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending notifications'
    });
  }
});

/**
 * @route   GET /api/notifications/stats
 * @desc    Get notification statistics (Admin only)
 * @access  Private/Admin
 */
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await NotificationService.getNotificationStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification statistics'
    });
  }
});

/**
 * @route   POST /api/notifications/process-pending
 * @desc    Process all pending notifications (Admin only)
 * @access  Private/Admin
 */
router.post('/process-pending', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const results = await NotificationService.processPendingNotifications();

    res.json({
      success: true,
      message: 'Pending notifications processed',
      data: results
    });
  } catch (error) {
    console.error('Process pending notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process pending notifications'
    });
  }
});

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { Notification } = require('../models');
    
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.destroy();

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
});

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count for user
 * @access  Private
 */
router.get('/unread-count', authenticateToken, requireAuth, async (req, res) => {
  try {
    const notifications = await NotificationService.getUserNotifications(req.user.id);
    const unreadCount = notifications.filter(n => n.status === 'Pending').length;

    res.json({
      success: true,
      data: {
        unreadCount
      }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count'
    });
  }
});

module.exports = router;
