// this file is for login routes
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const loginName = email || username;

        if (!loginName || !password) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // user can log in with email or username
        let user = await User.findOne({ email: loginName.toLowerCase() });

        if (!user) {
            user = await User.findOne({ username: loginName });
        }

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // three admin types can use this login, learners cannot
        const adminRoles = ['SUPER_ADMIN', 'ADMIN_MANAGER', 'ADMIN'];
        if (!adminRoles.includes(user.role)) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!user.active) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // check the hashed password
        const isMatch = await bcrypt.compare(password, user.passwordHash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
            },
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
