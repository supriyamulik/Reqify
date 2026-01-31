const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
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

        // Reviewer information
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Reviewer is required']
        },

        // Review decision
        status: {
            type: String,
            enum: ['approved', 'rejected', 'needs_revision', 'conditionally_approved'],
            required: [true, 'Review status is required']
        },

        // Review details
        comments: {
            type: String,
            default: null
        },

        // For conditional approval
        conditions: [{
            type: String
        }],

        // For rejection
        rejectionReason: {
            type: String,
            enum: [
                'unclear',
                'incomplete',
                'conflicting',
                'duplicate',
                'not_feasible',
                'out_of_scope',
                'poorly_written',
                'missing_information',
                'other'
            ],
            default: null
        },

        rejectionDetails: {
            type: String,
            default: null
        },

        // Suggested changes
        suggestedChanges: {
            type: String,
            default: null
        },

        // Review metadata
        reviewType: {
            type: String,
            enum: ['initial', 'revision', 'final'],
            default: 'initial'
        },

        priority: {
            type: String,
            enum: ['urgent', 'high', 'medium', 'low'],
            default: 'medium'
        },

        // Quality ratings (optional)
        ratings: {
            clarity: {
                type: Number,
                min: 1,
                max: 5,
                default: null
            },
            completeness: {
                type: Number,
                min: 1,
                max: 5,
                default: null
            },
            testability: {
                type: Number,
                min: 1,
                max: 5,
                default: null
            },
            feasibility: {
                type: Number,
                min: 1,
                max: 5,
                default: null
            },
            overall: {
                type: Number,
                min: 1,
                max: 5,
                default: null
            }
        },

        // Review checklist
        checklist: {
            isComplete: {
                type: Boolean,
                default: null
            },
            isClear: {
                type: Boolean,
                default: null
            },
            isTestable: {
                type: Boolean,
                default: null
            },
            isFeasible: {
                type: Boolean,
                default: null
            },
            hasAcceptanceCriteria: {
                type: Boolean,
                default: null
            }
        },

        // Issues found during review
        issuesFound: [{
            issueType: {
                type: String,
                enum: ['ambiguity', 'duplicate', 'conflict', 'incomplete', 'unclear', 'other']
            },
            description: String,
            severity: {
                type: String,
                enum: ['critical', 'high', 'medium', 'low']
            }
        }],

        // Review duration
        timeSpentMinutes: {
            type: Number,
            default: null
        },

        // Timestamps
        reviewedAt: {
            type: Date,
            default: Date.now
        },

        // Follow-up
        requiresFollowUp: {
            type: Boolean,
            default: false
        },

        followUpAssignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },

        followUpNotes: {
            type: String,
            default: null
        },

        followUpCompletedAt: {
            type: Date,
            default: null
        },

        // Revision tracking
        revisionNumber: {
            type: Number,
            default: 1
        },

        previousReviewId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review',
            default: null
        },

        // Additional context
        reviewContext: {
            type: String,
            default: null
        },

        attachments: [{
            filename: String,
            url: String,
            uploadedAt: Date
        }]
    },
    {
        timestamps: true
    }
);

// Compound indexes for better query performance
reviewSchema.index({ organizationId: 1, documentId: 1 });
reviewSchema.index({ documentId: 1, status: 1 });
reviewSchema.index({ requirementId: 1, reviewedAt: -1 });
reviewSchema.index({ reviewedBy: 1, reviewedAt: -1 });
reviewSchema.index({ status: 1, reviewedAt: -1 });

// Virtual to check if approved
reviewSchema.virtual('isApproved').get(function () {
    return this.status === 'approved' || this.status === 'conditionally_approved';
});

// Virtual to check if rejected
reviewSchema.virtual('isRejected').get(function () {
    return this.status === 'rejected';
});

// Virtual to check if needs action
reviewSchema.virtual('needsAction').get(function () {
    return this.status === 'needs_revision' || this.status === 'conditionally_approved';
});

// Virtual to calculate overall rating
reviewSchema.virtual('overallRating').get(function () {
    if (!this.ratings) return null;

    const ratings = [];
    if (this.ratings.clarity) ratings.push(this.ratings.clarity);
    if (this.ratings.completeness) ratings.push(this.ratings.completeness);
    if (this.ratings.testability) ratings.push(this.ratings.testability);
    if (this.ratings.feasibility) ratings.push(this.ratings.feasibility);

    if (ratings.length === 0) return null;

    return Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10;
});

// Method to update requirement after review
reviewSchema.methods.updateRequirement = async function () {
    const Requirement = mongoose.model('Requirement');

    const updateData = {
        status: this.status === 'approved' || this.status === 'conditionally_approved'
            ? 'approved'
            : this.status === 'rejected'
                ? 'rejected'
                : 'needs_review',
        reviewedBy: this.reviewedBy,
        reviewedAt: this.reviewedAt,
        reviewComments: this.comments
    };

    await Requirement.findByIdAndUpdate(this.requirementId, updateData);

    return this;
};

// Static method to get reviews for document
reviewSchema.statics.getByDocument = function (documentId, options = {}) {
    const query = { documentId };

    if (options.status) {
        query.status = options.status;
    }

    if (options.reviewedBy) {
        query.reviewedBy = options.reviewedBy;
    }

    return this.find(query)
        .populate('requirementId', 'requirementNumber originalText')
        .populate('reviewedBy', 'name email')
        .populate('followUpAssignedTo', 'name email')
        .sort({ reviewedAt: -1 })
        .lean();
};

// Static method to get pending reviews
reviewSchema.statics.getPending = function (organizationId) {
    return this.find({
        organizationId,
        status: { $in: ['needs_revision', 'conditionally_approved'] },
        requiresFollowUp: true,
        followUpCompletedAt: null
    })
        .populate('documentId', 'originalName')
        .populate('requirementId', 'requirementNumber originalText')
        .populate('reviewedBy', 'name email')
        .populate('followUpAssignedTo', 'name email')
        .sort({ reviewedAt: 1 })
        .lean();
};

// Static method to get reviewer statistics
reviewSchema.statics.getReviewerStats = async function (reviewerId, startDate, endDate) {
    const match = {
        reviewedBy: reviewerId
    };

    if (startDate && endDate) {
        match.reviewedAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const stats = await this.aggregate([
        { $match: match },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                avgTimeSpent: { $avg: '$timeSpentMinutes' }
            }
        }
    ]);

    const totalReviews = stats.reduce((sum, item) => sum + item.count, 0);

    return {
        totalReviews,
        byStatus: stats,
        averageTimeSpent: stats.reduce((sum, item) => sum + (item.avgTimeSpent || 0), 0) / stats.length
    };
};

// Static method to get review history for requirement
reviewSchema.statics.getRequirementHistory = function (requirementId) {
    return this.find({ requirementId })
        .populate('reviewedBy', 'name email')
        .sort({ reviewedAt: -1 })
        .lean();
};

// Pre-save hook to auto-update requirement
reviewSchema.post('save', async function (doc) {
    await doc.updateRequirement();
});

// Pre-save hook to calculate overall rating if not set
reviewSchema.pre('save', function (next) {
    if (this.ratings && !this.ratings.overall) {
        const ratings = [];
        if (this.ratings.clarity) ratings.push(this.ratings.clarity);
        if (this.ratings.completeness) ratings.push(this.ratings.completeness);
        if (this.ratings.testability) ratings.push(this.ratings.testability);
        if (this.ratings.feasibility) ratings.push(this.ratings.feasibility);

        if (ratings.length > 0) {
            this.ratings.overall = Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10;
        }
    }
    next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;