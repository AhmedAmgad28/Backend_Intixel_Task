const Event = require('../models/event');
const User = require('../models/user');
const Comment = require('../models/comment');

// Create an event
exports.createEvent = async (req, res) => {
  const { name, description, location, dateAndTime } = req.body;

  try {
    // Check if there's an existing event at the same time by the same organizer
    const conflictingEvent = await Event.findOne({
      organizerID: req.user.id,
      dateAndTime: dateAndTime
    });

    if (conflictingEvent) {
      return res.status(400).json({ msg: 'An event by this organizer already exists at the same time.' });
    }

    const newEvent = new Event({
      name,
      description,
      location,
      dateAndTime,
      organizerID: req.user.id
    });

    const event = await newEvent.save(); // Save new event to database
    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('organizerID', 'name');
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizerID', 'name');

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
    // Search for an event with typed id
    const event = await Event.findById(req.params.id);

    // Check if the event exists
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    // Check if the user is the orgainzer created the event
    if (event.organizerID.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Check if there is an existing event at the same time by the same organizer (excluding the current event)
    const conflictingEvent = await Event.findOne({
      organizerID: req.user.id,
      dateAndTime: dateAndTime,
      _id: { $ne: req.params.id }
    });

    if (conflictingEvent) {
      return res.status(400).json({ msg: 'An event by this organizer already exists at the same time.' });
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

    // Check if the event exists
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    // Check if the user is the orgainzer created the event
    if (event.organizerID.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Delete associated comments
    await Comment.deleteMany({ eventID: req.params.id });

    // Delete the event
    await Event.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Event removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Add attendee to event
exports.addAttendee = async (req, res) => {
  try {
    // Find the event by ID
    const event = await Event.findById(req.params.id);

    // Check if the event exists
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    // Find the user by ID
    const user = await User.findById(req.user.id);

    // Check if the user exists and retrieve their role
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if the user is an organizer
    if (user.role === 'organizer') {
      return res.status(400).json({ msg: 'Organizers cannot attend events' });
    }

    // Check if the user is already an attendee
    if (event.attendees.includes(req.user.id)) {
      return res.status(400).json({ msg: 'User already attending the event' });
    }

    // Add user ID to the attendees list
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

    // Check if the event exists
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    // Check if the user has already not attending the event
    const attendeeIndex = event.attendees.indexOf(req.user.id);
    if (attendeeIndex === -1) {
      return res.status(400).json({ msg: 'User not attending the event' });
    }

    // Remove customer id from the attendees list
    event.attendees.splice(attendeeIndex, 1);
    await event.save();

    res.json(event.attendees);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Search events by various criteria
exports.searchEvents = async (req, res) => {
  try {
    const { name, location, date, organizer } = req.query;

    let query = {};

    // Check if the 'name' query parameter is provided
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    // Check if the 'location' query parameter is provided
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Check if the 'date' query parameter is provided
    if (date) {
      // Extract the date portion from the provided date string
      const eventDate = date.split('T')[0];

      // Construct the start and end dates for the specified event date
      const startDate = new Date(`${eventDate}T00:00:00Z`);
      const endDate = new Date(`${eventDate}T23:59:59Z`);

      // Construct the date range query for the given day
      query.dateAndTime = { $gte: startDate, $lte: endDate };
    }

    // Check if the 'organizer' query parameter is provided
    if (organizer) {
      // Find the organizer user with a case-insensitive name match and role of 'organizer'
      const organizerUser = await User.findOne({
        name: { $regex: organizer, $options: 'i' },
        role: 'organizer',
      });

      if (organizerUser) {
        query.organizerID = organizerUser._id;
      } else {
        return res.status(404).json({ message: 'Organizer not found' });
      }
    }

    // Find events that match the constructed query and populate the 'organizerID' field with 'name'
    const events = await Event.find(query).populate('organizerID', 'name');

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};