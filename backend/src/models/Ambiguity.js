const mongoose = require('mongoose');

const ambiguitySchema = new mongoose.Schema(
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

        // Requirement reference
        requirementId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Requirement',
            required: [true, 'Requirement is required'],
            index: true
        },

        // Ambiguity metrics
        ambiguityScore: {
            type: Number,
            required: [true, 'Ambiguity score is required'],
            min: 0,
            max: 100
            // 0 = clear, 100 = very ambiguous
        },

        ambiguityLevel: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'medium'
        },

        // Detected vague phrases
        vaguePhrases: [{
            phrase: {
                type: String,
                required: true
            },
            type: {
                type: String,
                enum: [
                    'modal_verb',        // should, could, might, may
                    'indefinite',        // some, several, many, few
                    'subjective',        // easy, fast, simple, user-friendly
                    'comparative',       // better, faster, more
                    'temporal',          // soon, later, eventually
                    'quantifier',        // approximately, about, around
                    'qualitative',       // good, bad, efficient, robust
                    'other'
                ],
                default: 'other'
            },
            position: {
                type: Number // Position in text
            },
            severity: {
                type: String,
                enum: ['low', 'medium', 'high'],
                default: 'medium'
            }
        }],

        // Ambiguity types detected
        ambiguityTypes: [{
            type: String,
            enum: [
                'vague_quantifier',      // "many", "few", "several"
                'unclear_actor',          // Who does what?
                'missing_condition',      // When/where/how missing
                'subjective_term',        // "user-friendly", "fast"
                'weak_verb',              // "should", "could"
                'unclear_reference',      // Pronoun confusion
                'implicit_assumption',    // Assumed but not stated
                'incomplete_specification' // Missing details
            ]
        }],

        // AI rewrite
        aiSuggestion: {
            type: String,
            default: null
        },

        aiProvider: {
            type: String,
            enum: ['openai', 'gemini', 'claude', 'manual'],
            default: null
        },

        rewriteQualityScore: {
            type: Number,
            min: 0,
            max: 100,
            default: null
            // How much the rewrite improves clarity
        },

        // Status tracking
        status: {
            type: String,
            enum: [
                'detected',
                'rewrite_generated',
                'rewrite_accepted',
                'rewrite_rejected',
                'manually_fixed',
                'ignored',
                'false_positive'
            ],
            default: 'detected'
        },

        // Resolution
        acceptedRewrite: {
            type: String,
            default: null
            // Could be AI suggestion or manual edit
        },

        rejectionReason: {
            type: String,
            default: null
        },

        manualFix: {
            type: String,
            default: null
        },

        // Detection method
        detectionMethod: {
            type: String,
            enum: ['keyword-based', 'nlp-analysis', 'rule-based', 'manual'],
            default: 'keyword-based'
        },

        // Recommendations
        improvementSuggestions: [{
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

        // Timestamps
        detectedAt: {
            type: Date,
            default: Date.now
        },

        rewriteGeneratedAt: {
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
        }
    },
    {
        timestamps: true
    }
);

// Compound indexes for better query performance
ambiguitySchema.index({ organizationId: 1, documentId: 1 });
ambiguitySchema.index({ documentId: 1, status: 1 });
ambiguitySchema.index({ documentId: 1, ambiguityLevel: 1 });
ambiguitySchema.index({ requirementId: 1 });
ambiguitySchema.index({ ambiguityScore: -1 });

// Virtual to check if resolved
ambiguitySchema.virtual('isResolved').get(function () {
    return [
        'rewrite_accepted',
        'manually_fixed',
        'ignored',
        'false_positive'
    ].includes(this.status);
});

// Virtual to check if has rewrite
ambiguitySchema.virtual('hasRewrite').get(function () {
    return !!this.aiSuggestion;
});

// Method to generate AI rewrite
ambiguitySchema.methods.generateAIRewrite = async function (suggestion, provider = 'openai') {
    this.aiSuggestion = suggestion;
    this.aiProvider = provider;
    this.status = 'rewrite_generated';
    this.rewriteGeneratedAt = new Date();
    return this.save();
};

