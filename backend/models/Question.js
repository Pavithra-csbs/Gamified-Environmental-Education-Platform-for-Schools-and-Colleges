const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    questionText: { type: String, required: true },
    options: { type: [String], required: true }, // Array of 4 options
    correctAnswer: { type: Number, required: true }, // Index 0-3
    explanation: { type: String }
});

module.exports = mongoose.model('Question', QuestionSchema);
