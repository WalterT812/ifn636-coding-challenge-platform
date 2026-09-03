const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
    {
        learner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        challenge: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Challenge',
            required: true,
        },
        status: {
            type: String,
            enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'FINAL_FAILED'],
            default: 'NOT_STARTED',
        },
    },
    {
        timestamps: true,
    }
);

progressSchema.index({ learner: 1, challenge: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
