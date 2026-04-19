const express = require('express');
const router  = express.Router();
const Booking = require('../models/Booking');

// GET /api/bookings/availability?date=...&time=...
// Returns all tableNums already booked for a given date + time slot
router.get('/availability', async (req, res) => {
    const { date, time } = req.query;
    if (!date || !time) {
        return res.status(400).json({ error: 'date and time query params are required' });
    }
    try {
        const bookings = await Booking.find({ date, time });
        const bookedTableNums = bookings.flatMap(b => b.tableNums || []);
        res.json({ date, time, bookedTableNums });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/bookings — create a new booking (with double-booking guard)
router.post('/', async (req, res) => {
    try {
        const { date, time, tableNums } = req.body;

        // Double-booking guard — check for any conflicting booking in DB
        if (date && time && Array.isArray(tableNums) && tableNums.length > 0) {
            const conflicting = await Booking.find({
                date,
                time,
                tableNums: { $elemMatch: { $in: tableNums } }
            });

            if (conflicting.length > 0) {
                const conflictedTables = [
                    ...new Set(conflicting.flatMap(b => b.tableNums).filter(t => tableNums.includes(t)))
                ];
                return res.status(409).json({
                    error: 'double_booking',
                    message: `Table(s) ${conflictedTables.join(', ')} are already booked for ${date} at ${time}. Please choose different tables.`,
                    conflictedTables
                });
            }
        }

        const booking = new Booking(req.body);
        await booking.save();
        res.json({ success: true, booking });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/bookings/arrived — customer self-check-in (kept for API completeness)
router.post('/arrived', async (req, res) => {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ error: 'bookingId is required' });
    try {
        await Booking.updateOne({ id: bookingId }, { arrived: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
