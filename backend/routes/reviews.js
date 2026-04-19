const express = require('express');
const router  = express.Router();
const Review  = require('../models/Review');
const Booking = require('../models/Booking');

// GET /api/reviews — all public reviews
router.get('/', async (req, res) => {
    try {
        const reviews = await Review.find().sort({ postedAt: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/reviews — submit a review (linked to a booking)
router.post('/', async (req, res) => {
    try {
        const review = new Review(req.body);
        await review.save();
        // Mark the booking as reviewed
        await Booking.updateOne(
            { id: req.body.bookingId },
            { reviewed: true, review: req.body }
        );
        res.json({ success: true, review });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
