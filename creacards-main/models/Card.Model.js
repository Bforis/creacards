const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cardSchema = new Schema({
    roomId: mongoose.Types.ObjectId,
    canvases: [
        {
            _id: mongoose.Types.ObjectId,
            texts: [
                {
                    text: String,
                    state: Object
                }
            ],
            images: [
                {
                    imageId: { type: mongoose.Types.ObjectId, ref: 'image' },
                    state: Object
                }
            ],
            backgroundImage: {
                imageId: {
                    type: mongoose.Types.ObjectId,
                    ref: 'graphic'
                },
                state: Object
            }
        }
    ],
    createdAt: Date
});

module.exports = new mongoose.model('card', cardSchema);