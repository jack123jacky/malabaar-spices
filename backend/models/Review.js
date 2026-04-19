const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    id:        { type: String, required: true, unique: true },
    bookingId: String,
    phone:     String,
    name:      String,
    rating:    Number,
    comment:   String,
    date:      String,
    postedAt:  Number
});

module.exports = mongoose.model('Review', reviewSchema);
