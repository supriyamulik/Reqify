const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      minlength: [2, 'Organization name must be at least 2 characters'],
      maxlength: [100, 'Organization name cannot exceed 100 characters']
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9-]+$/,
        'Slug can only contain lowercase letters, numbers, and hyphens'
      ]
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    logo: {
      type: String, // URL to logo image
    },
    website: {
      type: String,
      match: [
        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
        'Please provide a valid URL'
      ]
    },
    industry: {
      type: String,
      enum: [
        'Technology',
        'Healthcare',
        'Finance',
        'Education',
        'Manufacturing',
        'Retail',
        'Other'
      ]
    },
    size: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '500+']
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'trial', 'cancelled'],
      default: 'active'
    },
    settings: {
      // Organization-specific settings
      allowedDomains: [{
        type: String, // e.g., "@company.com" - restrict signups to specific email domains
      }],
      requireEmailVerification: {
        type: Boolean,
        default: true
      },
      allowSelfSignup: {
        type: Boolean,
        default: false // If true, anyone with allowed domain can signup
      },
      defaultUserRole: {
        type: String,
        enum: ['analyst', 'reviewer'],
        default: 'analyst'
      },
      features: {
        nlpAnalysis: { type: Boolean, default: true },
        aiRewrite: { type: Boolean, default: true },
        exportDocuments: { type: Boolean, default: true }
      }
    },
    // Statistics
    stats: {
      totalUsers: { type: Number, default: 0 },
      totalDocuments: { type: Number, default: 0 },
      totalRequirements: { type: Number, default: 0 }
    },
    // Owner information
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Metadata
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt
  }
);

// Index for faster queries
organizationSchema.index({ slug: 1 });
organizationSchema.index({ ownerId: 1 });
organizationSchema.index({ status: 1 });

// Static method to generate unique slug from name
organizationSchema.statics.generateSlug = async function(name) {
  // Convert name to slug
  let slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  // Check if slug exists
  let uniqueSlug = slug;
  let counter = 1;
  
  while (await this.findOne({ slug: uniqueSlug })) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
  
  return uniqueSlug;
};

// Instance method to increment user count
organizationSchema.methods.incrementUserCount = async function() {
  this.stats.totalUsers += 1;
  await this.save();
};

// Instance method to increment document count
organizationSchema.methods.incrementDocumentCount = async function() {
  this.stats.totalDocuments += 1;
  await this.save();
};

// Instance method to check if organization can add more users (for future limits)
organizationSchema.methods.canAddUsers = function() {
  // For now, always return true (no limits)
  // Later: check against plan limits
  return true;
};

// Instance method to check if organization can upload more documents
organizationSchema.methods.canUploadDocuments = function() {
  // For now, always return true (no limits)
  // Later: check against plan limits
  return true;
};

module.exports = mongoose.model('Organization', organizationSchema);