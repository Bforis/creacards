/**
 *  this file contains methods which is used to convert error message in simple language for client
 */

const AppError = require("./appError");

const handleCastErrorDB = (error) => {
    const message = `Invalid ${error.path}: ${error.value}.`;
    return new AppError(message, 400);
};

const handleDupErrorDB = (error) => {
    const prop = Object.keys(error.keyValue)[0];
    const message = `Duplicate ${prop} ${error.keyValue[prop]} already exists`;
    return new AppError(message, 400);
};

const handleInvalidErrorDB = (error) => {
    const err = Object.values(error.errors).map(er => `${er.message}`)
    const message = `Invalid inputs. ${err.join('. ')}`;
    return new AppError(message, 400);
}

const handleTokenError = () => new AppError("Invalid token, please login again", 401)

const handleTokenExpireError = () => new AppError("Your token has expired, please login again", 401)

exports.simplifyErrorLog = (err) => {
    if (err.name === "BulkWriteError") err = handleBulkWriteError(err);
    if (err.name === "CastError") err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDupErrorDB(err);
    if (err.name === "ValidationError") err = handleInvalidErrorDB(err);
    if (err.name === "JsonWebTokenError") err = handleTokenError(err);
    if (err.name === "TokenExpiredError") err = handleTokenExpireError(err);
    return err;
}
