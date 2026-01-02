const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/authMiddleware');

// Temporary storage for OTPs (In a real app, use Redis or a DB collection with TTL)
const otpStore = {};

// Send OTP
router.post('/send-otp', async (req, res) => {
    const { email, name, class: userClass, role } = req.body;

    if (!email) return res.status(400).json({ message: 'Email is required' });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with email (expires in 5 mins)
    otpStore[email] = {
        otp,
        expires: Date.now() + 300000,
        userData: { name, class: userClass, role } // Store for registration if user is new
    };

    // FOR DEMO: Log to console
    console.log(`[AUTH] OTP for ${email}: ${otp}`);

    res.json({ message: 'OTP sent to email (Check console for demo)' });
});

// Verify OTP & Login/Register
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    // Allow universal 123456 for demo, or match generated OTP
    const isValidOTP = otp === '123456' || (otpStore[email] && otpStore[email].otp === otp);

    if (!isValidOTP) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (otp === '123456' && !otpStore[email]) {
        // Handle case where 123456 is used without a previous send-otp call
        // We'll create a minimal userData block
        otpStore[email] = { userData: { name: email.split('@')[0], class: 6, role: 'student' } };
    }

    if (otpStore[email] && otpStore[email].expires && Date.now() > otpStore[email].expires) {
        delete otpStore[email];
        return res.status(400).json({ message: 'OTP expired' });
    }

    const { userData } = otpStore[email];
    delete otpStore[email];

    try {
        let user = await User.findOne({ email });

        if (!user) {
            // Register new user
            user = new User({
                email,
                name: userData.name || 'New Student',
                class: userData.class || 6,
                role: userData.role || 'student'
            });
            await user.save();
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                class: user.class,
                role: user.role,
                stars: user.stars,
                avatar: user.avatar
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update Profile (Avatar/Name)
router.patch('/profile', auth, async (req, res) => {
    const { name, avatar } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (name) user.name = name;
        if (avatar) user.avatar = avatar;
        await user.save();
        res.json({ message: 'Profile updated', user });
    } catch (error) {
        res.status(500).json({ message: 'Update failed', error: error.message });
    }
});

module.exports = router;
