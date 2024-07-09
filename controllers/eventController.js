// controllers/eventController.js
const Event = require('../models/event');
const User = require('../models/user');

// Create an event
exports.createEvent = async (req, res) => {
  const { name, description, location, dateAndTime } = req.body;

  try {
    const newEvent = new Event({
      name,
      description,
      location,
      dateAndTime,
      organizerID: req.user.id
    });

    const event = await newEvent.save();
    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('organizerID', 'name email');
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizerID', 'name email');

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  const { name, description, location, dateAndTime } = req.body;

  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    if (event.organizerID.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    event.name = name || event.name;
    event.description = description || event.description;
    event.location = location || event.location;
    event.dateAndTime = dateAndTime || event.dateAndTime;

    await event.save();
    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    if (event.organizerID.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await event.remove();
    res.json({ msg: 'Event removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Add attendee to event
exports.addAttendee = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    if (event.attendees.includes(req.user.id)) {
      return res.status(400).json({ msg: 'User already attending the event' });
    }

    event.attendees.push(req.user.id);
    await event.save();

    res.json(event.attendees);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Remove attendee from event
exports.removeAttendee = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    const attendeeIndex = event.attendees.indexOf(req.user.id);
    if (attendeeIndex === -1) {
      return res.status(400).json({ msg: 'User not attending the event' });
    }

    event.attendees.splice(attendeeIndex, 1);
    await event.save();

    res.json(event.attendees);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.searchEvents = async (req, res) => {
  try {
      const { name, location, date, organizer } = req.query;

      let query = {};

      if (name) {
          query.name = { $regex: name, $options: 'i' };
      }

      if (location) {
          query.location = { $regex: location, $options: 'i' };
      }

      if (date) {
          query.dateAndTime = { $gte: new Date(date), $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)) };
      }

      if (organizer) {
          const organizerUser = await User.findOne({ name: { $regex: organizer, $options: 'i' }, role: 'organizer' });
          if (organizerUser) {
              query.organizerID = organizerUser._id;
          } else {
              return res.status(404).json({ message: 'Organizer not found' });
          }
      }

      const events = await Event.find(query).populate('organizerID', 'name');

      res.status(200).json(events);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};