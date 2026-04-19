const express = require('express');
const router  = express.Router();
const Table   = require('../../models/Table');

// GET /api/admin/tables
router.get('/', async (req, res) => {
    try {
        const tables = await Table.find().sort({ tableNumber: 1 });
        res.json(tables);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/tables
router.post('/', async (req, res) => {
    try {
        const table = new Table(req.body);
        await table.save();
        res.json({ success: true, table });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/admin/tables/:tableId
router.delete('/:tableId', async (req, res) => {
    try {
        const result = await Table.deleteOne({ _id: req.params.tableId });
        if (result.deletedCount === 0) return res.status(404).json({ error: 'Table not found' });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
