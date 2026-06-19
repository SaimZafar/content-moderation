const express = require('express');
const router = express.Router();
const { getAppealsQueue, resolveAppeal, getPolicies, updatePolicy, getAnalytics } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const adminAuth = [authMiddleware, roleMiddleware('admin')];

router.get('/appeals', adminAuth, getAppealsQueue);
router.put('/appeals/:id', adminAuth, resolveAppeal);
router.get('/policies', adminAuth, getPolicies);
router.put('/policies/:id', adminAuth, updatePolicy);
router.get('/analytics', adminAuth, getAnalytics);

module.exports = router;