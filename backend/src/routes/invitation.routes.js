const express = require('express');
const router = express.Router();
const invitationController = require('../controllers/invitationController');
const authMiddleware = require('../middleware/auth');
const { organizationContext } = require('../middleware/organizationContext');

// Public routes
// Get invitation by token (for accept invite page)
router.get('/:token', invitationController.getInvitationByToken);

// Accept invitation (create account)
router.post('/:token/accept', invitationController.acceptInvitation);

// Protected routes (require authentication)
router.use(authMiddleware);
router.use(organizationContext);

// Send invitation (Owner/Admin only)
router.post('/', invitationController.sendInvitation);

// Get all invitations for organization (Owner/Admin only)
router.get('/', invitationController.getOrganizationInvitations);

// Resend invitation (Owner/Admin only)
router.post('/:invitationId/resend', invitationController.resendInvitation);

// Revoke invitation (Owner/Admin only)
router.delete('/:invitationId', invitationController.revokeInvitation);

module.exports = router;