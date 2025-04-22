const express = require('express');
const router = express.Router();
const { createDonation, verifyPayment } = require('../controllers/paymentController');

router.post('/donate', createDonation);
router.post('/verify', verifyPayment);

module.exports = router;
