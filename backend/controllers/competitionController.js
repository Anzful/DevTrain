// backend/controllers/competitionController.js
const Competition = require('../models/Competition');

exports.getCompetitions = async (req, res) => {
  try {
    const competitions = await Competition.find({})
      .populate('participants')
      .populate('challenges');
    res.json(competitions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCompetition = async (req, res) => {
  try {
    const competition = new Competition(req.body);
    await competition.save();
    res.status(201).json(competition);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.joinCompetition = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);
    if (!competition) return res.status(404).json({ message: 'Competition not found' });
    if (!competition.participants.includes(req.user.id)) {
      competition.participants.push(req.user.id);
      await competition.save();
    }
    res.json(competition);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
