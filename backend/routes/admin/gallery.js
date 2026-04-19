const express = require('express');
const router  = express.Router();
const Gallery = require('../../models/Gallery');

// GET /api/admin/gallery
router.get('/', async (req, res) => {
    try {
        const images = await Gallery.find().sort({ createdAt: -1 });
        res.json(images);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/gallery/:imageId
router.get('/:imageId', async (req, res) => {
    try {
        const image = await Gallery.findById(req.params.imageId);
        if (!image) return res.status(404).json({ error: 'Image not found' });
        res.json(image);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/gallery
router.post('/', async (req, res) => {
    try {
        const image = new Gallery(req.body);
        await image.save();
        res.json({ success: true, image });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/admin/gallery/:imageId
router.put('/:imageId', async (req, res) => {
    try {
        const result = await Gallery.updateOne({ _id: req.params.imageId }, req.body);
        if (result.matchedCount === 0) return res.status(404).json({ error: 'Image not found' });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/admin/gallery/:imageId
router.delete('/:imageId', async (req, res) => {
    try {
        const result = await Gallery.deleteOne({ _id: req.params.imageId });
        if (result.deletedCount === 0) return res.status(404).json({ error: 'Image not found' });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
