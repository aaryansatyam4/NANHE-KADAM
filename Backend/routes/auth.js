const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const { uploadUserPic } = require('../middleware/multerConfig');

router.post('/register', uploadUserPic.single('photo'), registerUser);
router.post('/login', loginUser);

module.exports = router;
