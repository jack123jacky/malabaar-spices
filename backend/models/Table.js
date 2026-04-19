const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    tableNumber: { type: String, required: true, unique: true },
    zone:        String,
    seats:       Number,
    available:   { type: Boolean, default: true },
    createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('Table', tableSchema);
