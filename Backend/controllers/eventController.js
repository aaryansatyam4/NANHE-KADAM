const Event = require('../models/eventmodel');


exports.createEvent = async (req, res) => {
  const { title, date, location, time, objectives } = req.body;
  const submittedBy = req.cookies.userId;

  if (!submittedBy) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const event = new Event({
      title,
      date,
      location,
      time,
      objectives,
      submittedBy,
      approved: true 
    });

    const saved = await event.save();
    res.status(201).json({ message: 'Event created and approved', event: saved });
  } catch (err) {
    res.status(500).json({ message: 'Event creation error', error: err.message });
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('submittedBy', 'name email'); // Optional: populate user
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: 'Fetch error', error: err.message });
  }
};
