const express   = require('express');
const router    = express.Router();
const MenuItem  = require('../../models/MenuItem');

// GET /api/admin/menu
router.get('/', async (req, res) => {
    try {
        const items = await MenuItem.find().sort({ category: 1, name: 1 });
        res.json(items);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/menu/:itemId
router.get('/:itemId', async (req, res) => {
    try {
        const item = await MenuItem.findById(req.params.itemId);
        if (!item) return res.status(404).json({ error: 'Item not found' });
        res.json(item);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/menu
router.post('/', async (req, res) => {
    try {
        const item = new MenuItem(req.body);
        await item.save();
        res.json({ success: true, item });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/admin/menu/:itemId
router.put('/:itemId', async (req, res) => {
    try {
        const result = await MenuItem.updateOne({ _id: req.params.itemId }, req.body);
        if (result.matchedCount === 0) return res.status(404).json({ error: 'Item not found' });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/admin/menu/:itemId
router.delete('/:itemId', async (req, res) => {
    try {
        const result = await MenuItem.deleteOne({ _id: req.params.itemId });
        if (result.deletedCount === 0) return res.status(404).json({ error: 'Item not found' });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
