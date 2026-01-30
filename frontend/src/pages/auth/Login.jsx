import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { login } = useAuth();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await login(email, password);

            if (result.success) {
                // Get organization slug from response
                const organizationSlug = result.organization?.slug;

                if (organizationSlug) {
                    // Redirect to workspace dashboard
                    navigate(`/workspace/${organizationSlug}/dashboard`);
                } else {
                    // Fallback (shouldn't happen)
                    navigate('/');
                }
            } else {
                setError(result.message || 'Login failed. Please try again.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="relative min-h-screen flex overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0b0f] via-[#0f1015] to-[#0a0b0f]" />

            {/* Noise texture */}
            <div className="absolute inset-0 opacity-[0.02] mix-blend-soft-light">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' /%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat'
                }} />
            </div>

            {/* Left Section - Content */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="relative hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-20"
            >
                {/* Logo */}
                <Link to="/" className="absolute top-8 left-12 xl:left-20">
                    <div className="flex items-center space-x-4 group cursor-pointer">
                        <div className="relative w-12 h-12 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                            <img
                                src="/reqify-logo.png"
                                alt="Reqify Logo"
                                className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]"
                            />
                        </div>
                        <span className="text-2xl font-bold text-white tracking-wide bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent group-hover:from-purple-200 group-hover:via-white group-hover:to-purple-200 transition-all duration-300" style={{ fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif', letterSpacing: '-0.02em' }}>
                            Reqify
                        </span>
                    </div>
                </Link>

                <div className="space-y-6 max-w-lg">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2">
                            <Sparkles className="w-4 h-4 text-indigo-400" />
                            <span className="text-sm font-medium bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                                Powered by Advanced NLP
                            </span>
                        </div>
                    </motion.div>

                    {/* Headline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                            Welcome back to
                            <span className="block bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-400 bg-clip-text text-transparent mt-2">
                                smarter requirements
                            </span>
                        </h1>
                        <p className="text-lg text-gray-400 leading-relaxed">
                            Sign in to continue analyzing and improving your software requirement specifications with AI-powered precision.
                        </p>
                    </motion.div>

                    {/* Decorative line */}
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="h-1 w-32 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full origin-left"
                    />
                </div>
            </motion.div>

            {/* Right Section - Form */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="relative flex-1 flex items-center justify-center px-6 py-12 lg:px-12"
            >
                {/* Mobile Logo */}
                <Link to="/" className="absolute top-8 left-6 lg:hidden">
                    <div className="flex items-center space-x-3 group">
                        <div className="relative w-10 h-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                            <img
                                src="/reqify-logo.png"
                                alt="Reqify Logo"
                                className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]"
                            />
                        </div>
                        <span className="text-xl font-bold text-white tracking-wide bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent" style={{ fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif', letterSpacing: '-0.02em' }}>
                            Reqify
                        </span>
                    </div>
                </Link>

                {/* Form Card */}
                <div className="w-full max-w-md">
                    <div className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                        {/* Subtle inner glow */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />

                        <div className="relative p-8">
                            {/* Form Header */}
                            <div className="mb-8 text-center lg:text-left">
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    Sign in to your account
                                </h2>
                                <p className="text-sm text-gray-400">
                                    Enter your credentials to access your dashboard
                                </p>
                            </div>

                            {/* Error message */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {/* Login Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Email */}
                                <div className="space-y-2">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                        Email Address
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            placeholder="name@company.com"
                                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                        Password
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                        </div>
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            placeholder="••••••••"
                                            className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Remember & Forgot */}
                                <div className="flex items-center justify-between text-sm">
                                    <label className="flex items-center space-x-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-white/10 bg-white/5 text-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:ring-offset-0 transition-all"
                                        />
                                        <span className="text-gray-400 group-hover:text-gray-300 transition-colors">
                                            Remember me
                                        </span>
                                    </label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-indigo-400 hover:text-indigo-300 transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                {/* Login Button */}
                                <motion.button
                                    type="submit"
                                    disabled={isLoading}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    className="relative w-full py-3 rounded-lg font-semibold text-white overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 transition-transform duration-300 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                                    <span className="relative z-10 flex items-center justify-center space-x-2">
                                        <span>{isLoading ? 'Signing in...' : 'Sign in'}</span>
                                        {!isLoading && (
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                        )}
                                    </span>
                                </motion.button>
                            </form>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-[#0f1015] text-gray-500">
                                        Don't have an account?
                                    </span>
                                </div>
                            </div>

                            {/* Sign up link */}
                            <div className="text-center">
                                <Link
                                    to="/signup"
                                    className="inline-flex items-center space-x-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors group"
                                >
                                    <span>Create your account</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
