const Organization = require('../models/Organization');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @desc    Create new organization (Signup)
// @route   POST /api/organizations
// @access  Public
exports.createOrganization = async (req, res) => {
    try {
        const { organizationName, ownerName, email, password } = req.body;

        // Validate input
        if (!organizationName || !ownerName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide organization name, owner name, email, and password'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Generate unique slug from organization name
        const slug = await Organization.generateSlug(organizationName);

        // Create organization first (without ownerId temporarily)
        const organization = new Organization({
            name: organizationName,
            slug,
            ownerId: null, // Will be updated after user creation
            status: 'active'
        });

        // Create owner user
        const owner = await User.create({
            organizationId: organization._id,
            name: ownerName,
            email,
            password,
            role: 'owner',
            isActive: true
        });

        // Update organization with owner ID
        organization.ownerId = owner._id;
        organization.stats.totalUsers = 1;
        await organization.save();

        // Generate JWT token
        const token = generateToken(owner._id);

        // Send welcome email (async, don't wait)
        emailService.sendWelcomeEmail({
            to: email,
            name: ownerName,
            organizationName,
            organizationSlug: slug
        }).catch(err => console.error('Welcome email failed:', err));

        console.log(`🏢 New organization created: ${organizationName} (${slug})`);
        console.log(`👤 Owner: ${email}`);

        res.status(201).json({
            success: true,
            message: 'Organization created successfully',
            data: {
                organization: {
                    id: organization._id,
                    name: organization.name,
                    slug: organization.slug,
                    status: organization.status
                },
                user: {
                    id: owner._id,
                    name: owner.name,
                    email: owner.email,
                    role: owner.role,
                    organizationId: owner.organizationId
                },
                token
            }
        });
    } catch (error) {
        console.error('Create Organization Error:', error);

        // Clean up if organization was created but user creation failed
        if (error.message.includes('User')) {
            // Try to delete the organization that was created
            // This prevents orphaned organizations
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create organization',
            error: error.message
        });
    }
};

// @desc    Get organization details
// @route   GET /api/organizations/:slug
// @access  Private
exports.getOrganization = async (req, res) => {
    try {
        const { slug } = req.params;

        const organization = await Organization.findOne({ slug })
            .populate('ownerId', 'name email');

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        // Check if user belongs to this organization
        if (req.user.organizationId.toString() !== organization._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.status(200).json({
            success: true,
            data: { organization }
        });
    } catch (error) {
        console.error('Get Organization Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get organization',
            error: error.message
        });
    }
};

// @desc    Update organization details
// @route   PATCH /api/organizations/:slug
// @access  Private (Owner/Admin only)
exports.updateOrganization = async (req, res) => {
    try {
        const { slug } = req.params;
        const updates = req.body;

        // Find organization
        const organization = await Organization.findOne({ slug });

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        // Check if user belongs to this organization
        if (req.user.organizationId.toString() !== organization._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Check if user is owner or admin
        if (!['owner', 'admin'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Only owners and admins can update organization'
            });
        }

        // Prevent changing certain fields
        delete updates.slug; // Slug cannot be changed
        delete updates.ownerId; // Owner cannot be changed this way
        delete updates.stats; // Stats are calculated

        // Update allowed fields
        const allowedUpdates = ['name', 'description', 'logo', 'website', 'industry', 'size', 'settings'];
        allowedUpdates.forEach(field => {
            if (updates[field] !== undefined) {
                organization[field] = updates[field];
            }
        });

        await organization.save();

        console.log(`🔄 Organization updated: ${organization.name} by ${req.user.email}`);

        res.status(200).json({
            success: true,
            message: 'Organization updated successfully',
            data: { organization }
        });
    } catch (error) {
        console.error('Update Organization Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update organization',
            error: error.message
        });
    }
};

// @desc    Get organization members
// @route   GET /api/organizations/:slug/members
// @access  Private
exports.getMembers = async (req, res) => {
    try {
        const { slug } = req.params;

        const organization = await Organization.findOne({ slug });

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        // Check if user belongs to this organization
        if (req.user.organizationId.toString() !== organization._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Get all users in this organization
        const members = await User.find({ organizationId: organization._id })
            .select('-password')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: members.length,
            data: { members }
        });
    } catch (error) {
        console.error('Get Members Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get members',
            error: error.message
        });
    }
};

// @desc    Get organization statistics
// @route   GET /api/organizations/:slug/stats
// @access  Private (Owner/Admin only)
exports.getOrganizationStats = async (req, res) => {
    try {
        const { slug } = req.params;

        const organization = await Organization.findOne({ slug });

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        // Check permissions
        if (req.user.organizationId.toString() !== organization._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        if (!['owner', 'admin'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Only owners and admins can view statistics'
            });
        }

        // Get requirement statistics
        const Requirement = require('../models/Requirement');
        const requirementStats = await Requirement.getOrganizationStats(organization._id);

        // Get user statistics by role
        const userStats = await User.aggregate([
            { $match: { organizationId: organization._id } },
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]);

        const stats = {
            organization: {
                name: organization.name,
                totalUsers: organization.stats.totalUsers,
                totalDocuments: organization.stats.totalDocuments,
                totalRequirements: organization.stats.totalRequirements,
                status: organization.status
            },
            users: userStats,
            requirements: requirementStats
        };

        res.status(200).json({
            success: true,
            data: { stats }
        });
    } catch (error) {
        console.error('Get Stats Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get statistics',
            error: error.message
        });
    }
};

// @desc    Delete organization (Owner only)
// @route   DELETE /api/organizations/:slug
// @access  Private (Owner only)
exports.deleteOrganization = async (req, res) => {
    try {
        const { slug } = req.params;

        const organization = await Organization.findOne({ slug });

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        // Only owner can delete
        if (req.user.role !== 'owner' || req.user.organizationId.toString() !== organization._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the organization owner can delete the organization'
            });
        }

        // Delete all users in organization
        await User.deleteMany({ organizationId: organization._id });

        // Delete all requirements in organization
        const Requirement = require('../models/Requirement');
        await Requirement.deleteMany({ organizationId: organization._id });

        // Delete all invitations
        const Invitation = require('../models/Invitation');
        await Invitation.deleteMany({ organizationId: organization._id });

        // Delete organization
        await organization.deleteOne();

        console.log(`🗑️  Organization deleted: ${organization.name} by ${req.user.email}`);

        res.status(200).json({
            success: true,
            message: 'Organization and all associated data deleted successfully'
        });
    } catch (error) {
        console.error('Delete Organization Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete organization',
            error: error.message
        });
    }
};