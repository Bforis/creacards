const RoomModel = require('../models/Room.Model');
const CanvasModel = require('../models/Canvas.Model');
const CardModel = require('../models/Card.Model');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * @name saveCard
 * @description save card to card collection
 */
exports.saveCard = catchAsync(async (req, res, next) => {

    //validate user is room owner
    const room = await RoomModel.findOne({ _id: req.query.roomId, ownerId: req.user.userId });
    if (!room) return next(new AppError("You are not allowed to perform this action!", 400));

    const canvases = await CanvasModel.find({ roomId: req.query.roomId }).select("images texts backgroundImage").lean();

    let card = await CardModel.findOne({ roomId: req.query.roomId })
    if (!card) {
        card = await CardModel.create({
            roomId: room._id,
            canvases: canvases,
            createdAt: Date.now()
        });
        room.cardId = card._id;
        await room.save();
    } else {
        card.canvases = canvases;
        await card.save();
    }

    return res.status(200).json({
        status: "success",
        data: {
            link: `${req.protocol}://${req.get('host')}/cards/${card._id}`
        }
    })
});

/**
 * @name fetchCard
 * @description fetch card details
 */
exports.fetchCard = catchAsync(async (req, res, next) => {
    const card = await CardModel.findOne({ _id: req.params.cardId }).populate([
        { path: "canvases.backgroundImage.imageId", select: "original" },
        { path: "canvases.images.imageId", select: "original" }
    ]).lean();
    return res.status(200).json({
        status: "success",
        data: {
            card
        }
    });
});