const bcrypt = require('bcrypt');
const { User } = require('../models');
const { generateToken } = require('../middleware/authMiddleware');

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} User and token
   */
  static async register(userData) {
    try {
      // Normalize email
      const email = (userData.email || '').toLowerCase();

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Prepare name and role
      const name = userData.name || [userData.firstName, userData.lastName].filter(Boolean).join(' ').trim();
      const role = userData.role || 'Employee';

      // Create user (model hook will hash password_hash)
      const user = await User.create({
        name: name || 'User',
        email,
        password_hash: userData.password,
        role,
        isActive: userData.isActive !== undefined ? userData.isActive : true
      });

      // Generate token
      const token = generateToken(user);

      // Remove password from response
      const userResponse = user.toJSON();
      delete userResponse.password_hash;
      // Provide firstName/lastName for UI compatibility
      const parts = (userResponse.name || '').trim().split(/\s+/);
      userResponse.firstName = parts[0] || '';
      userResponse.lastName = parts.slice(1).join(' ') || '';

      return {
        user: userResponse,
        token
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} User and token
   */
  static async login(email, password) {
    try {
      // Validate email format first
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        throw new Error('INVALID_EMAIL_FORMAT');
      }

      // Find user by email
      const user = await User.findOne({ where: { email: (email || '').toLowerCase() } });

      if (!user) {
        throw new Error('EMAIL_NOT_FOUND');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('ACCOUNT_DEACTIVATED');
      }

      // Verify password using model helper
      const isValidPassword = await user.checkPassword(password);
      if (!isValidPassword) {
        throw new Error('INVALID_PASSWORD');
      }

      // Generate token
      const token = generateToken(user);

      // Remove password from response
      const userResponse = user.toJSON();
      delete userResponse.password_hash;
      const parts = (userResponse.name || '').trim().split(/\s+/);
      userResponse.firstName = parts[0] || '';
      userResponse.lastName = parts.slice(1).join(' ') || '';

      return {
        user: userResponse,
        token
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {boolean} Success status
   */
  static async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isValidPassword = await user.checkPassword(currentPassword);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await user.update({ password_hash: hashedPassword });

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reset user password (Admin only)
   * @param {string} userId - User ID
   * @param {string} newPassword - New password
   * @returns {boolean} Success status
   */
  static async resetPassword(userId, newPassword) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await user.update({ password_hash: hashedPassword });

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} Validation result
   */
  static validatePassword(password) {
    const errors = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {Object} User profile
   */
  static async getUserProfile(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password_hash'] }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const data = user.toJSON();
      const parts = (data.name || '').trim().split(/\s+/);
      data.firstName = parts[0] || '';
      data.lastName = parts.slice(1).join(' ') || '';
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated user
   */
  static async updateProfile(userId, updateData) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Remove sensitive fields
      delete updateData.password;
      delete updateData.role;
      delete updateData.isActive;

      // If front-end sends firstName/lastName, combine into name
      if (updateData.firstName || updateData.lastName) {
        const first = (updateData.firstName || '').trim();
        const last = (updateData.lastName || '').trim();
        updateData.name = [first, last].filter(Boolean).join(' ') || user.name;
        delete updateData.firstName;
        delete updateData.lastName;
      }
      await user.update(updateData);

      const userResponse = user.toJSON();
      delete userResponse.password_hash;
      const parts = (userResponse.name || '').trim().split(/\s+/);
      userResponse.firstName = parts[0] || '';
      userResponse.lastName = parts.slice(1).join(' ') || '';

      return userResponse;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AuthService;
