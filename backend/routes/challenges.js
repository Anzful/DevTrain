// backend/routes/challenges.js
const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, challengeController.getAllChallenges);
router.get('/:id', verifyToken, challengeController.getChallengeById);
router.post('/', verifyToken, challengeController.createChallenge);

module.exports = router;
