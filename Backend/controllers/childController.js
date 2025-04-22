const path = require('path');
const { spawn } = require('child_process');
const mongoose = require('mongoose');

const MissingChild = require('../models/missingchild');
const LostChild = require('../models/lostchildmodel');
const { sendMatchEmail, sendMatchNotificationToGuardians } = require('../utils/faceMatch');

// ------------------------ ADD MISSING CHILD ------------------------
exports.addMissingChild = async (req, res) => {
  const { parentName, contactNumber, childName, email, age, gender, lastSeen, description } = req.body;
  const childPhoto = req.file ? req.file.filename : null;
  const userId = req.cookies.userId;

  if (!userId) return res.status(401).json({ message: 'User not authenticated' });

  try {
    const newChild = new MissingChild({
      parentName,
      contactNumber,
      childName,
      email,
      age,
      gender,
      lastSeen,
      description,
      childPhoto,
      submittedBy: userId
    });

    const savedChild = await newChild.save();

    const missingPhotoPath = path.join(__dirname, '../reported', childPhoto);
    const missingFolderPath = path.join(__dirname, '../missing');

    const pythonProcess = spawn('python', [
      './python/ReportedFaceRecog.py',
      missingPhotoPath,
      missingFolderPath,
      age.toString(),
      gender.toString()
    ]);

    let output = '';
    pythonProcess.stdout.on('data', data => output += data.toString());
    pythonProcess.stderr.on('data', data => console.error(`stderr: ${data}`));

    pythonProcess.on('close', async (code) => {
      if (code !== 0) return res.status(500).json({ message: 'Face recognition script failed' });

      try {
        const matches = JSON.parse(output);
        if (matches.length > 0) {
          const lostChildData = {
            ...req.body,
            _id: savedChild._id,
            childPhoto: savedChild.childPhoto || 'default.jpg'
          };
          await sendMatchNotificationToGuardians(lostChildData, matches);
          return res.status(200).json({ message: 'Match found, email sent to guardians', matches });
        } else {
          return res.status(200).json({ message: 'Missing child added, no match found' });
        }
      } catch (err) {
        return res.status(500).json({ message: 'Error parsing Python output', error: err.message });
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Error saving child', error: err.message });
  }
};

// ------------------------ ADD LOST CHILD ------------------------
exports.addLostChild = async (req, res) => {
  const { childName, age, gender, email, lastSeenLocation, description, guardianName, contactInfo, additionalComments } = req.body;
  const childPhoto = req.file ? req.file.filename : null;
  const userId = req.cookies.userId;

  if (!userId) return res.status(401).json({ message: 'User not authenticated' });

  try {
    const newLostChild = new LostChild({
      submittedBy: userId,
      childName,
      age,
      gender,
      email,
      lastSeenLocation,
      description,
      guardianName,
      contactInfo,
      additionalComments,
      childPhoto
    });

    const savedLostChild = await newLostChild.save();

    const missingPhotoPath = path.join(__dirname, '../missing', childPhoto);
    const reportedFolderPath = path.join(__dirname, '../reported');

    const pythonProcess = spawn('python', [
      './python/Facerecog.py',
      missingPhotoPath,
      reportedFolderPath,
      age.toString(),
      gender.toString()
    ]);

    let output = '';
    pythonProcess.stdout.on('data', data => output += data.toString());
    pythonProcess.stderr.on('data', data => console.error(`stderr: ${data}`));

    pythonProcess.on('close', async (code) => {
      if (code !== 0) return res.status(500).json({ message: 'Face recognition failed' });

      try {
        const matches = JSON.parse(output);
        if (matches.length > 0) {
          await sendMatchEmail(savedLostChild._id, matches);
          return res.status(200).json({ message: 'Match found, email sent to guardian', matches });
        } else {
          return res.status(200).json({ message: 'Lost child added, no match found' });
        }
      } catch (err) {
        return res.status(500).json({ message: 'Error parsing output', error: err.message });
      }
    });

  } catch (err) {
    return res.status(500).json({ message: 'Error saving lost child', error: err.message });
  }
};

// ------------------------ GET ALL LOST CHILDREN ------------------------
exports.getAllLostChildren = async (req, res) => {
  try {
    const lostChildren = await LostChild.find().populate('submittedBy', 'name');
    res.status(200).json(lostChildren);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching lost children', error: err.message });
  }
};

// ------------------------ GET ALL MISSING CHILDREN ------------------------
exports.getAllMissingChildren = async (req, res) => {
  try {
    const missing = await MissingChild.find().populate('submittedBy', 'name');
    res.status(200).json(missing);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching missing children', error: err.message });
  }
};

// ------------------------ GET LOST COUNT BY USER ------------------------
exports.getLostChildCountByUser = async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    const count = await LostChild.countDocuments({ submittedBy: userId });
    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching count', error: err.message });
  }
};

// ------------------------ GET MISSING BY USER ------------------------
exports.getMissingChildrenByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const data = await MissingChild.find({ submittedBy: userId });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching missing children', error: err.message });
  }
};

// ------------------------ CLOSE CASE ------------------------
exports.closeCase = async (req, res) => {
  const { founded } = req.body;
  const childId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(childId)) {
    return res.status(400).json({ message: 'Invalid child ID' });
  }

  try {
    const updated = await LostChild.findByIdAndUpdate(childId, { founded }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Child not found' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error closing case', error: err.message });
  }
};

// ------------------------ GET UNADOPTED CHILDREN ------------------------
exports.getUnadoptedChildren = async (req, res) => {
  try {
    const children = await MissingChild.find({ adopted: false, founded: false });
    if (!children.length) return res.status(404).json({ message: 'No unadopted children found' });
    res.status(200).json(children);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching unadopted children', error: err.message });
  }
};

// ------------------------ GET RESCUE STATS ------------------------
exports.getRescueStats = async (req, res) => {
  try {
    const rescuesDone = await LostChild.countDocuments({ founded: true });
    const rescuesRemaining = await LostChild.countDocuments({ founded: false });
    res.status(200).json({ rescuesDone, rescuesRemaining });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching rescue data', error: err.message });
  }
};
