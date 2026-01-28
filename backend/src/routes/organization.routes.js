const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');
const authMiddleware = require('../middleware/auth');
const { organizationContext } = require('../middleware/organizationContext');

// Public routes
router.post('/', organizationController.createOrganization);

// Protected routes (require authentication)
router.use(authMiddleware); // Apply auth middleware to all routes below
router.use(organizationContext); // Apply organization context

// Get organization details
router.get('/:slug', organizationController.getOrganization);

// Update organization (Owner/Admin only)
router.patch('/:slug', organizationController.updateOrganization);

// Get organization members
router.get('/:slug/members', organizationController.getMembers);

// Get organization statistics (Owner/Admin only)
router.get('/:slug/stats', organizationController.getOrganizationStats);

// Delete organization (Owner only)
router.delete('/:slug', organizationController.deleteOrganization);

module.exports = router;