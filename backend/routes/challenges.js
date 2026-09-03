const express = require('express');
const Challenge = require('../models/Challenge');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { permissions } = require('../permissions');

const router = express.Router();
const canManageChallenges = requireRole(...permissions.challengeManagement);

async function nextChallengeNumber() {
    const count = await Challenge.countDocuments();
    return 'CCP-CH-' + String(count + 1).padStart(3, '0');
}

function keywordsFromBody(body) {
    if (Array.isArray(body.keywords)) {
        return body.keywords.map((word) => String(word).trim()).filter(Boolean);
    }

    return String(body.keywords || '')
        .split(',')
        .map((word) => word.trim())
        .filter(Boolean);
}

// keep whatever they typed, skip empty boxes
function draftFields(body) {
    const data = {
        keywords: keywordsFromBody(body),
    };

    const textFields = [
        'title',
        'type',
        'description',
        'testExample',
        'expectedResult',
        'starterRepo',
        'reviewCriteria',
    ];

    for (const field of textFields) {
        if (body[field] !== undefined && String(body[field]).trim() !== '') {
            data[field] = String(body[field]).trim();
        }
    }

    if (body.tier !== undefined && String(body.tier).trim() !== '') {
        data.tier = Number(body.tier);
    }

    // publish action: draft becomes PUBLISHED
    if (body.status === 'PUBLISHED') {
        data.status = 'PUBLISHED';
    }

    return data;
}

// admin list: drafts, published and closed
router.get('/', auth, canManageChallenges, async (req, res) => {
    try {
        const challenges = await Challenge.find()
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 });

        return res.json(challenges);
    } catch (error) {
        console.error(error.message);
        return res.status(400).json({ message: 'Cannot load challenges' });
    }
});

// save a new draft
router.post('/', auth, canManageChallenges, async (req, res) => {
    try {
        const challenge = await Challenge.create({
            ...draftFields(req.body),
            challengeNumber: await nextChallengeNumber(),
            createdBy: req.user.userId,
            status: 'DRAFT',
        });

        return res.status(201).json(challenge);
    } catch (error) {
        console.error(error.message);
        return res.status(400).json({ message: 'Cannot create challenge' });
    }
});

// save again on the same draft
router.put('/:id', auth, canManageChallenges, async (req, res) => {
    try {
        const challenge = await Challenge.findByIdAndUpdate(
            req.params.id,
            draftFields(req.body),
            { new: true, runValidators: true }
        );

        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        return res.json(challenge);
    } catch (error) {
        console.error(error.message);
        return res.status(400).json({ message: 'Cannot update challenge' });
    }
});

module.exports = router;
