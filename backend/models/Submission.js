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
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Submission', submissionSchema);
