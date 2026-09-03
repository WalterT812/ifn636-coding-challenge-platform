const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true, // encrypted password, not plain text
        },
        role: {
            type: String,
            enum: ['SUPER_ADMIN', 'ADMIN', 'USER'], // admin or learner
            default: 'USER',
        },
        active: {
            type: Boolean,
            default: true, // false = cannot login
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('User', userSchema);
