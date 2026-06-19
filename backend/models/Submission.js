const mongoose = require('mongoose');

const categoryResultSchema = new mongoose.Schema({
  category: { type: String },
  result: { type: String },
  confidence: { type: Number },
  reasoning: { type: String }
});

const verdictSchema = new mongoose.Schema({
  imageUrl: { type: String },
  outcome: { type: String, enum: ['Approved', 'Flagged', 'Blocked'] },
  categoryBreakdown: [categoryResultSchema]
});

const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  verdicts: [verdictSchema],
  overallOutcome: { type: String, enum: ['Approved', 'Flagged', 'Blocked'] },
  policySnapshot: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);