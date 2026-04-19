const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
    startTime: String,
    endTime:   String,
    capacity:  Number,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TimeSlot', timeSlotSchema);
