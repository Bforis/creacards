const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const planSchema = new Schema({
    title: String,
    days: Number,
    amount: Number,
    createdAt: Date
});

module.exports = mongoose.model('plan', planSchema);