const express = require('express');
const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission');
const Progress = require('../models/Progress');
const User = require('../models/User');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { permissions } = require('../permissions');

const router = express.Router();
const canSubmit = requireRole(...permissions.learnerChallenges);
const canReview = requireRole(...permissions.reviewQueue);

const waitingForReview = {
    selectedForReview: true,
    status: { $nin: ['CANCELLED', 'PASSED', 'FAILED'] },
};

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

// admin queue: latest selected attempts, cancelled is hidden
router.get('/review-queue', auth, canReview, async (req, res) => {
    try {
        const submissions = await Submission.find(waitingForReview)
            .populate('challenge', 'challengeNumber title')
            .populate('learner', 'username')
            .populate('reviewer', 'username role')
            .sort({ submittedAt: -1 });

        return res.json(submissions);
    } catch (error) {
        console.error(error.message);
        return res.status(400).json({ message: 'Cannot load review queue' });
    }
});

router.get('/review-queue/:id', auth, canReview, async (req, res) => {
    try {
        const submission = await Submission.findOne({
            _id: req.params.id,
            ...waitingForReview,
        })
            .populate('challenge', 'challengeNumber title')
            .populate('learner', 'username')
            .populate('reviewer', 'username role');

        if (!submission) {
            return res.status(404).json({ message: 'Attempt not found' });
        }

        return res.json(submission);
    } catch (error) {
        return res.status(404).json({ message: 'Attempt not found' });
    }
});

router.get('/reviewers', auth, canReview, async (req, res) => {
    try {
        const reviewers = await User.find({
            role: { $in: ['ADMIN', 'ADMIN_MANAGER'] },
            active: true,
        }).select('username role');

        return res.json(reviewers);
    } catch (error) {
        console.error(error.message);
        return res.status(400).json({ message: 'Cannot load reviewers' });
    }
});

// only one admin can claim an attempt
router.post('/review-queue/:id/claim', auth, canReview, async (req, res) => {
    try {
        const submission = await Submission.findOneAndUpdate(
            {
                _id: req.params.id,
                selectedForReview: true,
                status: 'SUBMITTED',
            },
            {
                $set: {
                    status: 'UNDER_REVIEW',
                    reviewer: req.user.userId,
                },
            },
            { new: true }
        )
            .populate('challenge', 'challengeNumber title')
            .populate('learner', 'username')
            .populate('reviewer', 'username role');

        if (submission) {
            return res.json(submission);
        }

        const existing = await Submission.findById(req.params.id);

        if (!existing || existing.status === 'CANCELLED') {
            return res.status(404).json({ message: 'Attempt not found' });
        }

        return res.status(409).json({ message: 'This attempt is already under review' });
    } catch (error) {
        console.error(error.message);
        return res.status(400).json({ message: 'Cannot start review' });
    }
});

router.post('/review-queue/:id/release', auth, canReview, async (req, res) => {
    try {
        const submission = await Submission.findOneAndUpdate(
            {
                _id: req.params.id,
                status: 'UNDER_REVIEW',
                reviewer: req.user.userId,
            },
            {
                $set: {
                    status: 'SUBMITTED',
                    reviewer: null,
                },
            },
            { new: true }
        )
            .populate('challenge', 'challengeNumber title')
            .populate('learner', 'username')
            .populate('reviewer', 'username role');

        if (!submission) {
            return res.status(403).json({ message: 'You cannot release this attempt' });
        }

        return res.json(submission);
    } catch (error) {
        console.error(error.message);
        return res.status(400).json({ message: 'Cannot release review' });
    }
});

router.post('/review-queue/:id/reassign', auth, canReview, async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN_MANAGER') {
            return res.status(403).json({ message: 'Only an Admin Manager can reassign a review' });
        }

        const nextReviewer = await User.findOne({
            _id: req.body.reviewerId,
            role: { $in: ['ADMIN', 'ADMIN_MANAGER'] },
            active: true,
        });

        if (!nextReviewer) {
            return res.status(400).json({ message: 'Please choose a valid reviewer' });
        }

        const submission = await Submission.findOneAndUpdate(
            {
                _id: req.params.id,
                status: 'UNDER_REVIEW',
            },
            {
                $set: {
                    reviewer: nextReviewer._id,
                },
            },
            { new: true }
        )
            .populate('challenge', 'challengeNumber title')
            .populate('learner', 'username')
            .populate('reviewer', 'username role');

        if (!submission) {
            return res.status(400).json({ message: 'This attempt is not locked for review' });
        }

        return res.json(submission);
    } catch (error) {
        console.error(error.message);
        return res.status(400).json({ message: 'Cannot reassign review' });
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

router.patch('/:id/cancel', auth, canSubmit, async (req, res) => {
    try {
        const submission = await Submission.findOne({
            _id: req.params.id,
            learner: req.user.userId,
        });

        if (!submission) {
            return res.status(404).json({ message: 'Attempt not found' });
        }

        if (submission.status === 'UNDER_REVIEW') {
            return res.status(400).json({ message: 'This attempt is under review and cannot be cancelled' });
        }

        if (submission.status !== 'SUBMITTED') {
            return res.status(400).json({ message: 'This attempt cannot be cancelled' });
        }

        submission.status = 'CANCELLED';
        await submission.save();
        return res.json(submission);
    } catch (error) {
        console.error(error.message);
        return res.status(400).json({ message: 'Cannot cancel attempt' });
    }
});

module.exports = router;
