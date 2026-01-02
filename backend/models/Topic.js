const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
    class: { type: Number, required: true },
    subject: { type: String, required: true }, // e.g., 'Maths', 'Science'
    name: { type: String, required: true },
    theory: { type: String, required: true },
    images: { type: [String], default: [] }, // URLs to images
    order: { type: Number, default: 0 } // For the game map path
});

module.exports = mongoose.model('Topic', TopicSchema);
