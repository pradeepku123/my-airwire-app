const dotenv = require('dotenv');

dotenv.config();

const config = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET || 'secret',
    jwtExpiresIn: '1d',
};

// Simple validation
const requiredEnvs = ['MONGO_URI'];
requiredEnvs.forEach((key) => {
    if (!process.env[key]) {
        console.warn(`WARNING: Missing environment variable ${key}`);
    }
});

module.exports = config;
