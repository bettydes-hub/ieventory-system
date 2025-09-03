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
      // Check if user already exists
      const existingUser = await User.findOne({
        where: { email: userData.email }
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Create user
      const user = await User.create({
        ...userData,
        password: hashedPassword,
        role: userData.role || 'User', // Default role
        isActive: true
      });

      // Generate token
      const token = generateToken(user);

      // Remove password from response
      const userResponse = user.toJSON();
      delete userResponse.password;

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
      // Find user by email
      const user = await User.findOne({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Generate token
      const token = generateToken(user);

      // Remove password from response
      const userResponse = user.toJSON();
      delete userResponse.password;

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
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await user.update({ password: hashedPassword });

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
      await user.update({ password: hashedPassword });

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
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
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

      await user.update(updateData);

      const userResponse = user.toJSON();
      delete userResponse.password;

      return userResponse;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AuthService;
