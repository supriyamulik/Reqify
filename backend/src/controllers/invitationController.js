const Invitation = require('../models/Invitation');
const User = require('../models/User');
const Organization = require('../models/Organization');
const emailService = require('../services/emailService');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @desc    Send invitation to team member
// @route   POST /api/invitations
// @access  Private (Owner/Admin only)
exports.sendInvitation = async (req, res) => {
    try {
        const { email, role } = req.body;

        // Validate input
        if (!email || !role) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and role'
            });
        }

        // Validate role
        if (!['admin', 'analyst', 'reviewer'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be admin, analyst, or reviewer'
            });
        }

        // Check if user has permission to invite
        if (!req.user.canManageUsers()) {
            return res.status(403).json({
                success: false,
                message: 'Only owners and admins can invite team members'
            });
        }

        // Get organization
        const organization = await Organization.findById(req.user.organizationId);
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        // Check if organization can add more users (for future limits)
        if (!organization.canAddUsers()) {
            return res.status(403).json({
                success: false,
                message: 'User limit reached for your organization'
            });
        }

        // Check if user already exists in this organization
        const existingUser = await User.findOne({
            email,
            organizationId: organization._id
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists in your organization'
            });
        }

        // Check if there's already a pending invitation
        const existingInvitation = await Invitation.findOne({
            email,
            organizationId: organization._id,
            status: 'pending'
        });

        if (existingInvitation) {
            return res.status(400).json({
                success: false,
                message: 'An invitation has already been sent to this email'
            });
        }

        // Generate unique token
        const token = Invitation.generateToken();

        // Create invitation
        const invitation = await Invitation.create({
            organizationId: organization._id,
            email,
            role,
            token,
            invitedBy: req.user._id
        });

        // Send invitation email
        const emailResult = await emailService.sendInvitation({
            to: email,
            inviterName: req.user.name,
            organizationName: organization.name,
            token,
            role
        });

        if (!emailResult.success) {
            console.error('Failed to send invitation email:', emailResult.error);
            // Don't fail the request, invitation is still created
        }

        console.log(`📧 Invitation sent: ${email} to join ${organization.name} as ${role}`);

        res.status(201).json({
            success: true,
            message: 'Invitation sent successfully',
            data: {
                invitation: {
                    id: invitation._id,
                    email: invitation.email,
                    role: invitation.role,
                    status: invitation.status,
                    expiresAt: invitation.expiresAt
                }
            }
        });
    } catch (error) {
        console.error('Send Invitation Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send invitation',
            error: error.message
        });
    }
};

// @desc    Get invitation by token
// @route   GET /api/invitations/:token
// @access  Public
exports.getInvitationByToken = async (req, res) => {
    try {
        const { token } = req.params;

        const invitation = await Invitation.findOne({ token })
            .populate('organizationId', 'name slug logo')
            .populate('invitedBy', 'name email');

        if (!invitation) {
            return res.status(404).json({
                success: false,
                message: 'Invitation not found'
            });
        }

        // Check if invitation is valid
        if (!invitation.isValid()) {
            return res.status(400).json({
                success: false,
                message: invitation.status === 'expired'
                    ? 'This invitation has expired'
                    : 'This invitation is no longer valid'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                invitation: {
                    email: invitation.email,
                    role: invitation.role,
                    organization: invitation.organizationId,
                    invitedBy: invitation.invitedBy,
                    expiresAt: invitation.expiresAt
                }
            }
        });
    } catch (error) {
        console.error('Get Invitation Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get invitation',
            error: error.message
        });
    }
};

