const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
    {
        // Multi-tenant isolation
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            required: [true, 'Organization is required'],
            index: true
        },

        // Upload information
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Uploader is required']
        },

        // File details
        filename: {
            type: String,
            required: [true, 'Filename is required'],
            trim: true
        },

        originalName: {
            type: String,
            required: [true, 'Original filename is required'],
            trim: true
        },

        fileSize: {
            type: Number, // in bytes
            required: [true, 'File size is required']
        },

        fileType: {
            type: String,
            enum: ['pdf', 'docx', 'txt'],
            required: [true, 'File type is required']
        },

        filePath: {
            type: String,
            required: [true, 'File path is required']
        },

        // Processing status
        status: {
            type: String,
            enum: ['uploaded', 'extracting', 'analyzing', 'analyzed', 'error'],
            default: 'uploaded'
        },

        errorMessage: {
            type: String,
            default: null
        },

        // Extracted content
        extractedText: {
            type: String,
            default: null
        },

        // Analysis statistics
        requirementCount: {
            type: Number,
            default: 0
        },

        duplicateCount: {
            type: Number,
            default: 0
        },

        conflictCount: {
            type: Number,
            default: 0
        },

        ambiguityCount: {
            type: Number,
            default: 0
        },

        approvedCount: {
            type: Number,
            default: 0
        },

        rejectedCount: {
            type: Number,
            default: 0
        },

        // Timestamps
        uploadedAt: {
            type: Date,
            default: Date.now
        },

        extractedAt: {
            type: Date,
            default: null
        },

        analyzedAt: {
            type: Date,
            default: null
        },

        // Soft delete
        isDeleted: {
            type: Boolean,
            default: false
        },

        deletedAt: {
            type: Date,
            default: null
        },

        deletedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        }
    },
    {
        timestamps: true // Adds createdAt and updatedAt
    }
);

// Indexes for better query performance
documentSchema.index({ organizationId: 1, uploadedBy: 1 });
documentSchema.index({ organizationId: 1, status: 1 });
documentSchema.index({ organizationId: 1, uploadedAt: -1 });
documentSchema.index({ isDeleted: 1 });

// Virtual for file size in MB
documentSchema.virtual('fileSizeMB').get(function () {
    return (this.fileSize / (1024 * 1024)).toFixed(2);
});

// Virtual for analysis completion percentage
documentSchema.virtual('analysisProgress').get(function () {
    if (this.requirementCount === 0) return 0;
    const analyzed = this.duplicateCount + this.conflictCount + this.ambiguityCount;
    return Math.min(100, Math.round((analyzed / this.requirementCount) * 100));
});

// Method to mark as deleted (soft delete)
documentSchema.methods.softDelete = function (userId) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = userId;
    return this.save();
};

// Static method to get documents for organization
documentSchema.statics.getByOrganization = function (organizationId, options = {}) {
    const query = { organizationId, isDeleted: false };

    if (options.status) {
        query.status = options.status;
    }

    if (options.uploadedBy) {
        query.uploadedBy = options.uploadedBy;
    }

    return this.find(query)
        .populate('uploadedBy', 'name email')
        .sort({ uploadedAt: -1 })
        .lean();
};

// Pre-save hook to update timestamps
documentSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        if (this.status === 'analyzed') {
            this.analyzedAt = new Date();
        } else if (this.status === 'extracting') {
            this.extractedAt = new Date();
        }
    }
    next();
});

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;