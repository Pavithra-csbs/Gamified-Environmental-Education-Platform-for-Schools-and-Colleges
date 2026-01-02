const express = require('express');
const router = express.Router();
const Topic = require('../models/Topic');
const Question = require('../models/Question');

// Fetch subjects for a specific class
router.get('/subjects/:classId', async (req, res) => {
    try {
        const { classId } = req.params;
        const subjects = await Topic.distinct('subject', { class: classId });
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching subjects', error: error.message });
    }
});

// Fetch topics for a subject in a class
router.get('/topics/:classId/:subject', async (req, res) => {
    try {
        const { classId, subject } = req.params;
        const topics = await Topic.find({ class: classId, subject }).sort('order');
        res.json(topics);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching topics', error: error.message });
    }
});

// Fetch topic details (Theory + Questions)
router.get('/topic/:topicId', async (req, res) => {
    try {
        const { topicId } = req.params;
        const topic = await Topic.findById(topicId);
        const questions = await Question.find({ topicId });
        res.json({ topic, questions });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching topic details', error: error.message });
    }
});

module.exports = router;
