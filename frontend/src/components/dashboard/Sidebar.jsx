import { motion } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    Upload,
    FileText,
    BarChart3,
    CheckCircle,
    XCircle,
    Eye,
    Settings,
    Sparkles,
    LogOut
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const location = useLocation();

    // Get organization slug from URL
    const pathParts = location.pathname.split('/');
    const organizationSlug = pathParts[2]; // /workspace/{slug}/...
    const basePath = `/workspace/${organizationSlug}`;

    // Role-based navigation items
    const getNavigationItems = () => {
        const role = user?.role;

        // Owner/Admin - Full access
        if (role === 'owner' || role === 'admin') {
            return [
                { path: `${basePath}/dashboard`, icon: LayoutDashboard, label: 'Dashboard' },
                { path: `${basePath}/team`, icon: Users, label: 'Team Management' },
                { path: `${basePath}/upload`, icon: Upload, label: 'Upload Documents' },
                { path: `${basePath}/requirements`, icon: FileText, label: 'All Requirements' },
                { path: `${basePath}/analytics`, icon: BarChart3, label: 'Analytics' },
                { path: `${basePath}/review`, icon: Eye, label: 'Review Queue' },
                { path: `${basePath}/settings`, icon: Settings, label: 'Settings' },
            ];
        }

        // Analyst - Upload and manage requirements
        if (role === 'analyst') {
            return [
                { path: `${basePath}/dashboard`, icon: LayoutDashboard, label: 'Dashboard' },
                { path: `${basePath}/upload`, icon: Upload, label: 'Upload Documents' },
                { path: `${basePath}/requirements`, icon: FileText, label: 'My Requirements' },
                { path: `${basePath}/analytics`, icon: BarChart3, label: 'Analysis Results' },
                { path: `${basePath}/settings`, icon: Settings, label: 'Settings' },
            ];
        }

        // Reviewer - Review and approve
        if (role === 'reviewer') {
            return [
                { path: `${basePath}/dashboard`, icon: LayoutDashboard, label: 'Dashboard' },
                { path: `${basePath}/requirements`, icon: FileText, label: 'All Requirements' },
                { path: `${basePath}/review`, icon: Eye, label: 'Review Queue' },
                { path: `${basePath}/approved`, icon: CheckCircle, label: 'Approved' },
                { path: `${basePath}/rejected`, icon: XCircle, label: 'Rejected' },
                { path: `${basePath}/settings`, icon: Settings, label: 'Settings' },
            ];
        }

        // Default fallback
        return [
            { path: `${basePath}/dashboard`, icon: LayoutDashboard, label: 'Dashboard' },
            { path: `${basePath}/settings`, icon: Settings, label: 'Settings' },
        ];
    };

    const navigationItems = getNavigationItems();

    const handleLogout = () => {
        logout();
        if (onClose) onClose();
    };

    return (
        <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            className={`
        fixed left-0 top-0 bottom-0 z-40
        ${isOpen ? 'w-64' : 'w-20'}
        transition-all duration-300 ease-in-out
      `}
        >
            {/* Glassmorphic Sidebar Background */}
            <div className="h-full backdrop-blur-xl bg-white/5 border-r border-white/10 flex flex-col">

                {/* Logo Section */}
                <div className="p-6 border-b border-white/10">
                    <NavLink
                        to={`${basePath}/dashboard`}
                        className="flex items-center space-x-3 group"
                    >
                        {/* Logo Icon */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity" />
                            <div className="relative w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                        </div>

                        {/* Logo Text */}
                        {isOpen && (
                            <div className="overflow-hidden">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                                        Reqify
                                    </h1>
                                    <p className="text-xs text-gray-400 capitalize">
                                        {user?.role || 'User'}
                                    </p>
                                </motion.div>
                            </div>
                        )}
                    </NavLink>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navigationItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={onClose}
                                className="relative group block"
                            >
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`
                    relative flex items-center space-x-3 px-4 py-3 rounded-xl
                    transition-all duration-300 overflow-hidden
                    ${isActive
                                            ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30'
                                            : 'hover:bg-white/5 border border-transparent'
                                        }
                  `}
                                >
                                    {/* Active indicator */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeIndicator"
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-r-full"
                                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                        />
                                    )}

                                    {/* Icon */}
                                    <div className={`
                    relative z-10
                    ${isActive ? 'text-indigo-400' : 'text-gray-400 group-hover:text-white'}
                    transition-colors duration-300
                  `}>
                                        <Icon className="w-5 h-5" />
                                    </div>

                                    {/* Label */}
                                    {isOpen && (
                                        <span className={`
                      relative z-10 font-medium text-sm
                      ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}
                      transition-colors duration-300
                    `}>
                                            {item.label}
                                        </span>
                                    )}

                                    {/* Hover glow effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-indigo-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                                </motion.div>

                                {/* Tooltip for collapsed state */}
                                {!isOpen && (
                                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 border border-white/10">
                                        {item.label}
                                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                                    </div>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* User Section & Logout */}
                <div className="p-4 border-t border-white/10 space-y-2">
                    {/* User Info */}
                    {isOpen && user && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10"
                        >
                            <div className="flex items-center space-x-3">
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                </div>

                                {/* User Details */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">
                                        {user.name}
                                    </p>
                                    <p className="text-xs text-gray-400 truncate">
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className={`
              w-full flex items-center space-x-3 px-4 py-3 rounded-xl
              bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30
              text-red-400 hover:text-red-300 transition-all duration-300
              group
            `}
                    >
                        <LogOut className="w-5 h-5" />
                        {isOpen && (
                            <span className="font-medium text-sm">
                                Logout
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </motion.aside>
    );
};

export default Sidebar;