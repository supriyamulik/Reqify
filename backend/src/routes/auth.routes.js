const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleCheck');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (require authentication)
router.get('/me', authMiddleware, authController.getMe);

// Admin only routes
router.get('/users',
    authMiddleware,
    roleMiddleware(['admin']),
    authController.getAllUsers
);

router.patch('/users/:userId/role',
    authMiddleware,
    roleMiddleware(['admin']),
    authController.changeUserRole
);

router.patch('/users/:userId/toggle-status',
    authMiddleware,
    roleMiddleware(['admin']),
    authController.toggleUserStatus
);

module.exports = router;