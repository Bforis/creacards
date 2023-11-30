require('dotenv').config(); //parse .env file and add environment variables in process.env

const server = require('./socket');
const mongoose = require('mongoose');

//initiate database connection
mongoose.connect(process.env.MONGOURI || 'mongodb://127.0.0.1:27017/cardDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('connected'))
    .catch(err => {
        console.log(err.name, err.message);
    });

//server port config
const port = process.env.PORT || 5000;

//start server
server.listen(port, () => console.log(`up and running on port ${port}`));

//handle unexpected errors
process.on('error', (err) => {
    console.log(err);
    console.log(err.name, err.message);
});

process.on('uncaughtException', err => {
    console.log(err);
    console.log(err.name, err.message);
    process.exit(1)
});

process.on('unhandledRejection', (err) => {
    console.log(err.name, err.message);
    console.log(err.stack)
    //wait for server to finish all request
    server.close(() => process.exit(1))
});