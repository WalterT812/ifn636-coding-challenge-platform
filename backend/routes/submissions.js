const express = require('express');
const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission');
const Progress = require('../models/Progress');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { permissions } = require('../permissions');

const router = express.Router();
const canSubmit = requireRole(...permissions.learnerChallenges);

function isHttpUrl(value) {
    try {
        const url = new URL(String(value || '').trim());
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (error) {
        return false;
    }
}

router.post('/', auth, canSubmit, async (req, res) => {
    try {
        const repoUrl = String(req.body.repoUrl || '').trim();
        const commitUrl = String(req.body.commitUrl || '').trim();
        const explanation = String(req.body.explanation || '').trim();
        const testEvidence = String(req.body.testEvidence || '').trim();
        const fieldErrors = {};

        if (!repoUrl) {
            fieldErrors.repoUrl = 'This field is required';
        } else if (!isHttpUrl(repoUrl)) {
            fieldErrors.repoUrl = 'Please enter a valid URL';
        }

        if (!commitUrl) {
            fieldErrors.commitUrl = 'This field is required';
        } else if (!isHttpUrl(commitUrl)) {
            fieldErrors.commitUrl = 'Please enter a valid URL';
        }

        if (!explanation) {
            fieldErrors.explanation = 'This field is required';
        }

        if (!testEvidence) {
            fieldErrors.testEvidence = 'This field is required';
        }

        if (Object.keys(fieldErrors).length > 0) {
            return res.status(400).json(fieldErrors);
        }

        const challenge = await Challenge.findById(req.body.challengeId);

        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        if (challenge.status !== 'PUBLISHED') {
            return res.status(400).json({ message: 'This challenge does not accept new submissions' });
        }

        const existing = await Submission.find({
            learner: req.user.userId,
            challenge: challenge._id,
        });

        if (existing.length >= 10) {
            return res.status(400).json({ message: 'You can submit at most 10 attempts' });
        }

        const underReview = existing.some((item) => item.status === 'UNDER_REVIEW');

        if (underReview) {
            return res.status(400).json({ message: 'You already have an attempt under review' });
        }

        await Submission.updateMany(
            { learner: req.user.userId, challenge: challenge._id },
            { $set: { selectedForReview: false } }
        );

        const submission = await Submission.create({
            challenge: challenge._id,
            learner: req.user.userId,
            repoUrl,
            commitUrl,
            explanation,
            testEvidence,
            attemptNumber: existing.length + 1,
            submittedAt: new Date(),
            status: 'SUBMITTED',
            selectedForReview: true,
        });

        await Progress.findOneAndUpdate(
            { learner: req.user.userId, challenge: challenge._id },
            { status: 'IN_PROGRESS' },
            { upsert: true, new: true }
        );

        return res.status(201).json(submission);
    } catch (error) {
        console.error(error.message);
        return res.status(400).json({ message: 'Cannot create submission' });
    }
});

// learner can only see their own attempts, including cancelled
router.get('/', auth, canSubmit, async (req, res) => {
    try {
        const filter = { learner: req.user.userId };

        if (req.query.challengeId) {
            filter.challenge = req.query.challengeId;
        }

        const submissions = await Submission.find(filter)
            .populate('challenge', 'challengeNumber title')
            .sort({ submittedAt: -1 });

        return res.json(submissions);
    } catch (error) {
        console.error(error.message);
        return res.status(400).json({ message: 'Cannot load attempts' });
    }
});

router.get('/:id', auth, canSubmit, async (req, res) => {
    try {
        const submission = await Submission.findOne({
            _id: req.params.id,
            learner: req.user.userId,
        }).populate('challenge', 'challengeNumber title');

        if (!submission) {
            return res.status(404).json({ message: 'Attempt not found' });
        }

        return res.json(submission);
    } catch (error) {
        return res.status(404).json({ message: 'Attempt not found' });
    }
});

module.exports = router;
