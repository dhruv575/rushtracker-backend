// routes/events.js
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { auth } = require('../middleware/auth');

// Public routes
router.get('/by-url/:urlName', eventController.getEventByUrlName);
router.get('/:eventId', eventController.getEventById); // Made public
router.post('/:eventId/submit/rushee', eventController.submitRusheeForm);

// Protected routes
router.use(auth);
router.get('/', (req, res, next) => {
  if (req.query.name) {
    return eventController.getEventByName(req, res);
  }
  return eventController.getAllEvents(req, res);
});
router.post('/', eventController.createEvent);
router.patch('/:eventId', eventController.updateEvent);
router.post('/:eventId/submit/brother', eventController.submitBrotherForm);
router.get('/:eventId/attendees', eventController.getEventAttendees);
router.get('/:eventId/submissions', eventController.getEventSubmissions);

module.exports = router;