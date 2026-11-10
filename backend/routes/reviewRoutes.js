const express = require('express');
const router = express.Router();
const { createReview, vendorReplyReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createReview);
router.post('/:id/reply', protect, vendorReplyReview);

module.exports = router;
