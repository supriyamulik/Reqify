import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#0a0b0f] via-[#0f1015] to-[#0a0b0f] flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full"
                />
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if user has required role
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#0a0b0f] via-[#0f1015] to-[#0a0b0f] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-red-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                        Access Denied
                    </h2>
                    <p className="text-gray-400 mb-6">
                        You don't have permission to access this page. Required role:{' '}
                        <span className="text-indigo-400 font-medium">
                            {allowedRoles.join(' or ')}
                        </span>
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:border-white/20 transition-all"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // User is authenticated and has correct role
    return children;
};

export default ProtectedRoute;