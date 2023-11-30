const GraphicModel = require('../models/Graphic.Model');

const APIFeatures = require('../utils/APIFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const bucketManager = require('../services/bucketManager');

/**
 * @name storeGraphicPath
 * @description store graphic path
 */
exports.storeGraphicPath = catchAsync(async (req, res, next) => {

    const payload = {};

    //if image is uploaded by user
    if (req.user.role !== "admin") {
        payload["owner"] = req.user.userId;
        payload["premium"] = false;
    } else {
        payload["premium"] = req.body.premium ? JSON.parse(req.body.premium) : false;
    }

    //map file field with fileurl
    req.body.filesInfo.forEach(file => (payload[file.field] = file.fileurl));

    //insert image in database
    const graphic = await GraphicModel.create({
        _id: req.body.pathId,
        title: req.body.title,
        ...payload,
        createdAt: Date.now()
    });

    return res.status(200).json({
        status: "success",
        data: {
            graphic
        }
    });
});

/**
 * @name fetchGraphics
 * @description fetch uploaded graphics
 */
exports.fetchGraphics = catchAsync(async (req, res, next) => {
    
    const feature = new APIFeatures(GraphicModel.find({
        $or: [
            { $eq: ["owner", undefined] }, //find admin uploaded images
            { $eq: ["owner", req.user.userId] } //find user uploaded images
        ]
    }), req.query)
        .limitFields(['-__v']) //remove unnecessary fields
        .paginate() //limit number of graphics per request
        .sort() //sort latest graphics

    //excecute query
    const graphics = await feature.query.lean();

    return res.status(200).json({
        status: "success",
        data: {
            graphics
        }
    });
});

/**
 * @name deleteGraphic
 */
exports.deleteGraphic = catchAsync(async (req, res, next) => {
    const query = { _id: req.params.graphicId };

    if (req.user.role !== "admin") {
        query["owner"] = req.user.userId;
    }

    const graphic = await GraphicModel.findOne(query);

    if (!graphic)
        return next(new AppError("Graphic not found!", 404));

    //extract image path from url
    const files = [];
    for await (field of ["original", "preview"]) {
        if (!graphic[field]) continue;
        //extract path from url
        const filepath = new URL(graphic[field]).pathname;
        files.push({ Key: filepath });
    };

    //delete file from aws bucket
    const bucketres = await bucketManager.deleteFile(files);

    //remove image path from db
    if (bucketres.status === "success") {
        await graphic.remove();
    }

    return res.status(200).json({
        status: "success",
        data: null
    });
});