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
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other'],
            default: null, // Prefer not to say is stored as null
        },
        role: {
            type: String,
            // SUPER_ADMIN: seed account, manage admins only, no challenges or reviews
            // ADMIN_MANAGER: manage other admins, learners, challenges, and reviews
            // ADMIN: manage learners and challenges, review attempts, cannot manage admins
            // LEARNER = student; USER is the old name
            enum: ['SUPER_ADMIN', 'ADMIN_MANAGER', 'ADMIN', 'LEARNER', 'USER'],
            default: 'LEARNER',
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
