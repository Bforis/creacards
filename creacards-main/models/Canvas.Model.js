const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const canvasSchema = new Schema({
    roomId: {
        type: mongoose.Types.ObjectId,
        ref: 'room'
    },
    backgroundImage: {
        imageId: { type: mongoose.Types.ObjectId, ref: 'graphic' },
        state: Object
    },
    images: [{
        imageId: { type: mongoose.Types.ObjectId, ref: 'image' }, //store url of image url
        state: Object //contain the state of images
    }],
    texts: [{
        text: String,
        state: Object
    }],
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'user'
    },
    createdAt: Date
});

module.exports = mongoose.model('canvas', canvasSchema);