// Method to accept AI rewrite
ambiguitySchema.methods.acceptRewrite = async function (userId) {
    if (!this.aiSuggestion) {
        throw new Error('No AI suggestion available');
    }

    this.status = 'rewrite_accepted';
    this.acceptedRewrite = this.aiSuggestion;
    this.resolvedBy = userId;
    this.resolvedAt = new Date();

    await this.save();

    // Update the requirement
    const Requirement = mongoose.model('Requirement');
    await Requirement.findByIdAndUpdate(this.requirementId, {
        rewrittenText: this.aiSuggestion,
        status: 'rewritten',
        isAmbiguous: false,
        ambiguityScore: 0,
        modifiedBy: userId
    });

    return this;
};

// Method to reject AI rewrite
ambiguitySchema.methods.rejectRewrite = function (userId, reason = null) {
    this.status = 'rewrite_rejected';
    this.resolvedBy = userId;
    this.resolvedAt = new Date();
    if (reason) {
        this.rejectionReason = reason;
    }
    return this.save();
};

// Method to apply manual fix
ambiguitySchema.methods.applyManualFix = async function (userId, fixedText) {
    this.status = 'manually_fixed';
    this.manualFix = fixedText;
    this.acceptedRewrite = fixedText;
    this.resolvedBy = userId;
    this.resolvedAt = new Date();

    await this.save();

    // Update the requirement
    const Requirement = mongoose.model('Requirement');
    await Requirement.findByIdAndUpdate(this.requirementId, {
        rewrittenText: fixedText,
        status: 'rewritten',
        isAmbiguous: false,
        ambiguityScore: 0,
        modifiedBy: userId
    });

    return this;
};

// Method to ignore ambiguity
ambiguitySchema.methods.ignore = function (userId, reason = null) {
    this.status = 'ignored';
    this.resolvedBy = userId;
    this.resolvedAt = new Date();
    if (reason) {
        this.notes = reason;
    }
    return this.save();
};

// Static method to get ambiguities for document
ambiguitySchema.statics.getByDocument = function (documentId, options = {}) {
    const query = { documentId };

    if (options.status) {
        query.status = options.status;
    }

    if (options.ambiguityLevel) {
        query.ambiguityLevel = options.ambiguityLevel;
    }

    if (options.minScore) {
        query.ambiguityScore = { $gte: options.minScore };
    }

    return this.find(query)
        .populate('requirementId', 'requirementNumber originalText')
        .populate('resolvedBy', 'name email')
        .sort({ ambiguityScore: -1 })
        .lean();
};

// Static method to get unresolved ambiguities
ambiguitySchema.statics.getUnresolved = function (documentId) {
    return this.find({
        documentId,
        status: { $in: ['detected', 'rewrite_generated', 'rewrite_rejected'] }
    })
        .populate('requirementId', 'requirementNumber originalText')
        .sort({ ambiguityScore: -1 })
        .lean();
};

// Static method to get high-priority ambiguities
ambiguitySchema.statics.getHighPriority = function (organizationId) {
    return this.find({
        organizationId,
        ambiguityLevel: { $in: ['high', 'critical'] },
        status: { $in: ['detected', 'rewrite_generated'] }
    })
        .populate('documentId', 'originalName')
        .populate('requirementId', 'requirementNumber originalText')
        .sort({ ambiguityScore: -1 })
        .lean();
};

// Pre-save hook to calculate ambiguity level
ambiguitySchema.pre('save', function (next) {
    if (this.isModified('ambiguityScore')) {
        if (this.ambiguityScore >= 75) {
            this.ambiguityLevel = 'critical';
        } else if (this.ambiguityScore >= 50) {
            this.ambiguityLevel = 'high';
        } else if (this.ambiguityScore >= 25) {
            this.ambiguityLevel = 'medium';
        } else {
            this.ambiguityLevel = 'low';
        }
    }
    next();
});

const Ambiguity = mongoose.model('Ambiguity', ambiguitySchema);

module.exports = Ambiguity;