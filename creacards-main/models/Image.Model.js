const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imageSchema = new Schema({
    title: String,
    preview: String,
    original: String,
    premium: Boolean,
    owner: mongoose.Types.ObjectId, //store user account
    createdAt: Date
});

module.exports = mongoose.model('image', imageSchema);