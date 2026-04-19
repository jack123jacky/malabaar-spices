const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const Booking = require('../models/Booking');

// POST /api/login — login or create user, return user + bookings
router.post('/login', async (req, res) => {
    const { phone, name } = req.body;
    if (!phone) return res.status(400).json({ error: 'phone is required' });

    try {
        let user = await User.findOne({ phone });
        if (!user) {
            user = new User({ phone, name: (name || '').trim() });
            await user.save();
        } else if (name && !user.name) {
            user.name = name.trim();
            await user.save();
        }
        const bookings = await Booking.find({ phone }).sort({ bookedAt: -1 });
        res.json({ user, bookings });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/user/name — update display name
router.post('/user/name', async (req, res) => {
    const { phone, name } = req.body;
    if (!phone || !name) return res.status(400).json({ error: 'phone and name are required' });

    try {
        await User.updateOne({ phone }, { name: name.trim() });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
