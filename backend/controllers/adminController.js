const Appeal = require('../models/Appeal');
const Submission = require('../models/Submission');
const Policy = require('../models/Policy');

exports.getAppealsQueue = async (req, res) => {
  try {
    const appeals = await Appeal.find({ status: 'Pending' }).populate('submissionId').populate('userId', 'name email').sort({ createdAt: -1 });
    res.status(200).json(appeals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resolveAppeal = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    const appeal = await Appeal.findByIdAndUpdate(id, { status, adminResponse }, { new: true });
    if (!appeal) return res.status(404).json({ message: 'Appeal not found' });

    if (status === 'Accepted') {
      await Submission.findByIdAndUpdate(appeal.submissionId, { overallOutcome: 'Approved' });
    }

    res.status(200).json(appeal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPolicies = async (req, res) => {
  try {
    const policies = await Policy.find();
    res.status(200).json(policies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const policy = await Policy.findByIdAndUpdate(id, req.body, { new: true });
    if (!policy) return res.status(404).json({ message: 'Policy not found' });
    res.status(200).json(policy);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const totalSubmissions = await Submission.countDocuments();

    const verdictDistribution = await Submission.aggregate([
      { $group: { _id: '$overallOutcome', count: { $sum: 1 } } }
    ]);

    const appealStats = await Appeal.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const volumeOverTime = await Submission.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const topUsers = await Submission.aggregate([
      { $group: { _id: '$userId', submissionCount: { $sum: 1 } } },
      { $sort: { submissionCount: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { 'user.name': 1, 'user.email': 1, submissionCount: 1 } }
    ]);

    res.status(200).json({ totalSubmissions, verdictDistribution, appealStats, volumeOverTime, topUsers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};