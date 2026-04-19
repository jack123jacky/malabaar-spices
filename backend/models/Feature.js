const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema({
    title:       { type: String, required: true },
    description: { type: String, required: true },
    icon:        { type: String, default: '' },
    createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feature', featureSchema);
