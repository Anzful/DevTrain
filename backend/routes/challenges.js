// backend/routes/challenges.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getChallenges,
  getChallenge,
  createChallenge,
  updateChallenge,
  deleteChallenge
} = require('../controllers/challengeController');

// Admin middleware
const adminAuth = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  next();
};

router.get('/', getChallenges);
router.get('/:id', getChallenge);
router.post('/', auth, adminAuth, createChallenge);
router.put('/:id', auth, adminAuth, updateChallenge);
router.delete('/:id', auth, adminAuth, deleteChallenge);

module.exports = router;
