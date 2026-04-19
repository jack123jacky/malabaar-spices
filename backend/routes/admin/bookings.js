const express = require('express');
const router  = express.Router();
const Booking = require('../../models/Booking');

// GET /api/admin/bookings — all bookings
router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ bookedAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/admin/bookings/:bookingId
router.get('/:bookingId', async (req, res) => {
    try {
        const booking = await Booking.findOne({ id: req.params.bookingId });
        if (!booking) return res.status(404).json({ error: 'Booking not found' });
        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/bookings/:bookingId/cancel
router.post('/:bookingId/cancel', async (req, res) => {
    try {
        const result = await Booking.deleteOne({ id: req.params.bookingId });
        if (result.deletedCount === 0) return res.status(404).json({ error: 'Booking not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/bookings/:bookingId/arrived
router.post('/:bookingId/arrived', async (req, res) => {
    try {
        const result = await Booking.updateOne({ id: req.params.bookingId }, { arrived: true });
        if (result.matchedCount === 0) return res.status(404).json({ error: 'Booking not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
