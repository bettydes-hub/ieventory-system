const { Notification, User } = require('../models');

class NotificationService {
  /**
   * Create a new notification
   */
  static async createNotification(notificationData) {
    try {
      const user = await User.findByPk(notificationData.user_id);
      if (!user) {
        throw new Error('Recipient user not found');
      }

      const notification = await Notification.create({
        ...notificationData,
        status: notificationData.status || 'Pending',
        timestamp: new Date()
      });

      return notification;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mark notification as sent
   */
  static async markAsSent(notificationId) {
    try {
      const notification = await Notification.findByPk(notificationId);
      if (!notification) {
        throw new Error('Notification not found');
      }

      await notification.markAsSent();
      return notification;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(userId, limit = 50) {
    try {
      return await Notification.findAll({
        where: { user_id: userId },
        order: [['timestamp', 'DESC']],
        limit: limit
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get pending notifications
   */
  static async getPendingNotifications() {
    try {
      return await Notification.findAll({
        where: { status: 'Pending' },
        include: [
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        order: [['timestamp', 'ASC']]
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = NotificationService;
