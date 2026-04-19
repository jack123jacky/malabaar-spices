const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name:        { type: String, required: true },
    category:    String,
    description: String,
    price:       { type: Number, required: true },
    calories:    Number,
    veg:         { type: Boolean, default: false },
    image:       { type: String, default: '' },
    createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
