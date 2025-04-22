const express = require('express');
const router = express.Router();
const {
  addMissingChild,
  addLostChild,
  getAllLostChildren,
  closeCase,
  getUnadoptedChildren,
  getRescueStats,
  getLostChildCountByUser,
  getMissingChildrenByUser,
  getAllMissingChildren 
} = require('../controllers/childController');
const { uploadMissingChild, uploadLostChild } = require('../middleware/multerConfig');

router.post('/missing', uploadMissingChild.single('childPhoto'), addMissingChild);
router.post('/lost', uploadLostChild.single('childPhoto'), addLostChild);
router.get('/lost', getAllLostChildren);
router.put('/close/:id', closeCase);
router.get('/unadopted', getUnadoptedChildren);
router.get('/rescue-data', getRescueStats);
router.get('/count/:userId', getLostChildCountByUser);
router.get('/missingchildren/byuser/:userId', getMissingChildrenByUser);
router.get('/missingchildren/all', getAllMissingChildren);
module.exports = router;
