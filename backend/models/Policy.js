const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  category: {
    type: String,
    enum: [
      'Graphic Violence',
      'Hate Symbols',
      'Self-Harm',
      'Extremist Propaganda',
      'Weapons & Contraband',
      'Harassment & Humiliation'
    ],
    required: true,
    unique: true
  },
  enabled: { type: Boolean, default: true },
  confidenceThreshold: { type: Number, default: 70 },
  enforcementBehavior: { type: String, enum: ['Auto-Block', 'Flag for Review'], default: 'Flag for Review' }
}, { timestamps: true });

module.exports = mongoose.model('Policy', policySchema);