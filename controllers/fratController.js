// controllers/fratController.js
const Frat = require('../models/frat');
const { formatForUrl } = require('../utils/urlFormat'); // Adjust path if necessary

const fratController = {
  // Create new fraternity
  createFrat: async (req, res) => {
    try {
      const { name, university, chapterDesignation, contactEmail, contactPhone } = req.body;
      
      const frat = new Frat({
        name,
        university,
        chapterDesignation,
        contactEmail,
        contactPhone
      });

      await frat.save();
      
      res.status(201).json({
        success: true,
        data: frat,
        formattedName: frat.getFormattedName()
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  getFratByUrlName: async (req, res) => {
    try {
      console.log("Request received for fraternity by URL:", req.params.urlName);
  
      const frats = await Frat.find();
      console.log("All Fraternities:", frats);
  
      const frat = frats.find(f =>
        formatForUrl(f.name) === req.params.urlName ||
        formatForUrl(`${f.name} ${f.university}`) === req.params.urlName
      );
  
      if (!frat) {
        console.log("Fraternity not found for URL:", req.params.urlName);
        return res.status(404).json({ error: "Fraternity not found" });
      }
  
      console.log("Fraternity Found:", frat);
      res.json({ success: true, data: frat });
    } catch (error) {
      console.error("Error processing fraternity by URL:", error);
      res.status(400).json({ error: "Bad Request", details: error.message });
    }
  },

  getFratById: async (req, res) => {
    try {
      console.log("Fetching fraternity with ID:", req.params.id); // Log the incoming ID
      const frat = await Frat.findById(req.params.id);
      if (!frat) {
        console.log("No fraternity found for ID:", req.params.id);
        return res.status(404).json({ error: 'Fraternity not found' });
      }
      console.log("Fraternity fetched successfully:", frat); // Log the fetched fraternity
      res.json({ data: frat });
    } catch (error) {
      console.error("Error fetching fraternity:", error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update contact information
  updateContactInfo: async (req, res) => {
    try {
      const { fratId } = req.params;
      const { contactEmail, contactPhone } = req.body;

      const frat = await Frat.findByIdAndUpdate(
        fratId,
        { contactEmail, contactPhone },
        { new: true, runValidators: true }
      );

      if (!frat) {
        return res.status(404).json({
          success: false,
          error: 'Fraternity not found'
        });
      }

      res.json({
        success: true,
        data: frat
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  // Update brothers array
  updateBrothers: async (req, res) => {
    try {
      const { fratId } = req.params;
      const { brothers } = req.body; // Array of brother IDs

      const frat = await Frat.findByIdAndUpdate(
        fratId,
        { brothers },
        { new: true, runValidators: true }
      );

      if (!frat) {
        return res.status(404).json({
          success: false,
          error: 'Fraternity not found'
        });
      }

      res.json({
        success: true,
        data: frat
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  // Update president
  updatePresident: async (req, res) => {
    try {
      const { fratId } = req.params;
      const { presidentId } = req.body;

      // Verify that the president is in the brothers array
      const frat = await Frat.findById(fratId);
      if (!frat) {
        return res.status(404).json({
          success: false,
          error: 'Fraternity not found'
        });
      }

      if (!frat.brothers.includes(presidentId)) {
        return res.status(400).json({
          success: false,
          error: 'President must be a brother of the fraternity'
        });
      }

      frat.president = presidentId;
      await frat.save();

      res.json({
        success: true,
        data: frat
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },
  // Add a tag to the fraternity's acceptable tags
  addTag: async (req, res) => {
    try {
      const { fratId } = req.params;
      const { tag } = req.body;

      if (!tag || typeof tag !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Tag must be a non-empty string',
        });
      }

      const frat = await Frat.findById(fratId);
      if (!frat) {
        return res.status(404).json({
          success: false,
          error: 'Fraternity not found',
        });
      }

      if (frat.tags.includes(tag)) {
        return res.status(400).json({
          success: false,
          error: 'Tag already exists',
        });
      }

      frat.tags.push(tag);
      await frat.save();

      res.json({
        success: true,
        data: frat.tags,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  // Remove a tag from the fraternity's acceptable tags
  removeTag: async (req, res) => {
    try {
      const { fratId } = req.params;
      const { tag } = req.body;

      const frat = await Frat.findById(fratId);
      if (!frat) {
        return res.status(404).json({
          success: false,
          error: 'Fraternity not found',
        });
      }

      const tagIndex = frat.tags.indexOf(tag);
      if (tagIndex === -1) {
        return res.status(400).json({
          success: false,
          error: 'Tag not found',
        });
      }

      frat.tags.splice(tagIndex, 1);
      await frat.save();

      res.json({
        success: true,
        data: frat.tags,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  // Get all acceptable tags for a fraternity
  getTags: async (req, res) => {
    try {
      const { fratId } = req.params;

      const frat = await Frat.findById(fratId);
      if (!frat) {
        return res.status(404).json({
          success: false,
          error: 'Fraternity not found',
        });
      }

      res.json({
        success: true,
        data: frat.tags,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
  // Get formatted name
  getFormattedName: async (req, res) => {
    try {
      const { fratId } = req.params;
      
      const frat = await Frat.findById(fratId);
      if (!frat) {
        return res.status(404).json({
          success: false,
          error: 'Fraternity not found'
        });
      }

      res.json({
        success: true,
        formattedName: frat.getFormattedName()
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = fratController;