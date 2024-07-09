const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');

router.get('/search', eventController.searchEvents);
router.post('/', auth, eventController.createEvent);
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);
router.put('/:id', auth, eventController.updateEvent);
router.delete('/:id', auth, eventController.deleteEvent);
router.post('/:id/attend', auth, eventController.addAttendee);
router.delete('/:id/attend', auth, eventController.removeAttendee);

module.exports = router;
