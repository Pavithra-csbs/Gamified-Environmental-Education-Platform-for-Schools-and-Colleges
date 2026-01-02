const express = require('express');
const router = express.Router();
const QuizResult = require('../models/QuizResult');
const User = require('../models/User');
const { auth } = require('../middleware/authMiddleware');

// Submit Quiz Results
router.post('/submit', auth, async (req, res) => {
    const { userId, topicId, score } = req.body;

    // Evaluation Logic:
    // 0-2 correct -> 1 star
    // 3-5 correct -> 2 stars
    // 6-8 correct -> 3 stars (Full score is 8)
    let stars = 1;
    if (score >= 8) stars = 3;
    else if (score >= 5) stars = 2;

    try {
        const result = new QuizResult({
            userId,
            topicId,
            score,
            stars
        });
        await result.save();

        // Update User stats
        const user = await User.findById(userId);
        user.stars += stars;
        // Logic to unlock next level could go here
        await user.save();

        res.json({ message: 'Quiz submitted', stars, totalStars: user.stars });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting quiz', error: error.message });
    }
});

// Fetch User Progress
router.get('/progress/:userId', auth, async (req, res) => {
    try {
        const results = await QuizResult.find({ userId: req.params.userId }).populate('topicId');
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching progress', error: error.message });
    }
});

module.exports = router;
