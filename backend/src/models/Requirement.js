const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    documentId: {
      type: String,
      required: true,
      index: true
    },
    documentName: {
      type: String,
      required: true
    },
    originalText: {
      type: String,
      required: true
    },
    processedText: {
      type: String
    },
    // Duplicate Detection
    isDuplicate: {
      type: Boolean,
      default: false
    },
    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Requirement'
    },
    similarityScore: {
      type: Number,
      min: 0,
      max: 1
    },
    // Conflict Detection
    hasConflict: {
      type: Boolean,
      default: false
    },
    conflictWith: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Requirement'
    }],
    conflictReason: {
      type: String
    },
    // Ambiguity Detection
    isAmbiguous: {
      type: Boolean,
      default: false
    },
    ambiguousWords: [{
      word: String,
      reason: String,
      suggestion: String
    }],
    ambiguityScore: {
      type: Number,
      min: 0,
      max: 1
    },
    // AI Rewrite
    rewrittenText: {
      type: String
    },
    rewriteConfidence: {
      type: Number,
      min: 0,
      max: 1
    },
    // Review & Approval
    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected', 'revised'],
      default: 'pending'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    },
    reviewComments: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comment: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    // Metadata
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: String,
      enum: ['functional', 'non-functional', 'constraint', 'other'],
      default: 'functional'
    },
    priority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'medium'
    },
    tags: [{
      type: String,
      trim: true
    }],
    // Analysis metadata
    analyzedAt: {
      type: Date
    },
    nlpVersion: {
      type: String // Track which NLP version analyzed this
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for efficient queries
requirementSchema.index({ organizationId: 1, documentId: 1 });
requirementSchema.index({ organizationId: 1, status: 1 });
requirementSchema.index({ organizationId: 1, uploadedBy: 1 });
requirementSchema.index({ organizationId: 1, isDuplicate: 1 });
requirementSchema.index({ organizationId: 1, hasConflict: 1 });
requirementSchema.index({ organizationId: 1, isAmbiguous: 1 });

// Instance method to add review comment
requirementSchema.methods.addComment = async function(userId, comment) {
  this.reviewComments.push({
    userId,
    comment,
    createdAt: new Date()
  });
  await this.save();
};

// Instance method to approve requirement
requirementSchema.methods.approve = async function(userId) {
  this.status = 'approved';
  this.reviewedBy = userId;
  this.reviewedAt = new Date();
  await this.save();
};

// Instance method to reject requirement
requirementSchema.methods.reject = async function(userId, reason) {
  this.status = 'rejected';
  this.reviewedBy = userId;
  this.reviewedAt = new Date();
  if (reason) {
    await this.addComment(userId, reason);
  }
  await this.save();
};

// Static method to get statistics for an organization
requirementSchema.statics.getOrganizationStats = async function(organizationId) {
  const stats = await this.aggregate([
    { $match: { organizationId: mongoose.Types.ObjectId(organizationId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        duplicates: { $sum: { $cond: ['$isDuplicate', 1, 0] } },
        conflicts: { $sum: { $cond: ['$hasConflict', 1, 0] } },
        ambiguous: { $sum: { $cond: ['$isAmbiguous', 1, 0] } },
        approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } }
      }
    }
  ]);
  
  return stats.length > 0 ? stats[0] : {
    total: 0,
    duplicates: 0,
    conflicts: 0,
    ambiguous: 0,
    approved: 0,
    pending: 0
  };
};

module.exports = mongoose.model('Requirement', requirementSchema);