// @desc    Accept invitation and create account
// @route   POST /api/invitations/:token/accept
// @access  Public
exports.acceptInvitation = async (req, res) => {
    try {
        const { token } = req.params;
        const { name, password } = req.body;

        // Validate input
        if (!name || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name and password'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Find invitation
        const invitation = await Invitation.findOne({ token })
            .populate('organizationId');

        if (!invitation) {
            return res.status(404).json({
                success: false,
                message: 'Invitation not found'
            });
        }

        // Check if invitation is valid
        if (!invitation.isValid()) {
            return res.status(400).json({
                success: false,
                message: invitation.status === 'expired'
                    ? 'This invitation has expired'
                    : 'This invitation is no longer valid'
            });
        }

        // Check if user already exists with this email in ANY organization
        const existingUser = await User.findOne({ email: invitation.email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email already exists. Please login instead.'
            });
        }

        // Create user account
        const user = await User.create({
            organizationId: invitation.organizationId._id,
            name,
            email: invitation.email,
            password,
            role: invitation.role,
            isActive: true
        });

        // Mark invitation as accepted
        await invitation.accept(user._id);

        // Update organization user count
        await invitation.organizationId.incrementUserCount();

        // Generate JWT token
        const jwtToken = generateToken(user._id);

        console.log(`✅ Invitation accepted: ${user.email} joined ${invitation.organizationId.name}`);

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    organizationId: user.organizationId
                },
                organization: {
                    id: invitation.organizationId._id,
                    name: invitation.organizationId.name,
                    slug: invitation.organizationId.slug
                },
                token: jwtToken
            }
        });
    } catch (error) {
        console.error('Accept Invitation Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to accept invitation',
            error: error.message
        });
    }
};

// @desc    Get all invitations for organization
// @route   GET /api/invitations
// @access  Private (Owner/Admin only)
exports.getOrganizationInvitations = async (req, res) => {
    try {
        // Check permissions
        if (!req.user.canManageUsers()) {
            return res.status(403).json({
                success: false,
                message: 'Only owners and admins can view invitations'
            });
        }

        const invitations = await Invitation.find({
            organizationId: req.user.organizationId
        })
            .populate('invitedBy', 'name email')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: invitations.length,
            data: { invitations }
        });
    } catch (error) {
        console.error('Get Invitations Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get invitations',
            error: error.message
        });
    }
};

// @desc    Revoke invitation
// @route   DELETE /api/invitations/:invitationId
// @access  Private (Owner/Admin only)
exports.revokeInvitation = async (req, res) => {
    try {
        const { invitationId } = req.params;

        // Check permissions
        if (!req.user.canManageUsers()) {
            return res.status(403).json({
                success: false,
                message: 'Only owners and admins can revoke invitations'
            });
        }

        const invitation = await Invitation.findById(invitationId);

        if (!invitation) {
            return res.status(404).json({
                success: false,
                message: 'Invitation not found'
            });
        }

        // Check if invitation belongs to user's organization
        if (invitation.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Revoke invitation
        await invitation.revoke();

        console.log(`🚫 Invitation revoked: ${invitation.email} by ${req.user.email}`);

        res.status(200).json({
            success: true,
            message: 'Invitation revoked successfully'
        });
    } catch (error) {
        console.error('Revoke Invitation Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to revoke invitation',
            error: error.message
        });
    }
};

// @desc    Resend invitation email
// @route   POST /api/invitations/:invitationId/resend
// @access  Private (Owner/Admin only)
exports.resendInvitation = async (req, res) => {
    try {
        const { invitationId } = req.params;

        // Check permissions
        if (!req.user.canManageUsers()) {
            return res.status(403).json({
                success: false,
                message: 'Only owners and admins can resend invitations'
            });
        }

        const invitation = await Invitation.findById(invitationId)
            .populate('organizationId', 'name');

        if (!invitation) {
            return res.status(404).json({
                success: false,
                message: 'Invitation not found'
            });
        }

        // Check if invitation belongs to user's organization
        if (invitation.organizationId._id.toString() !== req.user.organizationId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Check if invitation is still pending
        if (invitation.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Can only resend pending invitations'
            });
        }

        // Extend expiration date
        invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await invitation.save();

        // Resend email
        const emailResult = await emailService.sendInvitation({
            to: invitation.email,
            inviterName: req.user.name,
            organizationName: invitation.organizationId.name,
            token: invitation.token,
            role: invitation.role
        });

        if (!emailResult.success) {
            console.error('Failed to resend invitation email:', emailResult.error);
        }

        console.log(`🔄 Invitation resent: ${invitation.email} by ${req.user.email}`);

        res.status(200).json({
            success: true,
            message: 'Invitation resent successfully'
        });
    } catch (error) {
        console.error('Resend Invitation Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to resend invitation',
            error: error.message
        });
    }
};