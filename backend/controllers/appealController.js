const Appeal = require('../models/Appeal');
const Submission = require('../models/Submission');

exports.createAppeal = async (req, res) => {
  try {
    const { submissionId, justification } = req.body;

    const submission = await Submission.findById(submissionId);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    if (submission.overallOutcome === 'Approved') return res.status(400).json({ message: 'Cannot appeal an approved submission' });

    const existingAppeal = await Appeal.findOne({ submissionId });
    if (existingAppeal) return res.status(400).json({ message: 'Appeal already exists for this submission' });

    const appeal = await Appeal.create({ submissionId, userId: req.user.id, justification });
    res.status(201).json(appeal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyAppeals = async (req, res) => {
  try {
    const appeals = await Appeal.find({ userId: req.user.id }).populate('submissionId').sort({ createdAt: -1 });
    res.status(200).json(appeals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};