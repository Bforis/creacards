const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');

const AppError = require('./utils/appError');

const UserModel = require('./models/User.Model');
const RoomModel = require('./models/Room.Model');
const CanvasModel = require('./models/Canvas.Model');
const ImageModel = require('./models/Image.Model');
const GraphicModel = require('./models/Graphic.Model');

//setup socket with server
const app = require('./app');
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "*"
    }
});


//Authentication middleware
io.use(function (socket, next) {
    const cookies = cookie.parse(socket.handshake.headers.cookie);
    if (cookies.token) {
        jwt.verify(cookies.token, process.env.TOKEN_SECRET, async function (err, decoded) {
            if (err) {
                socket.emit('disconnected', "Authentication error");
                return next(new AppError('Authentication error', 401));
            }
            const user = await UserModel.findOne({ _id: decoded.userId }).lean();
            if (user && user.subscription) {
                //find remaining days for subscription expiry
                const remDays = new Date(user.subscription).getTime() - Date.now();
                decoded.activePlan = remDays ? true : false;
            } else {
                decoded.activePlan = false;
            }
            socket.roomUser = decoded;
            next();
        });
    }
    else {
        return next(new AppError('You are not authorized to connect with socket', 401));
    }
})

//socket listener
io.on('connection', (socket) => {
    console.log(`New User Connected!`);

    //JOIN ROOM
    socket.on('join-room', async (roomId) => {
        try {
            //insert user in room
            await RoomModel.updateOne({ _id: roomId }, { $addToSet: { users: socket?.roomUser?.userId } });
            socket.join(roomId); //add user in rooms
            socket.emit('response', { status: "success", message: 'room joined!' });
        } catch (err) {
            socket.emit('error', err.message);
        }
    });

    //HANDLE NEW IMAGE ADDITION EVENT
    socket.on('new-image-added', async ({ roomId, payload }) => {
        try {

            //fetch image details
            const validateImage = await ImageModel.findOne({ _id: payload.imageId }).lean();

            if (!validateImage) throw new AppError("Image not found!", 404);
            if (validateImage.premium && !socket.roomUser.activePlan)
                throw new AppError("Please buy premium subscription!", 400);

            //update image
            const image = {
                _id: mongoose.Types.ObjectId(),
                imageId: payload.imageId,
                state: payload.state
            }

            //update canvas doc in db
            await CanvasModel.updateOne({ roomId: roomId, _id: payload.canvasId },
                { $push: { "images": image } });

            //create data structure similar to image schema inside canvas schema
            const data = {
                _id: image._id,
                imageId: {
                    _id: payload.imageId,
                    original: payload.imageURL
                },
                state: payload.state
            }

            //send image to all users in room including sender
            io.to(roomId).emit('new-image', { canvasId: payload.canvasId, data });
            //trigger close panel event
            socket.emit('close-panel', true);
        } catch (err) {
            socket.emit('error', err.message);
        }
    });

    //HANDLE NEW TEXT ADDITION EVENT
    socket.on('new-text-added', async ({ roomId, payload }) => {
        try {
            //update text on canvas
            const data = {
                _id: mongoose.Types.ObjectId(),
                text: payload.text,
                state: payload.state
            }

            await CanvasModel.updateOne({ roomId: roomId, _id: payload.canvasId },
                { $push: { "texts": data } });

            io.to(roomId).emit('new-text', { canvasId: payload.canvasId, data });
            //trigger close panel event
            socket.emit('close-panel', true);
        
        } catch (err) {
            socket.emit('error', err.message);
        }
    });

    //HANDLE NEW BACKGROUND IMAGE ADDITION  EVENT
    socket.on('new-graphic-added', async ({ roomId, payload }) => {
        try {
            //fetch image details
            const validateGraphic = await GraphicModel.findOne({ _id: payload.graphicId }).lean();

            if (!validateGraphic) throw new AppError("Image not found!", 404);
            if (validateGraphic.premium && !socket.roomUser.activePlan)
                throw new AppError("Please buy premium subscription!", 400);

            //update background image 
            await CanvasModel.updateOne({ roomId: roomId, _id: payload.canvasId },
                { "backgroundImage.imageId": payload.graphicId });

            //update bg image on other users canvas
            io.to(roomId).emit('new-graphic', payload);
            //trigger close panel event
            socket.emit('close-panel', true);
        } catch (err) {
            socket.emit('error', err.message);
        }
    });

    //HANDLE REALTIME OBJECT STATE UPDATE
    socket.on('object-interaction', ({ roomId, payload }) => {
        socket.to(roomId).emit('object-interaction', payload);
    })

    //HANDLE REALTIME TEXT UPDATE
    socket.on('text-changed', ({ roomId, payload }) => {
        socket.to(roomId).emit('text-changed', { ...payload, action: 'text:editing' });
    });

    //DELETE OBJECTS
    socket.on('delete-objects', async ({ roomId, canvasId, payload }) => {
        try {
            const result = await CanvasModel.updateOne({ roomId, _id: canvasId }, {
                $pull: {
                    "texts": { _id: { $in: payload.texts } },
                    "images": { _id: { $in: payload.images } }
                }
            });
            if (!result.modifiedCount) throw { message: "Failed to delete objects" };

            io.to(roomId).emit('objects-deleted', { canvasId, payload: [...payload.texts, ...payload.images] });
        } catch (err) {
            socket.emit('error', err.message);
        }
    });
});

module.exports = server;