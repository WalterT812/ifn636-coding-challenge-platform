const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        type:{
            type: String,
            enum: ['Debugging', 'Feature', 'Refactoring', 'Security'], // challenge type
            required: true,
        },
        tier: {
            type: Number,
            min: 1,
            max: 8, // difficulty 1 to 8
            required: true,
        },
        keywords: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        testExample: {
            type: String,
            required: true,
        },
        expectedResult: {
            type: String,
            required: true,
        },
        starterRepo: {
            type: String,
            required: true,
            trim: true,
        },
        reviewCriteria: {
            type: String,
            required: true,
        },
        environment: {
            type: String,
            default: 'Python 3', // fixed for this unit
        },
        status: {
            type: String,
            enum: ['DRAFT', 'PUBLISHED', 'CLOSED'], // draft until publish
            default: 'DRAFT',
        },
        challengeNumber: {
            type: String,
            trim: true, // like CCP-CH-001, auto later
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // which admin created it
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Challenge', challengeSchema);