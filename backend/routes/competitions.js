// backend/routes/competitions.js
const express = require('express');
const router = express.Router();
const competitionController = require('../controllers/competitionController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, competitionController.getCompetitions);
router.post('/', verifyToken, competitionController.createCompetition);
router.post('/:id/join', verifyToken, competitionController.joinCompetition);

module.exports = router;
