const Rushee = require('../models/rushee');
const { RUSHEE_STATUS } = require('../models/types');

const rusheeController = {
  // Create a new Rushee
  createRushee: async (req, res) => {
    try {
      const { name, email, phone, major, year, gpa, picture, resume, rushCycle, fraternity } = req.body;

      // Check if a Rushee with the email and fraternity already exists
      const existingRushee = await Rushee.findOne({ email, fraternity });
      if (existingRushee) {
        return res.status(400).json({ success: false, error: 'Email already registered for this fraternity' });
      }

      const rushee = new Rushee({ name, email, phone, major, year, gpa, picture, resume, rushCycle, fraternity });
      await rushee.save();

      res.status(201).json({ success: true, data: rushee });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // Get all Rushees for a fraternity
  getAllRushees: async (req, res) => {
    try {
      const { fraternity } = req.query;

      if (!fraternity) {
        return res.status(400).json({ success: false, error: 'Fraternity is required' });
      }

      const rushees = await Rushee.find({ fraternity })
        .populate('eventsAttended', 'name start end location')
        .populate('notes.author', 'name email'); // Populate author details in notes

      res.json({ success: true, data: rushees });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // Get a single Rushee by ID and fraternity
  getRusheeById: async (req, res) => {
    try {
      const { fraternity } = req.query;

      if (!fraternity) {
        return res.status(400).json({ success: false, error: 'Fraternity is required' });
      }

      const rushee = await Rushee.findOne({ _id: req.params.rusheeId, fraternity })
        .populate({
          path: 'eventsAttended',
          select: 'name start end location rusheeForm rusheeSubmissions',
          populate: {
            path: 'rusheeSubmissions.rushee',
            select: 'name email',
          },
        })
        .populate('notes.author', 'name email');

      if (!rushee) {
        return res.status(404).json({ success: false, error: 'Rushee not found for this fraternity' });
      }

      res.json({ success: true, data: rushee });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // Update Rushee details
  updateRushee: async (req, res) => {
    try {
      const { fraternity } = req.query;
      const allowedUpdates = ['name', 'phone', 'major', 'year', 'gpa', 'summary', 'status', 'picture', 'resume'];
      const updates = Object.keys(req.body)
        .filter((key) => allowedUpdates.includes(key))
        .reduce((obj, key) => {
          obj[key] = req.body[key];
          return obj;
        }, {});

      if (!fraternity) {
        return res.status(400).json({ success: false, error: 'Fraternity is required' });
      }

      const rushee = await Rushee.findOneAndUpdate(
        { _id: req.params.rusheeId, fraternity },
        updates,
        { new: true, runValidators: true }
      );

      if (!rushee) {
        return res.status(404).json({ success: false, error: 'Rushee not found for this fraternity' });
      }

      res.json({ success: true, data: rushee });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  onboardingUpdate: async (req, res) => {
    try {
      const { fratId } = req.params;
      const { phone, major, year, gpa, resume, picture } = req.body;
      const { email } = req.rushee; // Assuming rushee info is attached by middleware
  
      // Find the rushee by email and fraternity
      const rushee = await Rushee.findOne({ 
        email,
        fraternity: fratId
      });
  
      if (!rushee) {
        return res.status(404).json({
          success: false,
          error: 'Rushee not found'
        });
      }
  
      // Update the rushee information
      rushee.phone = phone;
      rushee.major = major;
      rushee.year = parseInt(year);
      if (gpa) rushee.gpa = parseFloat(gpa);
      if (resume) rushee.resume = resume;
      if (picture) rushee.picture = picture;
  
      await rushee.save();
  
      res.json({
        success: true,
        data: rushee
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  // Delete a Rushee by ID and fraternity
  deleteRushee: async (req, res) => {
    try {
      const { fraternity } = req.query;

      if (!fraternity) {
        return res.status(400).json({ success: false, error: 'Fraternity is required' });
      }

      const rushee = await Rushee.findOneAndDelete({ _id: req.params.rusheeId, fraternity });
      if (!rushee) {
        return res.status(404).json({ success: false, error: 'Rushee not found for this fraternity' });
      }
      res.json({ success: true, message: 'Rushee deleted successfully' });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // Search for a Rushee by email and fraternity
  findRusheeByEmail: async (req, res) => {
    try {
      const { email, fraternity } = req.query;

      if (!email || !fraternity) {
        return res.status(400).json({ success: false, error: 'Email and fraternity are required' });
      }

      const rushee = await Rushee.findOne({ email, fraternity });

      if (!rushee) {
        return res.status(404).json({ success: false, error: 'Rushee not found for this fraternity' });
      }

      res.json({ success: true, data: rushee });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const rusheeId = req.params.rusheeId;
  
      if (!status) {
        return res.status(400).json({ success: false, error: 'Status is required' });
      }
  
      const rushee = await Rushee.findByIdAndUpdate(
        rusheeId,
        { status },
        { new: true, runValidators: true }
      );
  
      if (!rushee) {
        return res.status(404).json({ success: false, error: 'Rushee not found' });
      }
  
      res.json({ success: true, data: rushee });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },  

  // Add a note to a Rushee
  addNote: async (req, res) => {
    try {
      const { fraternity } = req.query;
      const { content, isAnonymous } = req.body;

      if (!fraternity) {
        return res.status(400).json({ success: false, error: 'Fraternity is required' });
      }

      if (!content) {
        return res.status(400).json({ success: false, error: 'Note content is required' });
      }

      const rushee = await Rushee.findOne({ _id: req.params.rusheeId, fraternity });
      if (!rushee) {
        return res.status(404).json({ success: false, error: 'Rushee not found for this fraternity' });
      }

      rushee.notes.push({
        content,
        author: isAnonymous ? '68a3bb6f52011fec8272d474' : req.brother._id,
      });

      await rushee.save();
      const populatedRushee = await rushee.populate('notes.author', 'name email');
      res.json({ success: true, data: populatedRushee });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },
  addTag: async (req, res) => {
    try {
      const { rusheeId } = req.params;
      const { tag } = req.body;
  
      if (!tag || typeof tag !== 'string') {
        return res.status(400).json({ success: false, error: 'Tag must be a non-empty string' });
      }
  
      const rushee = await Rushee.findById(rusheeId);
      if (!rushee) {
        return res.status(404).json({ success: false, error: 'Rushee not found' });
      }
  
      if (rushee.tags.includes(tag)) {
        return res.status(400).json({ success: false, error: 'Tag already exists for the Rushee' });
      }
  
      rushee.tags.push(tag);
      await rushee.save();
  
      res.json({ success: true, data: rushee.tags });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
  removeTag: async (req, res) => {
    try {
      const { rusheeId } = req.params;
      const { tag } = req.body;
  
      const rushee = await Rushee.findById(rusheeId);
      if (!rushee) {
        return res.status(404).json({ success: false, error: 'Rushee not found' });
      }
  
      const tagIndex = rushee.tags.indexOf(tag);
      if (tagIndex === -1) {
        return res.status(400).json({ success: false, error: 'Tag not found for the Rushee' });
      }
  
      rushee.tags.splice(tagIndex, 1);
      await rushee.save();
  
      res.json({ success: true, data: rushee.tags });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
  getTags: async (req, res) => {
    try {
      const { rusheeId } = req.params;
  
      const rushee = await Rushee.findById(rusheeId);
      if (!rushee) {
        return res.status(404).json({ success: false, error: 'Rushee not found' });
      }
  
      res.json({ success: true, data: rushee.tags });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
      
};

module.exports = rusheeController;
