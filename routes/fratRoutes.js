// routes/frats.js
const express = require('express');
const router = express.Router();
const fratController = require('../controllers/fratController');
const { auth } = require('../middleware/auth');

// Public routes
router.get('/:id', fratController.getFratById);
router.get('/by-url/:urlName', fratController.getFratByUrlName);

// Protected routes
router.use(auth);
router.post('/', fratController.createFrat);
router.get('/:fratId/tags', fratController.getTags); // Get all tags
router.post('/:fratId/tags', fratController.addTag); // Add a tag
router.delete('/:fratId/tags', fratController.removeTag); // Remove a tag
router.get('/:fratId/formatted-name', fratController.getFormattedName);
router.patch('/:fratId/contact', fratController.updateContactInfo);
router.patch('/:fratId/brothers', fratController.updateBrothers);
router.patch('/:fratId/president', fratController.updatePresident);

module.exports = router;