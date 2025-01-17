// controllers/brotherController.js
const Brother = require('../models/brother');
const Frat = require('../models/frat');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/auth');

const brotherController = {
  // Login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const brother = await Brother.findOne({ email });

      // Encrypt the provided password and log it
      const hashedPassword = await bcrypt.hash(password, 10);

      if (!brother || !(await bcrypt.compare(password, brother.password))) {
        return res.status(401).json({
          success: false,
          error: 'Invalid login credentials'
        });
      }

      const token = generateToken(brother._id);
      res.json({
        success: true,
        data: {
          brother: {
            id: brother._id,
            name: brother.name,
            position: brother.position,
            frat: brother.frat
          },
          token
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },
  getAllBrothers: async (req, res) => {
    try {
      // Get the fraternity and populate its brothers array
      const fraternity = await Frat.findById(req.brother.frat)
        .populate({
          path: 'brothers',
          select: '-password' // Exclude password field
        });
  
      if (!fraternity) {
        return res.status(404).json({
          success: false,
          error: 'Fraternity not found'
        });
      }
  
      res.json({
        success: true,
        data: fraternity.brothers
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },
  // Create new brother (President only)
  createBrother: async (req, res) => {
    try {
      const { name, email, position } = req.body;
      const fratId = req.brother.frat; // Get frat from authenticated president

      // Check if brother with email already exists
      const existingBrother = await Brother.findOne({ email });
      if (existingBrother) {
        return res.status(400).json({
          success: false,
          error: 'Email already registered'
        });
      }

      // Hash default password
      const hashedPassword = await bcrypt.hash('Password123!', 10);

      const brother = new Brother({
        name,
        email,
        password: hashedPassword,
        frat: fratId,
        position
      });

      await brother.save();

      // Add brother to fraternity's brothers array
      await Frat.findByIdAndUpdate(fratId, {
        $push: { brothers: brother._id }
      });

      const brotherResponse = brother.toObject();
      delete brotherResponse.password;

      res.status(201).json({
        success: true,
        data: brotherResponse
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  // Reset password
  resetPassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const brother = req.brother;

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, brother.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }

      // Hash and save new password
      brother.password = await bcrypt.hash(newPassword, 10);
      await brother.save();

      res.json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  // Update brother's own profile
  updateOwnProfile: async (req, res) => {
    try {
      const allowedUpdates = ['phone', 'major', 'year'];
      const updates = Object.keys(req.body)
        .filter(key => allowedUpdates.includes(key))
        .reduce((obj, key) => {
          obj[key] = req.body[key];
          return obj;
        }, {});

      const brother = await Brother.findByIdAndUpdate(
        req.brother._id,
        updates,
        { new: true, runValidators: true }
      ).select('-password');

      res.json({
        success: true,
        data: brother
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  // Update brother's position (President only)
  updatePosition: async (req, res) => {
    try {
      const { brotherId } = req.params;
      const { position } = req.body;

      const brother = await Brother.findOneAndUpdate(
        { _id: brotherId, frat: req.brother.frat },
        { position },
        { new: true, runValidators: true }
      ).select('-password');

      if (!brother) {
        return res.status(404).json({
          success: false,
          error: 'Brother not found'
        });
      }

      res.json({
        success: true,
        data: brother
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  // Toggle brother's active status (President only)
  toggleActiveStatus: async (req, res) => {
    try {
      const { brotherId } = req.params;

      const brother = await Brother.findOne({ 
        _id: brotherId, 
        frat: req.brother.frat 
      });

      if (!brother) {
        return res.status(404).json({
          success: false,
          error: 'Brother not found'
        });
      }

      brother.isActive = !brother.isActive;
      await brother.save();

      res.json({
        success: true,
        data: {
          brotherId: brother._id,
          isActive: brother.isActive
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = brotherController;