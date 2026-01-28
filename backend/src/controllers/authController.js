const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organization = require('../models/Organization');

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @desc    Login user (Multi-Tenant)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user (include password for comparison)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated. Please contact your administrator.'
            });
        }

        // Get organization details
        const organization = await Organization.findById(user.organizationId);

        if (!organization) {
            return res.status(500).json({
                success: false,
                message: 'Organization not found'
            });
        }

        // Check if organization is active
        if (organization.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: `Organization is ${organization.status}. Please contact support.`
            });
        }

        // Compare password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        console.log(`✅ User logged in: ${email} (${organization.name})`);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                    organizationId: user.organizationId,
                    lastLogin: user.lastLogin
                },
                organization: {
                    id: organization._id,
                    name: organization.name,
                    slug: organization.slug,
                    status: organization.status
                },
                token
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('organizationId', 'name slug logo status');

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                    createdAt: user.createdAt,
                    lastLogin: user.lastLogin,
                    organization: user.organizationId
                }
            }
        });
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profile',
            error: error.message
        });
    }
};

// @desc    Update user profile
// @route   PATCH /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { name, avatar, preferences } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update allowed fields
        if (name) user.name = name;
        if (avatar) user.avatar = avatar;
        if (preferences) user.preferences = { ...user.preferences, ...preferences };

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: { user }
        });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
};

// @desc    Change user password
// @route   PATCH /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters'
            });
        }

        const user = await User.findById(req.user._id).select('+password');

        // Verify current password
        const isValid = await user.comparePassword(currentPassword);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        console.log(`🔐 Password changed: ${user.email}`);

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change Password Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password',
            error: error.message
        });
    }
};

// @desc    Get all users in organization (Admin only)
// @route   GET /api/auth/users
// @access  Private (Owner/Admin only)
exports.getAllUsers = async (req, res) => {
    try {
        // Check permissions
        if (!req.user.canManageUsers()) {
            return res.status(403).json({
                success: false,
                message: 'Only owners and admins can view users'
            });
        }

        const users = await User.find({
            organizationId: req.user.organizationId
        })
            .select('-password')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: users.length,
            data: { users }
        });
    } catch (error) {
        console.error('Get Users Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get users',
            error: error.message
        });
    }
};

// @desc    Change user role (Owner/Admin only)
// @route   PATCH /api/auth/users/:userId/role
// @access  Private (Owner/Admin only)
exports.changeUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        // Check permissions
        if (!req.user.canManageUsers()) {
            return res.status(403).json({
                success: false,
                message: 'Only owners and admins can change user roles'
            });
        }

        // Validate role
        if (!['admin', 'analyst', 'reviewer'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be admin, analyst, or reviewer'
            });
        }

        // Find user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user belongs to same organization
        if (user.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Prevent changing own role
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot change your own role'
            });
        }

        // Prevent changing owner role
        if (user.role === 'owner') {
            return res.status(400).json({
                success: false,
                message: 'Cannot change owner role. Transfer ownership first.'
            });
        }

        // Only owner can create admins
        if (role === 'admin' && req.user.role !== 'owner') {
            return res.status(403).json({
                success: false,
                message: 'Only organization owner can assign admin role'
            });
        }

        // Update role
        const oldRole = user.role;
        user.role = role;
        await user.save();

        console.log(`🔄 Role changed: ${user.email} from ${oldRole} to ${role} by ${req.user.email}`);

        res.status(200).json({
            success: true,
            message: `User role updated from ${oldRole} to ${role}`,
            data: { user }
        });
    } catch (error) {
        console.error('Change Role Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change role',
            error: error.message
        });
    }
};

// @desc    Toggle user active status (Owner/Admin only)
// @route   PATCH /api/auth/users/:userId/toggle-status
// @access  Private (Owner/Admin only)
exports.toggleUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check permissions
        if (!req.user.canManageUsers()) {
            return res.status(403).json({
                success: false,
                message: 'Only owners and admins can manage user status'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user belongs to same organization
        if (user.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Prevent deactivating own account
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot deactivate your own account'
            });
        }

        // Prevent deactivating owner
        if (user.role === 'owner') {
            return res.status(400).json({
                success: false,
                message: 'Cannot deactivate organization owner'
            });
        }

        // Toggle status
        user.isActive = !user.isActive;
        await user.save();

        console.log(`${user.isActive ? '✅' : '❌'} User ${user.isActive ? 'activated' : 'deactivated'}: ${user.email} by ${req.user.email}`);

        res.status(200).json({
            success: true,
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            data: { user }
        });
    } catch (error) {
        console.error('Toggle Status Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user status',
            error: error.message
        });
    }
};

// @desc    Delete user (Owner/Admin only)
// @route   DELETE /api/auth/users/:userId
// @access  Private (Owner/Admin only)
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check permissions
        if (!req.user.canManageUsers()) {
            return res.status(403).json({
                success: false,
                message: 'Only owners and admins can delete users'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user belongs to same organization
        if (user.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Prevent deleting own account
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account'
            });
        }

        // Prevent deleting owner
        if (user.role === 'owner') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete organization owner'
            });
        }

        await user.deleteOne();

        // Update organization user count
        const organization = await Organization.findById(user.organizationId);
        if (organization) {
            organization.stats.totalUsers = Math.max(0, organization.stats.totalUsers - 1);
            await organization.save();
        }

        console.log(`🗑️  User deleted: ${user.email} by ${req.user.email}`);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: error.message
        });
    }
};