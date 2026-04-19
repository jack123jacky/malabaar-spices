const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    id:          { type: String, required: true, unique: true },
    phone:       { type: String, required: true },
    date:        String,
    time:        String,
    tableNums:   [String],
    zone:        String,
    guests:      String,
    specialReq:  String,
    bookedAt:    Number,
    sessionStart: Number,
    sessionEnd:  Number,
    graceEnd:    Number,
    arrived:     { type: Boolean, default: false },
    reviewed:    { type: Boolean, default: false },
    review:      { type: Object, default: null }
});

module.exports = mongoose.model('Booking', bookingSchema);
