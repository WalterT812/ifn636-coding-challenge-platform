// load values from .env, such as MONGO_URI
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
// login APIs will be in this route later
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

const startServer = async () => {
    try {
        // connect to MongoDB before starting the server
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        // if the database is not connected, stop the program
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
};

startServer();
