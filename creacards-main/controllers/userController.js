const UserModel = require('../models/User.Model');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * @name fetchProfile
 * @description fetch profile of user
 */
exports.fetchProfile = catchAsync(async (req, res, next) => {
    const user = await UserModel.findOne({ _id: req.user.userId })
        .select('name email subscription')
        .lean();

    if (!user) return next(new AppError("User not found!", 400));

    return res.status(200).json({
        status: "success",
        data: {
            user
        }
    });
});