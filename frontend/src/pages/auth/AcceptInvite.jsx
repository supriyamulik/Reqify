import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight, Eye, EyeOff, Sparkles, Building2, Mail, CheckCircle2 } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AcceptInvite = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [invitation, setInvitation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Fetch invitation details
    useEffect(() => {
        const fetchInvitation = async () => {
            try {
                const response = await axios.get(`${API_URL}/invitations/${token}`);
                if (response.data.success) {
                    setInvitation(response.data.data.invitation);
                } else {
                    setError(response.data.message);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Invalid or expired invitation');
            } finally {
                setLoading(false);
            }
        };

        fetchInvitation();
    }, [token]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axios.post(`${API_URL}/invitations/${token}/accept`, {
                name: formData.name,
                password: formData.password
            });

            if (response.data.success) {
                // Store token and user data
                localStorage.setItem('reqify_token', response.data.data.token);
                localStorage.setItem('reqify_user', JSON.stringify(response.data.data.user));

                // Redirect to workspace
                const slug = response.data.data.organization.slug;
                navigate(`/workspace/${slug}/dashboard`);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to accept invitation');
        } finally {
            setIsSubmitting(false);
        }
    };

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

    if (error && !invitation) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#0a0b0f] via-[#0f1015] to-[#0a0b0f] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">Invalid Invitation</h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <Link
                        to="/login"
                        className="inline-block px-6 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:border-white/20 transition-all"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

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

            {/* Left Section - Invitation Info */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
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
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2">
                            <Sparkles className="w-4 h-4 text-indigo-400" />
                            <span className="text-sm font-medium bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                                Team Invitation
                            </span>
                        </div>
                    </motion.div>

                    {/* Headline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                            Join
                            <span className="block bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-400 bg-clip-text text-transparent mt-2">
                                {invitation?.organization?.name}
                            </span>
                        </h1>
                        <p className="text-lg text-gray-400 leading-relaxed">
                            You've been invited by <span className="text-white font-medium">{invitation?.invitedBy?.name}</span> to collaborate on requirement analysis.
                        </p>
                    </motion.div>

                    {/* Invitation Details */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="space-y-3"
                    >
                        <div className="flex items-center space-x-3">
                            <Building2 className="w-5 h-5 text-indigo-400" />
                            <span className="text-gray-300">{invitation?.organization?.name}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Mail className="w-5 h-5 text-purple-400" />
                            <span className="text-gray-300">{invitation?.email}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            <span className="text-gray-300">
                                Role: <span className="font-medium text-white capitalize">{invitation?.role}</span>
                            </span>
                        </div>
                    </motion.div>

                    {/* Decorative line */}
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="h-1 w-32 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full origin-left"
                    />
                </div>
            </motion.div>

            {/* Right Section - Form */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
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
                            {/* Mobile - Show organization name */}
                            <div className="lg:hidden mb-6 text-center">
                                <p className="text-sm text-gray-400 mb-2">You're joining</p>
                                <h2 className="text-xl font-bold text-white">{invitation?.organization?.name}</h2>
                                <p className="text-sm text-indigo-400 mt-1 capitalize">as {invitation?.role}</p>
                            </div>

                            {/* Form Header */}
                            <div className="mb-6 text-center lg:text-left">
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    Complete Your Profile
                                </h2>
                                <p className="text-sm text-gray-400">
                                    Set up your account to get started
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

                            {/* Accept Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Name */}
                                <div className="space-y-2">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                                        Full Name
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                        </div>
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="John Doe"
                                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                                        />
                                    </div>
                                </div>

                                {/* Email (read-only) */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">
                                        Email Address
                                    </label>
                                    <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-gray-400 text-sm">
                                        {invitation?.email}
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
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={handleChange}
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
                                    <p className="text-xs text-gray-500">Minimum 6 characters</p>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-2">
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                                        Confirm Password
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                        </div>
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                            placeholder="••••••••"
                                            className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Accept Button */}
                                <motion.button
                                    type="submit"
                                    disabled={isSubmitting}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    className="relative w-full py-3 rounded-lg font-semibold text-white overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 transition-transform duration-300 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                                    <span className="relative z-10 flex items-center justify-center space-x-2">
                                        <span>{isSubmitting ? 'Joining...' : 'Accept Invitation'}</span>
                                        {!isSubmitting && (
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                        )}
                                    </span>
                                </motion.button>
                            </form>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AcceptInvite;
