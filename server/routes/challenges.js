const express = require('express');
const { protect } = require('../middleware/auth');
const WeeklyChallenge = require('../models/WeeklyChallenge');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();
const User = require('../models/User');

// Get current active challenge
router.get('/current', async (req, res) => {
  try {
    const now = new Date();
    const challenge = await WeeklyChallenge.findOne({ isActive: true, startDate: { $lte: now }, endDate: { $gte: now } })
      .populate('recipe');
    if (!challenge) return res.status(404).json({ error: 'No active challenge' });
    res.json(challenge);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit a user's entry (photo, notes)
router.post('/:id/submit', protect, upload.single('photo'), async (req, res) => {
  try {
    const challenge = await WeeklyChallenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
    if (!req.file) return res.status(400).json({ error: 'No photo uploaded' });
    const submission = {
      user: req.user._id,
      photo: `/uploads/${req.file.filename}`,
      notes: req.body.notes || ''
    };
    challenge.submissions.push(submission);
    await challenge.save();
    // Award badge for first challenge participation
    const user = await User.findById(req.user._id);
    if (user && !user.badges.some(b => b.name === 'Challenge Baker')) {
      await user.addBadge('Challenge Baker', 'Participated in a Weekly Baking Challenge', '\ud83c\udfc5');
    }
    res.json({ message: 'Submission received', submission });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all submissions for a challenge
router.get('/:id/submissions', async (req, res) => {
  try {
    const challenge = await WeeklyChallenge.findById(req.params.id).populate('submissions.user', 'username profile.avatar');
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
    res.json(challenge.submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 