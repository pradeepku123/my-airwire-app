const mongoose = require('mongoose');
const User = require('../src/models/User');
// Adjust path to config/index depending on where this script is run
// Assuming run from backend root: node scripts/createAdmin.js
const config = require('../src/config');

const makeFirstUserAdmin = async () => {
    try {
        await mongoose.connect(config.mongoUri || 'mongodb://localhost:27017/airwire');
        console.log('MongoDB Connected');

        // Find the first user
        const user = await User.findOne({});
        if (user) {
            user.role = 'admin';
            await user.save();
            console.log(`SUCCESS: User '${user.username}' is now an Admin.`);
        } else {
            console.log('No users found. Please register a user first.');
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

makeFirstUserAdmin();
