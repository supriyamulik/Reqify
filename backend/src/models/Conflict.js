const mongoose = require('mongoose');

const conflictSchema = new mongoose.Schema(
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

        // Conflicting pair
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

        // Conflict classification
        conflictType: {
            type: String,
            enum: [
                'contradictory',        // Direct contradiction (A vs NOT A)
                'incompatible',         // Cannot both be implemented
                'overlapping',          // Duplicate functionality
                'inconsistent',         // Different values for same thing
                'temporal',             // Timing conflicts
                'resource',             // Resource allocation conflicts
                'priority',             // Priority conflicts
                'scope',                // Scope boundary conflicts
                'other'
            ],
            required: [true, 'Conflict type is required']
        },

        // Conflict severity
        severity: {
            type: String,
            enum: ['critical', 'high', 'medium', 'low'],
            default: 'medium'
        },

        // Conflict description
        description: {
            type: String,
            required: [true, 'Conflict description is required']
        },

        // Conflicting elements (specific parts that conflict)
        conflictingPhrases: [{
            requirement: {
                type: String,
                enum: ['requirement1', 'requirement2']
            },
            phrase: String,
            reason: String
        }],

        // Detection confidence
        confidenceScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 50
            // How confident the system is about this conflict
        },

        // Detection method
        detectionMethod: {
            type: String,
            enum: ['keyword-based', 'semantic', 'negation-detection', 'rule-based', 'manual'],
            default: 'keyword-based'
        },

        // Status tracking
        status: {
            type: String,
            enum: ['detected', 'confirmed', 'resolved', 'ignored', 'false_positive'],
            default: 'detected'
        },

        // Resolution information
        resolution: {
            type: String,
            default: null
            // Description of how conflict was resolved
        },

        resolutionStrategy: {
            type: String,
            enum: [
                'requirement1_kept',
                'requirement2_kept',
                'both_modified',
                'merged',
                'escalated',
                'ignored',
                'not_applicable'
            ],
            default: null
        },

        // Impact analysis
        impactedComponents: [{
            type: String
        }],

        affectedStakeholders: [{
            type: String
        }],

        // User tracking
        detectedBy: {
            type: String,
            default: 'system'
        },

        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },

        confirmedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },

        // Timestamps
        detectedAt: {
            type: Date,
            default: Date.now
        },

        confirmedAt: {
            type: Date,
            default: null
        },

        resolvedAt: {
            type: Date,
            default: null
        },

        // Additional notes
        notes: {
            type: String,
            default: null
        },

        // Recommendations
        recommendation: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Compound indexes for better query performance
conflictSchema.index({ organizationId: 1, documentId: 1 });
conflictSchema.index({ documentId: 1, status: 1 });
conflictSchema.index({ documentId: 1, severity: 1 });
conflictSchema.index({ requirement1Id: 1 });
conflictSchema.index({ requirement2Id: 1 });
conflictSchema.index({ conflictType: 1 });

// Virtual to check if resolved
conflictSchema.virtual('isResolved').get(function () {
    return ['resolved', 'ignored', 'false_positive'].includes(this.status);
});

// Virtual to check if requires attention
conflictSchema.virtual('requiresAttention').get(function () {
    return this.severity === 'critical' && this.status === 'detected';
});

// Method to confirm conflict
conflictSchema.methods.confirm = function (userId, additionalNotes = null) {
    this.status = 'confirmed';
    this.confirmedBy = userId;
    this.confirmedAt = new Date();
    if (additionalNotes) {
        this.notes = this.notes
            ? `${this.notes}\n\nConfirmation notes: ${additionalNotes}`
            : `Confirmation notes: ${additionalNotes}`;
    }
    return this.save();
};

