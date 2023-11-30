const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
//utility modules
const AppError = require('./utils/appError');
//models
const CardModel = require('./models/Card.Model');
//controller modules
const globalErrorHandler = require('./controllers/errorController');
const authController = require('./controllers/authController');
//api routes
const userRoutes = require('./routes/apis/userRoutes');
const planRoutes = require('./routes/apis/planRoutes');
const imageRoutes = require('./routes/apis/imageRoutes');
const graphicRoutes = require('./routes/apis/graphicRoutes');
const roomRoutes = require('./routes/apis/roomRoutes');
const cardRoutes = require('./routes/apis/cardRoutes');

const app = express();

app.use(cookieParser());
//allow all origin to request on this server
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Token");
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, PATCH, DELETE, OPTIONS');
    next();
});

//serve static files
app.use('/public', express.static('public'));
//parse req.body in json format
app.use(express.json());

//page routes

//validate room login
app.get('/', async (req, res) => {
    try {
        if (!req.query.roomId) return res.redirect(process.env.REDIRECT);
        //sign token for guest
        if (!req.query.token) {
            req.query.token = jwt.sign({
                userId: mongoose.Types.ObjectId(),
                role: "guest",
            }, process.env.TOKEN_SECRET, { expiresIn: `${process.env.TOKEN_EXPIRES_IN_MIN}` });
        }
        //verify token
        const user = jwt.verify(req.query.token, process.env.TOKEN_SECRET);

        return res.cookie("token", req.query.token, {
            expiresIn: user.exp,
            maxAge: user.exp
        }).redirect(`/${req.query.roomId}`);

    } catch (err) {
        return res.redirect(`${process.env.REDIRECT}?roomId=${req.query.roomId}`);
    }
})

app.get('/cards/:cardId', async (req, res) => {
    try {
        const card = await CardModel.findOne({ _id: req.params.cardId }).lean();
        if (!card) return res.redirect(process.env.REDIRECT_URL);
        const file = path.resolve(path.join(__dirname, 'public/card.html'));
        return res.status(200).sendFile(file);
    } catch (err) {
        return res.redirect(process.env.REDIRECT_URL);
    }
});

app.get('/:roomId', authController.authorizeRegisteredPage(['admin', 'user', 'guest']), (req, res) => {
    const file = path.resolve(path.join(__dirname, 'public/room.html'));
    return res.status(200).sendFile(file);
});

//Mount all routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/plans', planRoutes);
app.use('/api/v1/images', imageRoutes);
app.use('/api/v1/graphics', graphicRoutes);
app.use('/api/v1/rooms', roomRoutes);
app.use('/api/v1/cards', cardRoutes);

//Handle unhandled routes
app.all('*', (req, res, next) => {
    const message = `${req.originalUrl} not found`;
    return next(new AppError(message, 404));
});

//Handle errors occured in routes
app.use(globalErrorHandler);

module.exports = app;