const mongoose = require('mongoose');

const MissingChildSchema = new mongoose.Schema({
  parentName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  childName: { type: String, required: true },
  email: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  lastSeen: { type: String, required: true },
  description: { type: String, required: true },
  childPhoto: { type: String },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ✅ FIXED
  dateReported: { type: Date, default: Date.now },
  adopted: { type: Boolean, default: false },
  founded: { type: Boolean, default: false },
  parent_founded: { type: Boolean, default: false }
});

module.exports = mongoose.model('MissingChild', MissingChildSchema);
