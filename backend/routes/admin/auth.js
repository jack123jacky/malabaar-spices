const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');

// POST /api/admin/login — verify credentials, return a signed JWT
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    const validUser = process.env.ADMIN_USERNAME;
    const validPass = process.env.ADMIN_PASSWORD;

    if (!validUser || !validPass) {
        return res.status(500).json({ error: 'Admin credentials not configured on server' });
    }

    if (username !== validUser || password !== validPass) {
        return res.status(401).json({ success: false, error: 'Invalid admin credentials' });
    }

    // Sign a JWT valid for 8 hours
    const token = jwt.sign(
        { role: 'admin', username },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    );

    res.json({ success: true, token });
});

module.exports = router;
