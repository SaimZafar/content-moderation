const Submission = require('../models/Submission');
const Policy = require('../models/Policy');
const { analyzeImage } = require('../services/aiService');

exports.createSubmission = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) return res.status(400).json({ message: 'No images uploaded' });

    const policies = await Policy.find({ enabled: true });
    const policySnapshot = policies.map(p => ({
      category: p.category,
      confidenceThreshold: p.confidenceThreshold,
      enforcementBehavior: p.enforcementBehavior
    }));

    const verdicts = [];
    let overallOutcome = 'Approved';

    for (const file of files) {
      const imageUrl = `/uploads/${file.filename}`;
      const categoryBreakdown = await analyzeImage(file.path, policies);

      let imageOutcome = 'Approved';
      for (const result of categoryBreakdown) {
        const policy = policies.find(p => p.category === result.category);
        if (!policy) continue;
        if (result.result === 'unsafe' && result.confidence >= policy.confidenceThreshold) {
          if (policy.enforcementBehavior === 'Auto-Block') {
            imageOutcome = 'Blocked';
            break;
          } else {
            imageOutcome = 'Flagged';
          }
        }
      }

      if (imageOutcome === 'Blocked') overallOutcome = 'Blocked';
      else if (imageOutcome === 'Flagged' && overallOutcome !== 'Blocked') overallOutcome = 'Flagged';

      verdicts.push({ imageUrl, outcome: imageOutcome, categoryBreakdown });
    }

    const submission = await Submission.create({
      userId: req.user.id,
      verdicts,
      overallOutcome,
      policySnapshot
    });

    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMySubmissions = async (req, res) => {
  try {
    const { outcome, category, date } = req.query;
    let query = { userId: req.user.id };

    if (outcome) query.overallOutcome = outcome;

    const submissions = await Submission.find(query).sort({ createdAt: -1 });
    res.status(200).json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};