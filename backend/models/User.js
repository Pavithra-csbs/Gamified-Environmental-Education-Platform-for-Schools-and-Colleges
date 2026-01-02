const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    class: { type: Number, enum: [6, 7, 8, 9, 10], required: true },
    role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
    avatar: { type: String, default: 'avatar1.png' },
    stars: { type: Number, default: 0 },
    unlockedLevels: { type: [String], default: ['intro'] }, // Array of Topic IDs or level names
    badges: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
