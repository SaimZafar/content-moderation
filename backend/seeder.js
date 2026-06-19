const mongoose = require('mongoose');
const Policy = require('./models/Policy');
require('dotenv').config();

const defaultPolicies = [
  {
    category: 'Graphic Violence',
    enabled: true,
    confidenceThreshold: 70,
    enforcementBehavior: 'Auto-Block'
  },
  {
    category: 'Hate Symbols',
    enabled: true,
    confidenceThreshold: 70,
    enforcementBehavior: 'Auto-Block'
  },
  {
    category: 'Self-Harm',
    enabled: true,
    confidenceThreshold: 70,
    enforcementBehavior: 'Flag for Review'
  },
  {
    category: 'Extremist Propaganda',
    enabled: true,
    confidenceThreshold: 70,
    enforcementBehavior: 'Auto-Block'
  },
  {
    category: 'Weapons & Contraband',
    enabled: true,
    confidenceThreshold: 70,
    enforcementBehavior: 'Flag for Review'
  },
  {
    category: 'Harassment & Humiliation',
    enabled: true,
    confidenceThreshold: 70,
    enforcementBehavior: 'Flag for Review'
  }
];

const seedPolicies = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    for (const policy of defaultPolicies) {
      await Policy.findOneAndUpdate(
        { category: policy.category },
        policy,
        { upsert: true, new: true }
      );
    }

    console.log('Default policies seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Seeder error:', err);
    process.exit(1);
  }
};

seedPolicies();