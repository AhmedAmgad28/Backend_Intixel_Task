const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');

router.get('/search', eventController.searchEvents); // Search events
router.post('/', auth, eventController.createEvent); // Create an event
router.get('/', eventController.getAllEvents); // Get all events
router.get('/:id', eventController.getEventById); // Get event by ID
router.put('/:id', auth, eventController.updateEvent); // Update event
router.delete('/:id', auth, eventController.deleteEvent); // Delete event
router.post('/:id/attend', auth, eventController.addAttendee); // Add attendee to event
router.delete('/:id/attend', auth, eventController.removeAttendee); // Remove attendee from event

module.exports = router;