// Method to resolve conflict
conflictSchema.methods.resolve = async function (
    userId,
    resolutionStrategy,
    resolutionDescription
) {
    this.status = 'resolved';
    this.resolvedBy = userId;
    this.resolvedAt = new Date();
    this.resolutionStrategy = resolutionStrategy;
    this.resolution = resolutionDescription;

    await this.save();

    // Update requirements with conflict flag
    const Requirement = mongoose.model('Requirement');

    // Remove from conflictsWith arrays
    await Requirement.findByIdAndUpdate(this.requirement1Id, {
        $pull: { conflictsWith: this.requirement2Id }
    });

    await Requirement.findByIdAndUpdate(this.requirement2Id, {
        $pull: { conflictsWith: this.requirement1Id }
    });

    // Check if requirements still have other conflicts
    const req1Conflicts = await mongoose.model('Conflict').countDocuments({
        $or: [
            { requirement1Id: this.requirement1Id },
            { requirement2Id: this.requirement1Id }
        ],
        status: { $in: ['detected', 'confirmed'] }
    });

    const req2Conflicts = await mongoose.model('Conflict').countDocuments({
        $or: [
            { requirement1Id: this.requirement2Id },
            { requirement2Id: this.requirement2Id }
        ],
        status: { $in: ['detected', 'confirmed'] }
    });

    // Update hasConflict flag if no more conflicts
    if (req1Conflicts === 0) {
        await Requirement.findByIdAndUpdate(this.requirement1Id, {
            hasConflict: false
        });
    }

    if (req2Conflicts === 0) {
        await Requirement.findByIdAndUpdate(this.requirement2Id, {
            hasConflict: false
        });
    }

    return this;
};

// Method to ignore conflict
conflictSchema.methods.ignore = function (userId, reason = null) {
    this.status = 'ignored';
    this.resolvedBy = userId;
    this.resolvedAt = new Date();
    if (reason) {
        this.notes = this.notes
            ? `${this.notes}\n\nIgnore reason: ${reason}`
            : `Ignore reason: ${reason}`;
    }
    return this.save();
};

// Method to mark as false positive
conflictSchema.methods.markFalsePositive = function (userId, reason = null) {
    this.status = 'false_positive';
    this.resolvedBy = userId;
    this.resolvedAt = new Date();
    if (reason) {
        this.notes = this.notes
            ? `${this.notes}\n\nFalse positive: ${reason}`
            : `False positive: ${reason}`;
    }
    return this.save();
};

// Static method to get conflicts for document
conflictSchema.statics.getByDocument = function (documentId, options = {}) {
    const query = { documentId };

    if (options.status) {
        query.status = options.status;
    }

    if (options.conflictType) {
        query.conflictType = options.conflictType;
    }

    if (options.severity) {
        query.severity = options.severity;
    }

    return this.find(query)
        .populate('requirement1Id', 'requirementNumber originalText')
        .populate('requirement2Id', 'requirementNumber originalText')
        .populate('resolvedBy', 'name email')
        .populate('confirmedBy', 'name email')
        .sort({ severity: 1, detectedAt: -1 }) // Critical first, then newest
        .lean();
};

// Static method to get unresolved conflicts
conflictSchema.statics.getUnresolved = function (documentId) {
    return this.find({
        documentId,
        status: { $in: ['detected', 'confirmed'] }
    })
        .populate('requirement1Id', 'requirementNumber originalText')
        .populate('requirement2Id', 'requirementNumber originalText')
        .sort({ severity: 1, detectedAt: -1 })
        .lean();
};

// Static method to get critical conflicts
conflictSchema.statics.getCritical = function (organizationId) {
    return this.find({
        organizationId,
        severity: 'critical',
        status: { $in: ['detected', 'confirmed'] }
    })
        .populate('documentId', 'originalName')
        .populate('requirement1Id', 'requirementNumber originalText')
        .populate('requirement2Id', 'requirementNumber originalText')
        .sort({ detectedAt: -1 })
        .lean();
};

// Static method to check if conflict already exists
conflictSchema.statics.exists = async function (req1Id, req2Id) {
    const conflict = await this.findOne({
        $or: [
            { requirement1Id: req1Id, requirement2Id: req2Id },
            { requirement1Id: req2Id, requirement2Id: req1Id }
        ]
    });

    return !!conflict;
};

// Pre-save validation to ensure different requirements
conflictSchema.pre('save', function (next) {
    if (this.requirement1Id.toString() === this.requirement2Id.toString()) {
        next(new Error('Cannot create conflict with same requirement'));
    }
    next();
});

const Conflict = mongoose.model('Conflict', conflictSchema);

module.exports = Conflict;