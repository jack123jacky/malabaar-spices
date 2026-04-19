const express  = require('express');
const router   = express.Router();
const TimeSlot = require('../../models/TimeSlot');

// GET /api/admin/timeslots
router.get('/', async (req, res) => {
    try {
        const slots = await TimeSlot.find().sort({ startTime: 1 });
        res.json(slots);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/timeslots/:slotId
router.get('/:slotId', async (req, res) => {
    try {
        const slot = await TimeSlot.findById(req.params.slotId);
        if (!slot) return res.status(404).json({ error: 'Slot not found' });
        res.json(slot);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/timeslots
router.post('/', async (req, res) => {
    try {
        const slot = new TimeSlot(req.body);
        await slot.save();
        res.json({ success: true, slot });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/admin/timeslots/:slotId
router.put('/:slotId', async (req, res) => {
    try {
        const result = await TimeSlot.updateOne({ _id: req.params.slotId }, req.body);
        if (result.matchedCount === 0) return res.status(404).json({ error: 'Slot not found' });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/admin/timeslots/:slotId
router.delete('/:slotId', async (req, res) => {
    try {
        const result = await TimeSlot.deleteOne({ _id: req.params.slotId });
        if (result.deletedCount === 0) return res.status(404).json({ error: 'Slot not found' });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
