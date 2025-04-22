const User = require('../models/usermodel');
const bcrypt = require('bcrypt');

exports.registerUser = async (req, res) => {
  const { name, email, category, password, id } = req.body;
  if (!name || !email || !category || !password || !req.file) {
    return res.status(400).json({ message: 'All fields and photo are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      category,
      password: hashedPassword,
      id,
      photo: req.file.filename,
    });
    const savedUser = await newUser.save();
    res.status(200).json({ message: 'User registered successfully', user: savedUser });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    res.cookie('userId', user._id, { httpOnly: true });
    res.status(200).json({ message: 'Login successful', userId: user._id, category: user.category });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
