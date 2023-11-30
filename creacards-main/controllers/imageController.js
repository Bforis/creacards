const ImageModel = require('../models/Image.Model');

const APIFeatures = require('../utils/APIFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const bucketManager = require('../services/bucketManager');

/**
 * @name storeImagePath
 * @description store image path
 */
exports.storeImagePath = catchAsync(async (req, res, next) => {

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
    const image = await ImageModel.create({
        _id: req.body.pathId,
        title: req.body.title,
        ...payload,
        createdAt: Date.now()
    });

    return res.status(200).json({
        status: "success",
        data: {
            image
        }
    });
});

/**
 * @name fetchImages
 * @description fetch uploaded image
 */
exports.fetchImages = catchAsync(async (req, res, next) => {

    const feature = new APIFeatures(ImageModel.find({
        $or: [
            { $eq: ["owner", undefined] }, //find admin uploaded images
            { $eq: ["owner", req.user.userId] } //find user uploaded images
        ]
    }), req.query)
        .limitFields(['-__v']) //remove unnecessary fields
        .paginate() //limit number of images per request
        .sort() //sort latest images

    //excecute query
    const images = await feature.query.lean();

    return res.status(200).json({
        status: "success",
        data: {
            premiumAccess: req.user.activePlan,
            images
        }
    });
});

/**
 * @name deleteImage
 */
exports.deleteImage = catchAsync(async (req, res, next) => {
    const query = { _id: req.params.imageId };

    if (req.user.role !== "admin") {
        query["owner"] = req.user.userId;
    }

    const image = await ImageModel.findOne(query);

    if (!image)
        return next(new AppError("Image not found!", 404));

    //extract image path from url
    const files = [];
    for await (field of ["original", "preview"]) {
        if (!image[field]) continue;
        //extract path from url
        const filepath = new URL(image[field]).pathname;
        files.push({ Key: filepath });
    };
    //delete file from aws bucket
    const bucketres = await bucketManager.deleteFile(files);

    //remove image path from db
    if (bucketres.status === "success") {
        await image.remove();
    }

    return res.status(200).json({
        status: "success",
        data: null
    });
});