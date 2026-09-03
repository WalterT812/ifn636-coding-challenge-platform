const express = require('express');
const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { permissions } = require('../permissions');

const router = express.Router();
const canSubmit = requireRole(...permissions.learnerChallenges);

function acceptsNewSubmission(status) {
    return status === 'PUBLISHED';
}

router.post('/', auth, canSubmit, async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.body.challengeId);

        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        // closed and draft cannot take a new submission
        if (!acceptsNewSubmission(challenge.status)) {
            return res.status(400).json({ message: 'This challenge does not accept new submissions' });
        }

        const submission = await Submission.create({
            challenge: challenge._id,
            learner: req.user.userId,
        });

        return res.status(201).json(submission);
    } catch (error) {
        console.error(error.message);
        return res.status(400).json({ message: 'Cannot create submission' });
    }
});

module.exports = router;
