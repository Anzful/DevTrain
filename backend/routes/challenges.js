// backend/routes/challenges.js
const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const {
  getChallenges,
  getChallenge,
  createChallenge,
  updateChallenge,
  deleteChallenge
} = require('../controllers/challengeController');

// Public routes
router.get('/', getChallenges);
router.get('/:id', getChallenge);

// Protected admin routes
router.use(auth); // Apply auth middleware to all routes below
router.use(adminAuth); // Apply admin middleware to all routes below

router.post('/', createChallenge);
router.put('/:id', updateChallenge);
router.delete('/:id', deleteChallenge);

module.exports = router;
