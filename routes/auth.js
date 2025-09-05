const express = require('express');
const router = express.Router();
const AuthService = require('../services/authService');
const { authenticateToken, generateToken } = require('../middleware/authMiddleware');
const { requireAuth } = require('../middleware/roleMiddleware');
const passport = require('../config/passport');
const bcrypt = require('bcrypt');
const { User } = require('../models');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate password strength
    const passwordValidation = AuthService.validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors
      });
    }

    // Register user
    const result = await AuthService.register({
      firstName,
      lastName,
      email,
      password,
      role
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Login user
    const result = await AuthService.login(email, password);

    res.json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   POST /api/auth/register-local
 * @desc    Register with local strategy (ienetworks.co only)
 * @access  Public
 */
router.post('/register-local', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }
    const normalized = email.toLowerCase();
    if (!normalized.endsWith('@ienetworks.co')) {
      return res.status(400).json({ success: false, message: 'Email must be @ienetworks.co' });
    }
    const existing = await User.findOne({ where: { email: normalized } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }
    // Let model hook hash the password
    const user = await User.create({ name, email: normalized, password_hash: password, role: role || 'Employee' });
    const token = generateToken(user);
    const response = user.toJSON();
    delete response.password_hash;
    res.status(201).json({ success: true, message: 'User registered successfully', data: { user: response, token } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/auth/login-local
 * @desc    Login with local strategy (ienetworks.co only)
 * @access  Public
 */
router.post('/login-local', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ success: false, message: info?.message || 'Login failed' });
    const token = generateToken(user);
    const data = user.toJSON();
    delete data.password_hash;
    res.json({ success: true, message: 'Login successful', data: { user: data, token } });
  })(req, res, next);
});

/**
 * @route   GET /api/auth/basecamp
 * @desc    Begin Basecamp OAuth2 login
 * @access  Public
 */
router.get('/basecamp', passport.authenticate('basecamp', { session: false }));

/**
 * @route   GET /api/auth/basecamp/callback
 * @desc    Basecamp OAuth2 callback
 * @access  Public
 */
router.get('/basecamp/callback', (req, res, next) => {
  passport.authenticate('basecamp', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ success: false, message: info?.message || 'Basecamp authentication failed' });
    const token = generateToken(user);
    const data = user.toJSON();
    delete data.password_hash;
    res.json({ success: true, message: 'Login successful', data: { user: data, token } });
  })(req, res, next);
});

/**
 * @route   GET /api/auth/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await AuthService.getUserProfile(req.user.id);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const updateData = req.body;
    const user = await AuthService.updateProfile(req.user.id, updateData);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Validate new password strength
    const passwordValidation = AuthService.validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'New password does not meet requirements',
        errors: passwordValidation.errors
      });
    }

    // Change password
    await AuthService.changePassword(req.user.id, currentPassword, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   POST /api/auth/verify-token
 * @desc    Verify JWT token
 * @access  Private
 */
router.post('/verify-token', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      user: {
        id: req.user.id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        role: req.user.role
      }
    }
  });
});

module.exports = router;
