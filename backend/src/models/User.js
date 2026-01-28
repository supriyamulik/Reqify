const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            required: [true, 'Organization is required'],
            index: true
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [50, 'Name cannot exceed 50 characters']
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
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false
        },
        role: {
            type: String,
            enum: {
                values: ['owner', 'admin', 'analyst', 'reviewer'],
                message: 'Role must be owner, admin, analyst, or reviewer'
            },
            required: true
        },
        avatar: {
            type: String
        },
        isActive: {
            type: Boolean,
            default: true
        },
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        emailVerificationToken: {
            type: String,
            select: false
        },
        resetPasswordToken: {
            type: String,
            select: false
        },
        resetPasswordExpire: {
            type: Date,
            select: false
        },
        lastLogin: {
            type: Date
        },
        preferences: {
            theme: {
                type: String,
                enum: ['light', 'dark', 'auto'],
                default: 'dark'
            },
            notifications: {
                email: { type: Boolean, default: true },
                inApp: { type: Boolean, default: true }
            }
        }
    },
    {
        timestamps: true
    }
);

// Compound index for email uniqueness within organization
userSchema.index({ email: 1, organizationId: 1 }, { unique: true });

// Hash password before saving - FIXED VERSION
userSchema.pre('save', async function () {
    // Only hash if password is modified
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get user data without sensitive info
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.emailVerificationToken;
    delete user.resetPasswordToken;
    delete user.resetPasswordExpire;
    return user;
};

// Method to check if user is owner
userSchema.methods.isOwner = function () {
    return this.role === 'owner';
};

// Method to check if user is admin or owner
userSchema.methods.isAdminOrOwner = function () {
    return ['owner', 'admin'].includes(this.role);
};

// Method to check if user can manage other users
userSchema.methods.canManageUsers = function () {
    return ['owner', 'admin'].includes(this.role);
};

// Virtual for full organization details
userSchema.virtual('organization', {
    ref: 'Organization',
    localField: 'organizationId',
    foreignField: '_id',
    justOne: true
});

module.exports = mongoose.model('User', userSchema);