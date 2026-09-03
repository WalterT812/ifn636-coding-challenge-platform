const express = require('express');
const Challenge = require('../models/Challenge');
const auth = require('../middleware/auth');

const router = express.Router();

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
            keywords: req.body.keywords,
            description: req.body.description,
            testExample: req.body.testExample,
            expectedResult: req.body.expectedResult,
            starterRepo: req.body.starterRepo,
            reviewCriteria: req.body.reviewCriteria,
            createdBy: req.user.userId,
        });

        return res.status(201).json(challenge);
    } catch (error) {
        console.error(error.message);
        return res.status(400).json({ message: 'Cannot create challenge' });
    }
});

module.exports = router;
