const express = require('express');
const router = express.Router();
const { adoptChild } = require('../controllers/adoptionController');

router.post('/', adoptChild);

module.exports = router;
