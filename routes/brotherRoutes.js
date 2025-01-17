// routes/brotherRoutes.js
const express = require('express');
const router = express.Router();
const brotherController = require('../controllers/brotherController');
const { auth, isPresident } = require('../middleware/auth');

// Public routes
router.post('/login', brotherController.login);

// Protected routes
router.post('/', auth, isPresident, brotherController.createBrother);
router.patch('/reset-password', auth, brotherController.resetPassword);
router.patch('/profile', auth, brotherController.updateOwnProfile);
router.patch('/:brotherId/position', auth, isPresident, brotherController.updatePosition);
router.patch('/:brotherId/toggle-active', auth, isPresident, brotherController.toggleActiveStatus);
router.get('/', auth, brotherController.getAllBrothers);

module.exports = router;