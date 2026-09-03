const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
    {
        challenge: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Challenge',
            required: true,
        },
        learner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        repoUrl: {
            type: String,
            required: true,
            trim: true,
        },
        commitUrl: {
            type: String,
            required: true,
            trim: true,
        },
        explanation: {
            type: String,
            required: true,
        },
        testEvidence: {
            type: String,
            required: true,
        },
        attemptNumber: {
            type: Number,
            required: true,
            min: 1,
            max: 10,
        },
        submittedAt: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            // cancelled stays in history, it is not deleted
            enum: ['SUBMITTED', 'UNDER_REVIEW', 'PASSED', 'FAILED', 'CANCELLED'],
            default: 'SUBMITTED',
        },
        selectedForReview: {
            type: Boolean,
            default: false, // latest attempt is set true
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Submission', submissionSchema);
