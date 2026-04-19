require('dotenv').config();
const express   = require('express');
const mongoose  = require('mongoose');
const cors      = require('cors');
const adminAuth = require('./middleware/auth');

const app = express();

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',  // restrict to frontend domain in production
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ── Database ───────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch((err) => { console.error('❌ MongoDB connection error:', err); process.exit(1); });

// ── Health Check ───────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({ status: 'Malabar Spice API is running ✅', version: '2.0.0' });
});

// ── Public Routes ──────────────────────────────────────────────────────────
app.use('/api',          require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/reviews',  require('./routes/reviews'));

// ── Admin Auth (no token required — this is how you GET the token) ─────────
app.use('/api/admin', require('./routes/admin/auth'));

// ── Protected Admin Routes (JWT required on all below) ────────────────────
app.use('/api/admin/bookings',  adminAuth, require('./routes/admin/bookings'));
app.use('/api/admin/timeslots', adminAuth, require('./routes/admin/timeslots'));
app.use('/api/admin/tables',    adminAuth, require('./routes/admin/tables'));
app.use('/api/admin/menu',      adminAuth, require('./routes/admin/menu'));
app.use('/api/admin/gallery',   adminAuth, require('./routes/admin/gallery'));
app.use('/api/admin/features',  adminAuth, require('./routes/admin/features'));

// ── Global Error Handler ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// ── Start ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
