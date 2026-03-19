require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Successfully connected to MongoDB Atlas!'))
.catch((err) => console.error('Error connecting to MongoDB:', err));

// --- Schemas & Models ---
const userSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    name: { type: String, default: '' }
});
const User = mongoose.model('User', userSchema);

const bookingSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // using frontend uuid
    phone: { type: String, required: true },
    date: String,
    time: String,
    tableNums: [String],
    zone: String,
    guests: String,
    specialReq: String,
    bookedAt: Number,
    sessionStart: Number,
    sessionEnd: Number,
    graceEnd: Number,
    arrived: { type: Boolean, default: false },
    reviewed: { type: Boolean, default: false },
    review: { type: Object, default: null } // embedded review info
});
const Booking = mongoose.model('Booking', bookingSchema);

const reviewSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    bookingId: String,
    phone: String,
    name: String,
    rating: Number,
    comment: String,
    date: String,
    postedAt: Number
});
const Review = mongoose.model('Review', reviewSchema);

const timeSlotSchema = new mongoose.Schema({
    startTime: String,
    endTime: String,
    capacity: Number,
    createdAt: { type: Date, default: Date.now }
});
const TimeSlot = mongoose.model('TimeSlot', timeSlotSchema);

const tableSchema = new mongoose.Schema({
    tableNumber: { type: String, required: true, unique: true },
    zone: String,
    seats: Number,
    available: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});
const Table = mongoose.model('Table', tableSchema);

const menuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: String,
    description: String,
    price: { type: Number, required: true },
    calories: Number,
    veg: { type: Boolean, default: false },
    image: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});
const MenuItem = mongoose.model('MenuItem', menuItemSchema);

const gallerySchema = new mongoose.Schema({
    title: { type: String, required: true },
    caption: String,
    image: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const Gallery = mongoose.model('Gallery', gallerySchema);

const featureSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});
const Feature = mongoose.model('Feature', featureSchema);

// --- API Routes ---

// Admin Login
app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    
    // Simple hardcoded admin credentials (in production use proper auth/JWT)
    const ADMIN_USERNAME = 'admin1234';
    const ADMIN_PASSWORD = 'kuzhikandathil@123';
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Generate a simple token (in production use JWT)
        const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
        res.json({ 
            success: true, 
            token: token,
            message: 'Admin login successful'
        });
    } else {
        res.status(401).json({ 
            success: false, 
            error: 'Invalid admin credentials' 
        });
    }
});

