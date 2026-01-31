const mongoose = require('mongoose');

const duplicateSchema = new mongoose.Schema(
    {
        // Multi-tenant isolation
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            required: [true, 'Organization is required'],
            index: true
        },

        // Document reference
        documentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Document',
            required: [true, 'Document is required'],
            index: true
        },

        // Duplicate pair
        requirement1Id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Requirement',
            required: [true, 'First requirement is required']
        },

        requirement2Id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Requirement',
            required: [true, 'Second requirement is required']
        },

        // Similarity metrics
        similarityScore: {
            type: Number,
            required: [true, 'Similarity score is required'],
            min: 0.0,
            max: 1.0
            // 0.0 = 0% similar, 1.0 = 100% similar
        },

        similarityPercentage: {
            type: Number,
            min: 0,
            max: 100
            // Calculated as similarityScore * 100
        },

        // Detection method
        detectionMethod: {
            type: String,
            enum: ['tfidf-cosine', 'exact-match', 'semantic', 'manual'],
            default: 'tfidf-cosine'
        },

        // Common words/phrases (optional metadata)
        commonPhrases: [{
            type: String
        }],

        // Status tracking
        status: {
            type: String,
            enum: ['detected', 'confirmed', 'merged', 'dismissed', 'false_positive'],
            default: 'detected'
        },

        // Resolution information
        mergedInto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Requirement',
            default: null
        },

        dismissalReason: {
            type: String,
            default: null
        },

        // User tracking
        detectedBy: {
            type: String,
            default: 'system'
            // Can be 'system' or user ID
        },

        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },

        // Timestamps
        detectedAt: {
            type: Date,
            default: Date.now
        },

        resolvedAt: {
            type: Date,
            default: null
        },

        // Additional notes
        notes: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Compound indexes for better query performance
duplicateSchema.index({ organizationId: 1, documentId: 1 });
duplicateSchema.index({ documentId: 1, status: 1 });
duplicateSchema.index({ requirement1Id: 1 });
duplicateSchema.index({ requirement2Id: 1 });
duplicateSchema.index({ similarityScore: -1 });

// Virtual to get similarity as percentage
duplicateSchema.virtual('similarityPercent').get(function () {
    return Math.round(this.similarityScore * 100);
});

// Virtual to check if resolved
duplicateSchema.virtual('isResolved').get(function () {
    return ['merged', 'dismissed', 'false_positive'].includes(this.status);
});

// Method to merge duplicates
duplicateSchema.methods.merge = async function (userId, keepRequirementId) {
    // Validate that keepRequirementId is one of the duplicate pair
    if (
        keepRequirementId.toString() !== this.requirement1Id.toString() &&
        keepRequirementId.toString() !== this.requirement2Id.toString()
    ) {
        throw new Error('Invalid requirement ID for merge');
    }

    // Determine which to keep and which to delete
    const deleteRequirementId =
        keepRequirementId.toString() === this.requirement1Id.toString()
            ? this.requirement2Id
            : this.requirement1Id;

    // Update duplicate record
    this.status = 'merged';
    this.mergedInto = keepRequirementId;
    this.resolvedBy = userId;
    this.resolvedAt = new Date();

    await this.save();

    // Mark the deleted requirement
    const Requirement = mongoose.model('Requirement');
    await Requirement.findByIdAndUpdate(deleteRequirementId, {
        isDeleted: true,
        deletedAt: new Date(),
        isDuplicate: true,
        duplicateOf: keepRequirementId
    });

    return this;
};

// Method to dismiss as false positive
duplicateSchema.methods.dismiss = function (userId, reason = null) {
    this.status = 'dismissed';
    this.resolvedBy = userId;
    this.resolvedAt = new Date();
    if (reason) {
        this.dismissalReason = reason;
    }
    return this.save();
};

// Method to confirm as true duplicate
duplicateSchema.methods.confirm = function (userId) {
    this.status = 'confirmed';
    this.resolvedBy = userId;
    this.resolvedAt = new Date();
    return this.save();
};

// Static method to get duplicates for document
duplicateSchema.statics.getByDocument = function (documentId, options = {}) {
    const query = { documentId };

    if (options.status) {
        query.status = options.status;
    }

    if (options.minSimilarity) {
        query.similarityScore = { $gte: options.minSimilarity };
    }

    return this.find(query)
        .populate('requirement1Id', 'requirementNumber originalText')
        .populate('requirement2Id', 'requirementNumber originalText')
        .populate('resolvedBy', 'name email')
        .sort({ similarityScore: -1 })
        .lean();
};

// Static method to get unresolved duplicates
duplicateSchema.statics.getUnresolved = function (documentId) {
    return this.find({
        documentId,
        status: { $in: ['detected', 'confirmed'] }
    })
        .populate('requirement1Id', 'requirementNumber originalText')
        .populate('requirement2Id', 'requirementNumber originalText')
        .sort({ similarityScore: -1 })
        .lean();
};

// Static method to check if duplicate already exists
duplicateSchema.statics.exists = async function (req1Id, req2Id) {
    // Check both directions (req1-req2 and req2-req1)
    const duplicate = await this.findOne({
        $or: [
            { requirement1Id: req1Id, requirement2Id: req2Id },
            { requirement1Id: req2Id, requirement2Id: req1Id }
        ]
    });

    return !!duplicate;
};

// Pre-save hook to calculate similarity percentage
duplicateSchema.pre('save', function (next) {
    if (this.isModified('similarityScore')) {
        this.similarityPercentage = Math.round(this.similarityScore * 100);
    }
    next();
});

// Pre-save validation to ensure different requirements
duplicateSchema.pre('save', function (next) {
    if (this.requirement1Id.toString() === this.requirement2Id.toString()) {
        next(new Error('Cannot create duplicate with same requirement'));
    }
    next();
});

const Duplicate = mongoose.model('Duplicate', duplicateSchema);

module.exports = Duplicate;