const mongoose = require('mongoose');
const crypto = require('crypto');

const invitationSchema = new mongoose.Schema(
    {
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            required: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            lowercase: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email'
            ]
        },
        role: {
            type: String,
            enum: ['admin', 'analyst', 'reviewer'],
            required: true
        },
        token: {
            type: String,
            required: true,
            unique: true
        },
        invitedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'expired', 'revoked'],
            default: 'pending'
        },
        expiresAt: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        },
        acceptedAt: {
            type: Date
        },
        acceptedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
);

// Indexes
invitationSchema.index({ token: 1 });
invitationSchema.index({ email: 1, organizationId: 1 });
invitationSchema.index({ organizationId: 1, status: 1 });
invitationSchema.index({ expiresAt: 1 });

// Static method to generate unique token
invitationSchema.statics.generateToken = function () {
    return crypto.randomBytes(32).toString('hex');
};

// Instance method to check if invitation is valid
invitationSchema.methods.isValid = function () {
    return (
        this.status === 'pending' &&
        this.expiresAt > new Date()
    );
};

// Instance method to accept invitation
invitationSchema.methods.accept = async function (userId) {
    this.status = 'accepted';
    this.acceptedAt = new Date();
    this.acceptedBy = userId;
    await this.save();
};

// Instance method to revoke invitation
invitationSchema.methods.revoke = async function () {
    this.status = 'revoked';
    await this.save();
};

// Static method to clean up expired invitations (can be run as cron job)
invitationSchema.statics.cleanupExpired = async function () {
    const result = await this.updateMany(
        {
            status: 'pending',
            expiresAt: { $lt: new Date() }
        },
        {
            $set: { status: 'expired' }
        }
    );
    return result.modifiedCount;
};

// Pre-save middleware to ensure token is generated
invitationSchema.pre('save', function (next) {
    if (this.isNew && !this.token) {
        this.token = crypto.randomBytes(32).toString('hex');
    }
    next();
});

module.exports = mongoose.model('Invitation', invitationSchema);