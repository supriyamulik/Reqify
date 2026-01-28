const Organization = require('../models/Organization');

// Middleware to attach organization context to request
// This ensures data isolation across organizations
const organizationContext = async (req, res, next) => {
    try {
        // Only apply to authenticated requests
        if (!req.user) {
            return next();
        }

        // Attach organizationId to request for easy access
        req.organizationId = req.user.organizationId;

        // Optionally load full organization details
        // (Comment out if not needed for performance)
        const organization = await Organization.findById(req.user.organizationId);

        if (!organization) {
            return res.status(404).json({
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

        // Attach organization to request
        req.organization = organization;

        next();
    } catch (error) {
        console.error('Organization Context Middleware Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load organization context',
            error: error.message
        });
    }
};

// Helper middleware to ensure query filters by organization
// Use this in routes that need strict organization isolation
const enforceOrganizationIsolation = (Model) => {
    return (req, res, next) => {
        // Override Model.find to automatically add organizationId filter
        const originalFind = Model.find.bind(Model);
        const originalFindOne = Model.findOne.bind(Model);
        const originalCountDocuments = Model.countDocuments.bind(Model);

        Model.find = function (conditions, ...args) {
            const newConditions = {
                ...conditions,
                organizationId: req.organizationId
            };
            return originalFind(newConditions, ...args);
        };

        Model.findOne = function (conditions, ...args) {
            const newConditions = {
                ...conditions,
                organizationId: req.organizationId
            };
            return originalFindOne(newConditions, ...args);
        };

        Model.countDocuments = function (conditions, ...args) {
            const newConditions = {
                ...conditions,
                organizationId: req.organizationId
            };
            return originalCountDocuments(newConditions, ...args);
        };

        // Restore after request
        res.on('finish', () => {
            Model.find = originalFind;
            Model.findOne = originalFindOne;
            Model.countDocuments = originalCountDocuments;
        });

        next();
    };
};

module.exports = {
    organizationContext,
    enforceOrganizationIsolation
};