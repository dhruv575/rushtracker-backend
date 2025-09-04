// routes/rushees.js
const express = require('express');
const router = express.Router();
const rusheeController = require('../controllers/rusheeController');
const { auth } = require('../middleware/auth');

// Public routes
router.get('/search', rusheeController.findRusheeByEmail);
router.post('/', rusheeController.createRushee);
router.patch('/:rusheeId', rusheeController.updateRushee);

// Protected routes
router.use(auth);
router.get('/', rusheeController.getAllRushees);
router.get('/:rusheeId/tags', rusheeController.getTags); // Get all tags for a Rushee
router.post('/:rusheeId/tags', rusheeController.addTag); // Add a tag to a Rushee
router.delete('/:rusheeId/tags', rusheeController.removeTag); // Remove a tag from a Rushee
router.get('/:rusheeId', rusheeController.getRusheeById);
router.delete('/:rusheeId', rusheeController.deleteRushee);
router.post('/:rusheeId/notes', rusheeController.addNote);
router.patch('/:rusheeId/status', rusheeController.updateStatus);
router.post('/:rusheeId/notes/:noteIndex/upvote', rusheeController.upvoteNote); // Upvote a note
router.post('/:rusheeId/notes/:noteIndex/downvote', rusheeController.downvoteNote); // Downvote a note
router.delete('/:rusheeId/notes/:noteIndex/vote', rusheeController.removeVote); // Remove vote from a note

module.exports = router;