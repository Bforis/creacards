const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const graphicSchema = new Schema({
    title: String,
    preview: String,
    original: String,
    premium: Boolean,
    owner: mongoose.Types.ObjectId, //store user account
    createdAt: Date
});

module.exports = mongoose.model('graphic', graphicSchema);