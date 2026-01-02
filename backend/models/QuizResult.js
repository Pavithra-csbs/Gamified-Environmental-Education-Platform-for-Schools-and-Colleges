const mongoose = require('mongoose');

const QuizResultSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    score: { type: Number, required: true }, // count of correct answers (0-8)
    stars: { type: Number, required: true }, // 1, 2, or 3 stars
    completedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuizResult', QuizResultSchema);