// Login / Get User Data
app.post('/api/login', async (req, res) => {
    const { phone, name } = req.body;
    try {
        let user = await User.findOne({ phone });
        if (!user) {
            user = new User({ phone, name: name || '' });
            await user.save();
        } else if (name && !user.name) {
            user.name = name;
            await user.save();
        }
        
        // Fetch users bookings
        const bookings = await Booking.find({ phone }).sort({ bookedAt: -1 });
        res.json({ user, bookings });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/user/name', async (req, res) => {
    const { phone, name } = req.body;
    try {
        await User.updateOne({ phone }, { name });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Bookings
app.post('/api/bookings', async (req, res) => {
    try {
        const booking = new Booking(req.body);
        await booking.save();
        res.json({ success: true, booking });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/bookings/arrived', async (req, res) => {
    const { bookingId } = req.body;
    try {
        await Booking.updateOne({ id: bookingId }, { arrived: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reviews
app.post('/api/reviews', async (req, res) => {
    try {
        const review = new Review(req.body);
        await review.save();
        
        // update booking to reviewed
        await Booking.updateOne({ id: req.body.bookingId }, { 
            reviewed: true, 
            review: req.body 
        });
        res.json({ success: true, review });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await Review.find().sort({ postedAt: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ADMIN ROUTES ---

// Admin Bookings - Get all bookings
app.get('/api/admin/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ bookedAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Bookings - Get single booking
app.get('/api/admin/bookings/:bookingId', async (req, res) => {
    try {
        const booking = await Booking.findOne({ id: req.params.bookingId });
        if (!booking) return res.status(404).json({ error: 'Booking not found' });
        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Bookings - Cancel booking
app.post('/api/admin/bookings/:bookingId/cancel', async (req, res) => {
    try {
        const result = await Booking.deleteOne({ id: req.params.bookingId });
        if (result.deletedCount === 0) return res.status(404).json({ error: 'Booking not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Bookings - Mark arrived
app.post('/api/admin/bookings/:bookingId/arrived', async (req, res) => {
    try {
        const result = await Booking.updateOne({ id: req.params.bookingId }, { arrived: true });
        if (result.matchedCount === 0) return res.status(404).json({ error: 'Booking not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Time Slots - Get all
app.get('/api/admin/timeslots', async (req, res) => {
    try {
        const slots = await TimeSlot.find().sort({ startTime: 1 });
        res.json(slots);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Time Slots - Get single slot
app.get('/api/admin/timeslots/:slotId', async (req, res) => {
    try {
        const slot = await TimeSlot.findById(req.params.slotId);
        if (!slot) return res.status(404).json({ error: 'Slot not found' });
        res.json(slot);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Time Slots - Add
app.post('/api/admin/timeslots', async (req, res) => {
    try {
        const slot = new TimeSlot(req.body);
        await slot.save();
        res.json({ success: true, slot });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Time Slots - Update
app.put('/api/admin/timeslots/:slotId', async (req, res) => {
    try {
        const result = await TimeSlot.updateOne({ _id: req.params.slotId }, req.body);
        if (result.matchedCount === 0) return res.status(404).json({ error: 'Slot not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Time Slots - Delete
app.delete('/api/admin/timeslots/:slotId', async (req, res) => {
    try {
        const result = await TimeSlot.deleteOne({ _id: req.params.slotId });
        if (result.deletedCount === 0) return res.status(404).json({ error: 'Slot not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Tables - Get all
app.get('/api/admin/tables', async (req, res) => {
    try {
        const tables = await Table.find().sort({ tableNumber: 1 });
        res.json(tables);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Tables - Add
app.post('/api/admin/tables', async (req, res) => {
    try {
        const table = new Table(req.body);
        await table.save();
        res.json({ success: true, table });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Tables - Delete
app.delete('/api/admin/tables/:tableId', async (req, res) => {
    try {
        const result = await Table.deleteOne({ _id: req.params.tableId });
        if (result.deletedCount === 0) return res.status(404).json({ error: 'Table not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Menu - Get all
app.get('/api/admin/menu', async (req, res) => {
    try {
        const items = await MenuItem.find().sort({ category: 1, name: 1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Menu - Get single item
app.get('/api/admin/menu/:itemId', async (req, res) => {
    try {
        const item = await MenuItem.findById(req.params.itemId);
        if (!item) return res.status(404).json({ error: 'Item not found' });
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Menu - Add
app.post('/api/admin/menu', async (req, res) => {
    try {
        const item = new MenuItem(req.body);
        await item.save();
        res.json({ success: true, item });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Menu - Update
app.put('/api/admin/menu/:itemId', async (req, res) => {
    try {
        const result = await MenuItem.updateOne({ _id: req.params.itemId }, req.body);
        if (result.matchedCount === 0) return res.status(404).json({ error: 'Item not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Menu - Delete
app.delete('/api/admin/menu/:itemId', async (req, res) => {
    try {
        const result = await MenuItem.deleteOne({ _id: req.params.itemId });
        if (result.deletedCount === 0) return res.status(404).json({ error: 'Item not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Gallery - Get all
app.get('/api/admin/gallery', async (req, res) => {
    try {
        const images = await Gallery.find().sort({ createdAt: -1 });
        res.json(images);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Gallery - Get single image
app.get('/api/admin/gallery/:imageId', async (req, res) => {
    try {
        const image = await Gallery.findById(req.params.imageId);
        if (!image) return res.status(404).json({ error: 'Image not found' });
        res.json(image);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Gallery - Add
app.post('/api/admin/gallery', async (req, res) => {
    try {
        const image = new Gallery(req.body);
        await image.save();
        res.json({ success: true, image });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Gallery - Update
app.put('/api/admin/gallery/:imageId', async (req, res) => {
    try {
        const result = await Gallery.updateOne({ _id: req.params.imageId }, req.body);
        if (result.matchedCount === 0) return res.status(404).json({ error: 'Image not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Gallery - Delete
app.delete('/api/admin/gallery/:imageId', async (req, res) => {
    try {
        const result = await Gallery.deleteOne({ _id: req.params.imageId });
        if (result.deletedCount === 0) return res.status(404).json({ error: 'Image not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Features - Get all
app.get('/api/admin/features', async (req, res) => {
    try {
        const features = await Feature.find().sort({ createdAt: -1 });
        res.json(features);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Features - Get single feature
app.get('/api/admin/features/:featureId', async (req, res) => {
    try {
        const feature = await Feature.findById(req.params.featureId);
        if (!feature) return res.status(404).json({ error: 'Feature not found' });
        res.json(feature);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Features - Add
app.post('/api/admin/features', async (req, res) => {
    try {
        const feature = new Feature(req.body);
        await feature.save();
        res.json({ success: true, feature });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Features - Update
app.put('/api/admin/features/:featureId', async (req, res) => {
    try {
        const result = await Feature.updateOne({ _id: req.params.featureId }, req.body);
        if (result.matchedCount === 0) return res.status(404).json({ error: 'Feature not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Features - Delete
app.delete('/api/admin/features/:featureId', async (req, res) => {
    try {
        const result = await Feature.deleteOne({ _id: req.params.featureId });
        if (result.deletedCount === 0) return res.status(404).json({ error: 'Feature not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
