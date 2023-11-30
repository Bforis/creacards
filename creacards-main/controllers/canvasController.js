const CanvasModel = require("../models/Canvas.Model");
const RoomModel = require("../models/Room.Model");

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * @name createCanvas
 * @description create canvas for room
 */
exports.createCanvas = catchAsync(async (req, res, next) => {

    //get room from req object or find room from db
    const room = req.body.room || await RoomModel.findOne({ _id: req.params.roomId });

    if (!room) return next(new AppError("Room not found!", 400));

    const canvas = await CanvasModel.create({
        roomId: room._id,
        createdBy: req.user.userId,
        createdAt: Date.now()
    });

    //save canvas id in room
    room.canvases.push(canvas.id);
    await room.save();

    return res.status(200).json({
        status: "success",
        data: {
            roomId: room.id,
            canvas
        }
    });
});

/**
 * @name deleteCanvas
 * @description delete canvas from room
 */
exports.deleteCanvas = catchAsync(async (req, res, next) => {

    const canvas = await CanvasModel.deleteOne({
        roomId: req.params.roomId,
        canvasId: req.params.canvasId
    });

    if (!canvas.deletedCount)
        return next(new AppError("Failed to delete canvas!", 400));

    //remove canvas id from room
    await RoomModel.updateOne({ _id: req.params.roomId }, {
        $pull: { canvases: req.params.canvasId }
    });

    return res.status(200).json({
        status: "success",
        data: {
            canvasId: req.params.canvasId,
        }
    });
});

/**
 * @name updateCanvasObject
 * @description update the state of canvas object
 */
exports.updateCanvasObject = catchAsync(async (req, res, next) => {

    const canvas = await CanvasModel.findOne({
        roomId: req.params.roomId,
        _id: req.params.canvasId
    });
 
    if (!canvas)
        return next(new AppError("Canvas not found!", 404));

    if (!canvas[req.body.objectType])
        return next(new AppError("Invalid canvas object!", 404));

    const objectIndex = canvas[req.body.objectType].findIndex(object => object._id.toString() === req.params.objectId);

    if (objectIndex < 0)
        return next(new AppError("Canvas object not found!", 404));

    //update object
    canvas[req.body.objectType][objectIndex].state = req.body.state || {};
    await canvas.save();

    return res.status(200).json({
        status: "success",
        data: {
            canvasId: req.params.canvasId,
        }
    });
});

/**
 * @name updateCanvasContent
 * @description update the main content of canvas object
 */
exports.updateCanvasContent = catchAsync(async (req, res, next) => {

    const canvas = await CanvasModel.findOne({
        roomId: req.params.roomId,
        _id: req.params.canvasId
    });

    if (!canvas)
        return next(new AppError("Canvas not found!", 404));

    if (!canvas[req.body.objectType])
        return next(new AppError("Invalid canvas object!", 404));

    const objectIndex = canvas[req.body.objectType].findIndex(object => object._id.toString() === req.params.objectId);

    if (objectIndex < 0)
        return next(new AppError("Canvas object not found!", 404));

    //update object
    canvas[req.body.objectType][objectIndex].text = req.body.content;
    await canvas.save();

    return res.status(200).json({
        status: "success",
        data: {
            canvasId: req.params.canvasId,
        }
    });
});