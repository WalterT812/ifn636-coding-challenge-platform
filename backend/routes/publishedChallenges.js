const express = require('express');
const Challenge = require('../models/Challenge');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { permissions } = require('../permissions');

const router = express.Router();

// learner browse API: only published, newest first
router.get('/', auth, requireRole(...permissions.learnerChallenges), async (req, res) => {
    try {
        const challenges = await Challenge.find({ status: 'PUBLISHED' })
            .select('challengeNumber title type tier publishedAt')
            .sort({ publishedAt: -1 });

        return res.json(challenges);
    } catch (error) {
        console.error(error.message);
        return res.status(400).json({ message: 'Cannot load challenges' });
    }
});

module.exports = router;
