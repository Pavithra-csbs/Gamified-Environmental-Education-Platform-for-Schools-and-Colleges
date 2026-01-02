const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const User = require('../models/User');
const { auth, checkRole } = require('../middleware/authMiddleware');

// Create Question (Teacher only)
router.post('/question', auth, checkRole('teacher'), async (req, res) => {
    try {
        const question = new Question(req.body);
        await question.save();
        res.json({ message: 'Question added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding question', error: error.message });
    }
});

// Get Student Stats for Teacher
router.get('/stats/:classId', auth, checkRole('teacher'), async (req, res) => {
    try {
        const students = await User.find({ class: req.params.classId, role: 'student' })
            .select('name stars');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
});

module.exports = router;
