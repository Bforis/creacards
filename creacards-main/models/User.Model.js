const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bcrypt = require('bcryptjs');

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "Please provide name!"],
        minlength: [3, "Minimum character should be greater than 2"],
        maxlength: [20, "Maximum character should be less than 21"],
    },
    profileURL: String,
    role: {
        type: String,
        lowercase: true,
        required: true,
        enum: {
            values: ['user', 'admin'],
            message: "{VALUE} subscription not available"
        },
        default: 'user'
    },
    subscription: Date,
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        select: false,
    },
    passwordChangedAt: {
        type: Date,
        select: false
    },
    createdAt: Date
});

//MIDDLEWARES:- Trigger before and after db operation.

//1: hash user password before saving user detaills in database
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    //hash user password
    this.password = await bcrypt.hash(this.password, 2);
    //move to next function to save user details
    return next();
});

//METHODS:- We can define schema methods to handle small operations and keep controller functions clean

//1: verify entered password is correct or not
userSchema.methods.isPasswordMatched = function (password, hashedPassword) {
    //compare hashed password with normal password
    return bcrypt.compareSync(password, hashedPassword);
}

module.exports = mongoose.model('user', userSchema);