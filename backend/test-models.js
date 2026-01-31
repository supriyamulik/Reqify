// backend/test-models.js
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Document = require('./src/models/Document');
const Requirement = require('./src/models/Requirement');
const Duplicate = require('./src/models/Duplicate');
const Conflict = require('./src/models/Conflict');
const Ambiguity = require('./src/models/Ambiguity');
const Review = require('./src/models/Review');

async function testModels() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Test model compilation
        console.log('✅ Document model loaded:', Document.modelName);
        console.log('✅ Requirement model loaded:', Requirement.modelName);
        console.log('✅ Duplicate model loaded:', Duplicate.modelName);
        console.log('✅ Conflict model loaded:', Conflict.modelName);
        console.log('✅ Ambiguity model loaded:', Ambiguity.modelName);
        console.log('✅ Review model loaded:', Review.modelName);

        console.log('\n🎉 All models loaded successfully!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

testModels();