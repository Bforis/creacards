const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
    ownerId: {
        type: mongoose.Types.ObjectId,
        ref: 'user'
    },
    canvases: [{
        type: mongoose.Types.ObjectId,
        ref: 'canvas'
    }],
    users: [{
        type: mongoose.Types.ObjectId,
        ref: 'user'
    }],
    cardId: mongoose.Types.ObjectId,
    createdAt: Date
});

module.exports = mongoose.model('room', roomSchema);