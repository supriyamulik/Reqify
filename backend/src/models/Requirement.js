const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema(
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

    // Requirement identification
    requirementNumber: {
      type: String,
      required: [true, 'Requirement number is required'],
      trim: true
      // Example: REQ-001, FR-001, NFR-001
    },

    // Requirement content
    originalText: {
      type: String,
      required: [true, 'Original text is required'],
      trim: true
    },

    rewrittenText: {
      type: String,
      default: null,
      trim: true
    },

    // Categorization
    category: {
      type: String,
      enum: ['functional', 'non-functional', 'constraint', 'interface', 'other'],
      default: 'functional'
    },

    subcategory: {
      type: String,
      default: null
      // Examples: 'performance', 'security', 'usability', 'reliability'
    },

    // Priority
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    },

    // Status tracking
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'needs_review', 'rewritten'],
      default: 'pending'
    },

    // Duplicate tracking
    isDuplicate: {
      type: Boolean,
      default: false
    },

    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Requirement',
      default: null
    },

    // Conflict tracking
    hasConflict: {
      type: Boolean,
      default: false
    },

    conflictsWith: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Requirement'
    }],

    // Ambiguity tracking
    isAmbiguous: {
      type: Boolean,
      default: false
    },

    ambiguityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    vaguePhrases: [{
      type: String
    }],

    // User tracking
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required']
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    // Review information
    reviewComments: {
      type: String,
      default: null
    },

    reviewedAt: {
      type: Date,
      default: null
    },

    // Additional metadata
    sourceLineNumber: {
      type: Number,
      default: null
    },

    sourcePage: {
      type: Number,
      default: null
    },

    tags: [{
      type: String,
      trim: true
    }],

    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false
    },

    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for better query performance
requirementSchema.index({ organizationId: 1, documentId: 1 });
requirementSchema.index({ organizationId: 1, status: 1 });
requirementSchema.index({ documentId: 1, requirementNumber: 1 });
requirementSchema.index({ isDuplicate: 1 });
requirementSchema.index({ hasConflict: 1 });
requirementSchema.index({ isAmbiguous: 1 });
requirementSchema.index({ isDeleted: 1 });

// Virtual for display text (shows rewritten if available, otherwise original)
requirementSchema.virtual('displayText').get(function () {
  return this.rewrittenText || this.originalText;
});

// Virtual to check if requirement has issues
requirementSchema.virtual('hasIssues').get(function () {
  return this.isDuplicate || this.hasConflict || this.isAmbiguous;
});

// Method to approve requirement
requirementSchema.methods.approve = function (reviewerId, comments = null) {
  this.status = 'approved';
  this.reviewedBy = reviewerId;
  this.reviewedAt = new Date();
  if (comments) {
    this.reviewComments = comments;
  }
  return this.save();
};

// Method to reject requirement
requirementSchema.methods.reject = function (reviewerId, comments) {
  this.status = 'rejected';
  this.reviewedBy = reviewerId;
  this.reviewedAt = new Date();
  this.reviewComments = comments;
  return this.save();
};

// Method to accept AI rewrite
requirementSchema.methods.acceptRewrite = function (userId) {
  if (!this.rewrittenText) {
    throw new Error('No rewritten text available');
  }
  this.status = 'rewritten';
  this.modifiedBy = userId;
  this.isAmbiguous = false; // Rewrite resolves ambiguity
  return this.save();
};

// Static method to get requirements by document
requirementSchema.statics.getByDocument = function (documentId, options = {}) {
  const query = { documentId, isDeleted: false };

  if (options.status) {
    query.status = options.status;
  }

  if (options.category) {
    query.category = options.category;
  }

  if (options.hasIssues) {
    query.$or = [
      { isDuplicate: true },
      { hasConflict: true },
      { isAmbiguous: true }
    ];
  }

  return this.find(query)
    .populate('createdBy', 'name email')
    .populate('reviewedBy', 'name email')
    .sort({ requirementNumber: 1 })
    .lean();
};

// Static method to get pending reviews
requirementSchema.statics.getPendingReviews = function (organizationId) {
  return this.find({
    organizationId,
    status: 'needs_review',
    isDeleted: false
  })
    .populate('documentId', 'originalName')
    .populate('createdBy', 'name email')
    .sort({ createdAt: 1 })
    .lean();
};

// Static method to get requirements with issues
requirementSchema.statics.getRequirementsWithIssues = function (documentId) {
  return this.find({
    documentId,
    isDeleted: false,
    $or: [
      { isDuplicate: true },
      { hasConflict: true },
      { isAmbiguous: true }
    ]
  })
    .populate('duplicateOf', 'requirementNumber originalText')
    .populate('conflictsWith', 'requirementNumber originalText')
    .sort({ requirementNumber: 1 })
    .lean();
};

// Pre-save hook to auto-generate requirement number if not provided
requirementSchema.pre('save', async function (next) {
  if (this.isNew && !this.requirementNumber) {
    // Count existing requirements in document
    const count = await mongoose.model('Requirement').countDocuments({
      documentId: this.documentId,
      isDeleted: false
    });

    // Generate number: REQ-001, REQ-002, etc.
    this.requirementNumber = `REQ-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

const Requirement = mongoose.model('Requirement', requirementSchema);

module.exports = Requirement;