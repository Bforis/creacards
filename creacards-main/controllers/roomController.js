const RoomModel = require("../models/Room.Model");
const CanvasModel = require("../models/Canvas.Model");

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * @name createRoom
 * @description create room
 */
exports.createRoom = catchAsync(async (req, res, next) => {

    const room = await RoomModel.create({
        ownerId: req.user.userId,
        users: [req.user.userId],
        createdAt: Date.now()
    });

    //store room data in req object
    req.body.room = room;
    //move to next middleware to create initial canvas
    return next();
});

/**
 * @name fetchRoom
 * @description fetch room details
 */
exports.fetchRoom = catchAsync(async (req, res, next) => {

    const room = await RoomModel.findOne({ _id: req.params.roomId })
        .populate([
            {
                path: 'canvases', populate: [
                    { path: 'images.imageId', select: 'original' },
                    { path: 'backgroundImage.imageId', select: 'original' }
                ]
            },
            { path: 'users', select: 'name' }
        ]).lean();

    if (!room) return next(new AppError("Room not found!", 404));

    return res.status(200).json({
        status: "success",
        data: {
            room
        }
    });
});

/**
 * @name fetchRooms
 * @description fetch all rooms created by user
 */
exports.fetchRooms = catchAsync(async (req, res, next) => {

    //fetch all rooms from db
    const rooms = await RoomModel.find({ ownerId: req.user.userId }).select('-__v').lean();

    return res.status(200).json({
        status: "success",
        result: rooms.length,
        data: {
            rooms
        }
    });
});

/**
 * @name deleteRoom
 * @description delete room
 */
exports.deleteRoom = catchAsync(async (req, res, next) => {

    //fetch all rooms from db
    const room = await RoomModel.findOne({ ownerId: req.user.userId, _id: req.params.roomId });

    if (!room)
        return next(new AppError("Room not found!", 404));

    await CanvasModel.deleteMany({ roomId: req.params.roomId });

    await room.remove();

    return res.status(200).json({
        status: "success",
        data: null
    });
});