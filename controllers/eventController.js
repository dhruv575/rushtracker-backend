// controllers/eventController.js
const Event = require('../models/event');
const Brother = require('../models/brother');
const Rushee = require('../models/rushee');
const { formatForUrl } = require('../utils/urlFormat'); // Adjust path if necessary

const eventController = {
  // Create a new event
  createEvent: async (req, res) => {
    try {
      const { 
        name, 
        start, 
        end, 
        location, 
        brotherForm, 
        rusheeForm 
      } = req.body;

      // Validate that end is after start
      if (new Date(end) <= new Date(start)) {
        return res.status(400).json({
          success: false,
          error: 'Event end time must be after start time'
        });
      }

      const event = new Event({
        name,
        fraternity: req.brother.frat,
        start,
        end,
        location,
        brotherForm,
        rusheeForm
      });

      await event.save();

      res.status(201).json({
        success: true,
        data: event
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  getEventByUrlName: async (req, res) => {
    try {
      const { urlName } = req.params;
      const { fratId } = req.query;

      console.log("Request received for event by URL:", req.params.urlName, req.query);

      // Search for event by converting name to URL format and comparing
      const events = await Event.find({ fraternity: fratId });
      const event = events.find(e => formatForUrl(e.name) === urlName);
  
      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        });
      }
  
      res.json({
        success: true,
        data: event
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  getEventByName: async (req, res) => {
    try {
      const { name } = req.query;
      if (!name) {
        return res.status(400).json({ success: false, error: "Event name is required" });
      }
  
      const event = await Event.findOne({ name: { $regex: new RegExp(name, 'i') } }); // Case-insensitive search
      if (!event) {
        return res.status(404).json({ success: false, error: "Event not found" });
      }
  
      res.json({ success: true, data: event });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get all events with optional date filtering
  getAllEvents: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const query = { fraternity: req.brother.frat };

      // Add date range filter if provided
      if (startDate || endDate) {
        query.start = {};
        if (startDate) query.start.$gte = new Date(startDate);
        if (endDate) query.start.$lte = new Date(endDate);
      }

      const events = await Event.find(query)
        .sort({ start: 1 })
        .populate('brotherSubmissions.brother', 'name email')
        .populate('rusheeSubmissions.rushee', 'name email');

      res.json({
        success: true,
        data: events
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get single event details
// Update in eventController.js
getEventById: async (req, res) => {
  try {
    const { fraternity } = req.query;

    if (!fraternity) {
      return res.status(400).json({
        success: false,
        error: 'Fraternity is required'
      });
    }

    const event = await Event.findOne({
        _id: req.params.eventId,
        fraternity
      })
        .populate('brotherSubmissions.brother', 'name email')
        .populate('rusheeSubmissions.rushee', 'name email');

      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        });
      }

      res.json({
        success: true,
        data: event
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  // Update event details
  updateEvent: async (req, res) => {
    try {
      const { name, start, end, location } = req.body;

      // Validate that end is after start if both are provided
      if (start && end && new Date(end) <= new Date(start)) {
        return res.status(400).json({
          success: false,
          error: 'Event end time must be after start time'
        });
      }

      const event = await Event.findOneAndUpdate(
        {
          _id: req.params.eventId,
          fraternity: req.brother.frat
        },
        { name, start, end, location },
        { new: true, runValidators: true }
      );

      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        });
      }

      res.json({
        success: true,
        data: event
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  // Submit brother form
  submitBrotherForm: async (req, res) => {
    try {
      const { responses } = req.body;
      
      // Find the event
      const event = await Event.findOne({
        _id: req.params.eventId,
        fraternity: req.brother.frat
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        });
      }

      // Find the brother
      const brother = await Brother.findById(req.brother._id);
      if (!brother) {
        return res.status(404).json({
          success: false,
          error: 'Brother not found'
        });
      }

      // Update event submissions
      const existingSubmission = event.brotherSubmissions.find(
        submission => submission.brother.toString() === req.brother._id.toString()
      );

      if (existingSubmission) {
        // Update existing submission
        existingSubmission.responses = JSON.stringify(responses);
      } else {
        // Add new submission
        event.brotherSubmissions.push({
          brother: req.brother._id,
          responses: JSON.stringify(responses)
        });
      }

      // Update brother's eventsAttended if not already there
      if (!brother.eventsAttended.includes(event._id)) {
        brother.eventsAttended.push(event._id);
      }

      // Save both documents
      await Promise.all([
        event.save(),
        brother.save()
      ]);

      res.json({
        success: true,
        data: event
      });
    } catch (error) {
      console.error('Error in submitBrotherForm:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to submit form'
      });
    }
  },

  // Submit rushee form
  submitRusheeForm: async (req, res) => {
    try {
      const { rusheeId, responses } = req.body;
      const { fraternity } = req.query;  // Get fraternity from query instead of req.brother

      if (!fraternity) {
        return res.status(400).json({
          success: false,
          error: 'Fraternity is required'
        });
      }

      const event = await Event.findOne({
        _id: req.params.eventId,
        fraternity
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        });
      }

      // Verify rushee exists and belongs to this fraternity
      const rushee = await Rushee.findOne({
        _id: rusheeId,
        fraternity
      });
      
      if (!rushee) {
        return res.status(404).json({
          success: false,
          error: 'Rushee not found'
        });
      }

      // Check if rushee has already submitted
      const existingSubmission = event.rusheeSubmissions.find(
        submission => submission.rushee.toString() === rusheeId
      );

      if (existingSubmission) {
        // Update existing submission
        existingSubmission.responses = JSON.stringify(responses);
      } else {
        // Add new submission
        event.rusheeSubmissions.push({
          rushee: rusheeId,
          responses: JSON.stringify(responses)
        });

        // Add event to rushee's attended events if not already there
        if (!rushee.eventsAttended.includes(event._id)) {
          rushee.eventsAttended.push(event._id);
          await rushee.save();
        }
      }

      await event.save();

      res.json({
        success: true,
        data: event
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get event attendees
  getEventAttendees: async (req, res) => {
    try {
      const event = await Event.findOne({
        _id: req.params.eventId,
        fraternity: req.brother.frat
      })
        .populate('brotherSubmissions.brother', 'name email major year')
        .populate('rusheeSubmissions.rushee', 'name email major year');

      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        });
      }

      const attendees = {
        brothers: event.brotherSubmissions.map(sub => sub.brother),
        rushees: event.rusheeSubmissions.map(sub => sub.rushee)
      };

      res.json({
        success: true,
        data: attendees
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get submissions by type (brother or rushee)
// Update in eventController.js
  getEventSubmissions: async (req, res) => {
    try {
      const { type } = req.query; // 'brother' or 'rushee'
      const fraternity = req.query.fraternity || (req.brother && req.brother.frat);

      if (!['brother', 'rushee'].includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid submission type'
        });
      }

      if (!fraternity) {
        return res.status(400).json({
          success: false,
          error: 'Fraternity is required'
        });
      }

      const event = await Event.findOne({
        _id: req.params.eventId,
        fraternity
      })
      .populate(
        type === 'brother' ? 'brotherSubmissions.brother' : 'rusheeSubmissions.rushee',
        'name email'
      );

      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        });
      }

      const submissions = type === 'brother' 
        ? event.brotherSubmissions 
        : event.rusheeSubmissions;

      res.json({
        success: true,
        data: submissions
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = eventController;