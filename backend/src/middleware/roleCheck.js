// Check if user has required role
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    // req.user is attached by authMiddleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This action requires one of these roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

module.exports = roleMiddleware;