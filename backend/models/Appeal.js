const mongoose = require('mongoose');

const appealSchema = new mongoose.Schema({
  submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  justification: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
  adminResponse: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Appeal', appealSchema);