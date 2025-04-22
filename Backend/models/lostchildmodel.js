const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LostChildSchema = new mongoose.Schema({
  submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },  // ✅ FIXED
  childName: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  email: { type: String, required: true },
  lastSeenLocation: { type: String, required: true },
  description: { type: String },
  guardianName: { type: String, required: true },
  contactInfo: { type: String, required: true },
  additionalComments: { type: String },
  childPhoto: { type: String },
  lastSeenDate: { type: Date, default: Date.now },
  founded: { type: Boolean, default: false },
  read: { type: Boolean, default: false },
});

module.exports = mongoose.model('LostChild', LostChildSchema);
