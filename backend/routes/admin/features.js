const express = require('express');
const router  = express.Router();
const Feature = require('../../models/Feature');

// GET /api/admin/features
router.get('/', async (req, res) => {
    try {
        const features = await Feature.find().sort({ createdAt: -1 });
        res.json(features);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/features/:featureId
router.get('/:featureId', async (req, res) => {
    try {
        const feature = await Feature.findById(req.params.featureId);
        if (!feature) return res.status(404).json({ error: 'Feature not found' });
        res.json(feature);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/features
router.post('/', async (req, res) => {
    try {
        const feature = new Feature(req.body);
        await feature.save();
        res.json({ success: true, feature });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/admin/features/:featureId
router.put('/:featureId', async (req, res) => {
    try {
        const result = await Feature.updateOne({ _id: req.params.featureId }, req.body);
        if (result.matchedCount === 0) return res.status(404).json({ error: 'Feature not found' });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/admin/features/:featureId
router.delete('/:featureId', async (req, res) => {
    try {
        const result = await Feature.deleteOne({ _id: req.params.featureId });
        if (result.deletedCount === 0) return res.status(404).json({ error: 'Feature not found' });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
