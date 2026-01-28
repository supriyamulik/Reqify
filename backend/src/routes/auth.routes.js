const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { organizationContext } = require('../middleware/organizationContext');

// Public routes
router.post('/login', authController.login);

// Protected routes (require authentication)
router.use(authMiddleware);
router.use(organizationContext);

// User profile routes
router.get('/me', authController.getMe);
router.patch('/profile', authController.updateProfile);
router.patch('/change-password', authController.changePassword);

// User management routes (Owner/Admin only)
router.get('/users', authController.getAllUsers);
router.patch('/users/:userId/role', authController.changeUserRole);
router.patch('/users/:userId/toggle-status', authController.toggleUserStatus);
router.delete('/users/:userId', authController.deleteUser);

module.exports = router;