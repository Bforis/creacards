const UserModel = require('../models/User.Model');

const jwt = require('jsonwebtoken');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * @name signUp
 * @description register user in db
 */
exports.signUp = catchAsync(async (req, res, next) => {

    const user = await UserModel.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        createdAt: Date.now()
    });

    //store user data in req object
    req.body.user = user;
    //move to createAuthenticationToken function to generate jwt token
    return next();
});

/**
 * @name login
 * @deprecated verify user credential and generate jwt token
 */
exports.login = catchAsync(async (req, res, next) => {

    //find user with email
    const user = await UserModel.findOne({ email: req.body.email }).select('role subscription password');

    //if user not found send error response
    if (!user) return next(new AppError("User not found!", 404));

    //if password not matched send error response
    if (!user.isPasswordMatched(req.body.password, user.password))
        return next(new AppError("Password is incorrect!", 400));

    //store user details in req object
    req.body.user = user;

    //move to next function to generate jwt token
    return next();
})

/**
 * @name createAuthenticationToken
 * @description create jwt token after login/signup
 */
exports.createAuthenticationToken = catchAsync(async (req, res, next) => {
    //store user details in payload
    const payload = {
        userId: req.body.user?._id,
        role: req.body.user?.role,
        subscription: req.body.user?.subscription
    };

    //sign payload with token secret
    const token = jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: `${process.env.TOKEN_EXPIRES_IN_MIN}` });

    //send token to user in response
    return res.status(200).json({
        status: "authorized",
        token,
        data: {
            ...payload
        }
    });
});

/**
 * @name authorizeRegisteredUser
 * @description allow only registered users to access the resource
 */
exports.authorizeRegisteredUser = (roles) => {

    //return function
    return async (req, res, next) => {
        //get jwt token from cookies or headers
        const token = req.cookies.token || req.headers.token;
        //if token not available send error resposne
        if (!token) return next(new AppError("You are not authorized!", 401));

        try {
            //verify user token
            const userPayload = jwt.verify(token, process.env.TOKEN_SECRET);
            //if route roles does not match with user role prevent user from accessing route
            if (!roles.includes(userPayload.role)) throw { message: "Permision denied" };

            //check subscription expiry
            const user = await UserModel.findOne({ _id: userPayload.userId }).lean();

            if (user && user.subscription) {
                //find remaining days for subscription expiry
                const remDays = new Date(user.subscription).getTime() - Date.now();
                userPayload.activePlan = remDays ? true : false;
            } else {
                userPayload.activePlan = false;
            }
            //store user payload in req.body object to access in next function
            req.user = userPayload;
        } catch (err) {
            return res.status(401).json({
                status: "unauthorized",
                message: err.message
            });
        }
        //move to next function
        return next();
    }
}

/**
 * @name authorizeRegisteredPage
 * @description allow only registered users to access the resource
 */
exports.authorizeRegisteredPage = (roles) => {

    //return function
    return async (req, res, next) => {
        //get jwt token from cookies or headers
        const token = req.cookies.token || req.headers.token;
        //if token not available send error resposne
        if (!token) return res.redirect(`${process.env.REDIRECT}?roomId=${req.params.roomId}`);
        try {
            //verify user token
            const userPayload = jwt.verify(token, process.env.TOKEN_SECRET);
            //if route roles does not match with user role prevent user from accessing route
            if (!roles.includes(userPayload.role)) throw { message: "Permision denied" };
            //check subscription expiry
            const user = await UserModel.findOne({ _id: userPayload.userId }).lean();
            if (user && user.subscription) {
                //find remaining days for subscription expiry
                const remDays = new Date(user.subscription).getTime() - Date.now();
                userPayload.activePlan = remDays ? true : false;
            } else {
                userPayload.activePlan = false;
            }
            //store user payload in req.body object to access in next function
            req.user = userPayload;
        } catch (err) {
            console.log(err.message);
            return res.status(401).redirect(`${process.env.REDIRECT}?roomId=${req.params.roomId}`);
        }
        //move to next function
        return next();
    }
}

/**
 * @name verifyToken
 * @description verify user token on page routing
 */
exports.verifyToken = async (req, res) => {

    //get jwt token from cookies or headers
    const token = req.cookies || req.headers.token;
    //if token not available send error resposne
    if (!token) return next(new AppError("You are not authorized!", 401));

    try {
        //verify user token
        const userPayload = jwt.verify(token, process.env.TOKEN_SECRET);

        //move to next function
        return res.status(401).json({
            status: "authorized",
            data: {
                user: userPayload
            }
        });
    } catch (err) {
        return res.status(401).json({
            status: "unauthorized",
            message: err.message
        });
    }
};