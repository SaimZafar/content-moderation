const express = require('express');
const router = express.Router();
const { createAppeal, getMyAppeals } = require('../controllers/appealController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createAppeal);
router.get('/', authMiddleware, getMyAppeals);

module.exports = router;