const errorLogs = require('../utils/errorLogs.js');

//send simplify error to client in production mode
const sendErrorProd = (res, err) => {
    //operational error, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
        //Programming error or other unknown error
    } else {
        //log to check error
        console.error("ERROR : \n", err);
        //then send to client
        res.status(500).json({
            status: "error",
            message: "Something went very wrong",
        });
    }
};


//send error with extra information to client in development mode
const sendErrorDev = (res, err) => {
    return res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};


//handle application errors
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    //send error in production mode
    if (process.env.NODE_ENV === "production") {
        err = errorLogs.simplifyErrorLog(err);
        console.log(err)
        sendErrorProd(res, err);
    }
    //send error in development mode
    else {
        sendErrorDev(res, err);
    }
};