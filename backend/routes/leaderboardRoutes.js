const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/authMiddleware');

// Get Leaderboard (Overall)
router.get('/', auth, async (req, res) => {
    try {
        const leaderboard = await User.find({})
            .sort({ stars: -1 })
            .limit(10)
            .select('name class stars avatar');
        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leaderboard', error: error.message });
    }
});

// Get Leaderboard (Class-wise)
router.get('/:classId', auth, async (req, res) => {
    try {
        const { classId } = req.params;
        const leaderboard = await User.find({ class: classId })
            .sort({ stars: -1 })
            .limit(10)
            .select('name class stars avatar');
        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leaderboard', error: error.message });
    }
});

module.exports = router;
