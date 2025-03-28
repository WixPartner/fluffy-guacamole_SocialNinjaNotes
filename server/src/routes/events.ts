import express from 'express';
import { isAuthenticated } from '../middleware/auth';
import Event from '../models/event';

const router = express.Router();

// Get all events for the authenticated user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user._id });
    return res.json(events);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching events', error });
  }
});

// Create a new event
router.post('/', isAuthenticated, async (req, res) => {
  try {
    console.log('Creating event with body:', req.body);
    console.log('User from request:', req.user);
    
    const { title, start, end, description, color } = req.body;
    
    if (!title || !start || !end) {
      return res.status(400).json({ 
        message: 'Error creating event', 
        error: 'Missing required fields: title, start, or end' 
      });
    }
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        message: 'Error creating event', 
        error: 'User not authenticated properly' 
      });
    }
    
    const event = new Event({
      title,
      start,
      end,
      description,
      color,
      createdBy: req.user._id,
    });
    
    await event.save();
    return res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    return res.status(400).json({ message: 'Error creating event', error });
  }
});

// Update an event
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    console.log('Updating event with body:', req.body);
    console.log('User from request:', req.user);
    
    const { title, start, end, description, color } = req.body;
    
    if (!title || !start || !end) {
      return res.status(400).json({ 
        message: 'Error updating event', 
        error: 'Missing required fields: title, start, or end' 
      });
    }
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        message: 'Error updating event', 
        error: 'User not authenticated properly' 
      });
    }
    
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { title, start, end, description, color },
      { new: true }
    );
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    return res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    return res.status(400).json({ message: 'Error updating event', error });
  }
});

// Delete an event
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    return res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    return res.status(400).json({ message: 'Error deleting event', error });
  }
});

export default router; 