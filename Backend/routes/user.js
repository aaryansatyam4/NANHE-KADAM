const express = require('express');
const router = express.Router();
const { getCurrentUser, getUserById } = require('../controllers/userController');

router.get('/me', getCurrentUser);
router.get('/:userId', getUserById);

module.exports = router;
