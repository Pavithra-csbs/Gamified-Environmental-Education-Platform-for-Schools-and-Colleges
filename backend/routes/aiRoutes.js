const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/authMiddleware');

// Simple context-aware AI Mock
const aiResponses = {
    'food': "Plants are the primary source of food. Some animals eat plants, others eat animals!",
    'science': "Science is the study of the nature and behaviour of natural things and the knowledge that we obtain about them.",
    'ncert': "NCERT books are the foundation for Class 6-10. I can help you with Science and Maths topics!",
    'hello': "Hi there! Ready for some fun learning?",
    'bye': "Goodbye! Keep learning and growing! 🚀"
};



router.post('/chat', auth, async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'No message provided' });

    const lowerMsg = message.toLowerCase();
    let response = "That's an interesting question! Let me check the NCERT books... (Demo Mode: Ask about 'food' or 'science')";

    for (const [key, val] of Object.entries(aiResponses)) {
        if (lowerMsg.includes(key)) {
            response = val;
            break;
        }
    }

    res.json({ response });
});

module.exports = router;
