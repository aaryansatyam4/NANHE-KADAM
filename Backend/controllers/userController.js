const User = require('../models/usermodel');
const mongoose = require('mongoose');

exports.getCurrentUser = async (req, res) => {
  const userId = req.cookies.userId;
  if (!userId) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const photoUrl = user.photo ? `http://localhost:3001/${user.photo}` : null;
    res.json({ ...user._doc, photoUrl: photoUrl || 'default-url' });
  } catch (err) {
    res.status(500).json({ message: 'Internal error', error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  const userId = req.params.userId;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID format' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Internal error', error: err.message });
  }
};
