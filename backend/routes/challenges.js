const express = require('express');
const Challenge = require('../models/Challenge');
const auth = require('../middleware/auth');

const router = express.Router();

async function nextChallengeNumber() {
    const count = await Challenge.countDocuments();
    return 'CCP-CH-' + String(count + 1).padStart(3, '0');
}

// create a challenge, admin only
router.post('/', auth, async (req, res) => {
    try {
        // SUPER_ADMIN cannot manage challenges
        if (req.user.role !== 'ADMIN' && req.user.role !== 'ADMIN_MANAGER') {
            return res.status(401).json({ message: 'Only admin can create a challenge' });
        }

        const challenge = await Challenge.create({
            title: req.body.title,
            type: req.body.type,
            tier: req.body.tier,
            keywords: Array.isArray(req.body.keywords)
                ? req.body.keywords
                : String(req.body.keywords || '')
                    .split(',')
                    .map((word) => word.trim())
                    .filter(Boolean),
            description: req.body.description,
            testExample: req.body.testExample,
            expectedResult: req.body.expectedResult,
            starterRepo: req.body.starterRepo,
            reviewCriteria: req.body.reviewCriteria,
            challengeNumber: await nextChallengeNumber(),
            createdBy: req.user.userId,
        });

        return res.status(201).json(challenge);
    } catch (error) {
        console.error(error.message);
        return res.status(400).json({ message: 'Cannot create challenge' });
    }
});

module.exports = router;
