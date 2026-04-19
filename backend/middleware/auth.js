const jwt = require('jsonwebtoken');

/**
 * Middleware — verifies the JWT sent in the Authorization header.
 * Protects all /api/admin/* routes.
 * Header format: Authorization: Bearer <token>
 */
function adminAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: no token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded; // attach payload to request
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized: invalid or expired token' });
    }
}

module.exports = adminAuth;
