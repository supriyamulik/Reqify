import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import {
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Copy,
    ArrowRight,
    TrendingUp,
    MessageSquare
} from 'lucide-react';

const ReviewerDashboard = () => {
    const { slug } = useParams();

    // Mock data (replace with real API calls later)
    const stats = [
        {
            label: 'Pending Reviews',
            value: '18',
            change: '6 urgent',
            icon: Clock,
            color: 'from-orange-500 to-red-500',
            bgColor: 'bg-orange-500/10',
            borderColor: 'border-orange-500/20'
        },
        {
            label: 'Approved',
            value: '142',
            change: '+24 this week',
            icon: CheckCircle,
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500/20'
        },
        {
            label: 'Rejected',
            value: '12',
            change: '+2 this week',
            icon: XCircle,
            color: 'from-red-500 to-pink-500',
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500/20'
        },
        {
            label: 'Total Reviewed',
            value: '154',
            change: '89% approval rate',
            icon: Eye,
            color: 'from-indigo-500 to-purple-500',
            bgColor: 'bg-indigo-500/10',
            borderColor: 'border-indigo-500/20'
        },
    ];

    const pendingReviews = [
        {
            document: 'Mobile App Requirements v3.0',
            analyst: 'Sarah Johnson',
            uploadedDate: '2 hours ago',
            requirements: 48,
            duplicates: 4,
            conflicts: 2,
            ambiguities: 5,
            priority: 'high'
        },
        {
            document: 'Payment Gateway Integration',
            analyst: 'Mike Chen',
            uploadedDate: '1 day ago',
            requirements: 32,
            duplicates: 2,
            conflicts: 1,
            ambiguities: 3,
            priority: 'medium'
        },
        {
            document: 'User Dashboard Module',
            analyst: 'Lisa Wang',
            uploadedDate: '2 days ago',
            requirements: 28,
            duplicates: 1,
            conflicts: 0,
            ambiguities: 2,
            priority: 'low'
        },
    ];

    const quickActions = [
        {
            title: 'Review Queue',
            description: 'View pending reviews',
            icon: Eye,
            link: `/workspace/${slug}/review`,
            color: 'from-orange-500 to-red-500'
        },
        {
            title: 'Approved Requirements',
            description: 'Browse approved items',
            icon: CheckCircle,
            link: `/workspace/${slug}/approved`,
            color: 'from-green-500 to-emerald-500'
        },
        {
            title: 'Rejected Requirements',
            description: 'View rejected items',
            icon: XCircle,
            link: `/workspace/${slug}/rejected`,
            color: 'from-red-500 to-pink-500'
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        <DashboardLayout>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
            >
                {/* Header */}
                <motion.div variants={itemVariants}>
                    <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                        Reviewer Dashboard 👁️
                    </h1>
                    <p className="mt-2 text-gray-400">
                        Review and approve requirements from your team.
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={stat.label}
                                whileHover={{ scale: 1.02, y: -5 }}
                                className="group relative"
                            >
                                {/* Glow effect */}
                                <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 rounded-2xl`} />

                                {/* Card */}
                                <div className={`relative backdrop-blur-xl ${stat.bgColor} border ${stat.borderColor} rounded-2xl p-6`}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-gray-400 text-sm font-medium">
                                                {stat.label}
                                            </p>
                                            <h3 className="text-3xl font-bold text-white mt-2">
                                                {stat.value}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-2 flex items-center">
                                                <TrendingUp className="w-3 h-3 mr-1" />
                                                {stat.change}
                                            </p>
                                        </div>
                                        <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={itemVariants}>
                    <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {quickActions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <Link
                                    key={action.title}
                                    to={action.link}
                                    className="group relative block"
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.02, y: -5 }}
                                        className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 overflow-hidden"
                                    >
                                        {/* Gradient overlay */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                                        {/* Content */}
                                        <div className="relative z-10">
                                            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${action.color} mb-4`}>
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-white mb-2">
                                                {action.title}
                                            </h3>
                                            <p className="text-sm text-gray-400 mb-4">
                                                {action.description}
                                            </p>
                                            <div className="flex items-center text-indigo-400 text-sm font-medium">
                                                Get started
                                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Pending Reviews */}
                <motion.div variants={itemVariants}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white">Pending Reviews</h2>
                        <Link
                            to={`/workspace/${slug}/review`}
                            className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                            View all
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {pendingReviews.map((review, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ scale: 1.01 }}
                                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                            <h3 className="text-lg font-semibold text-white">
                                                {review.document}
                                            </h3>
                                            {review.priority === 'high' && (
                                                <span className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium">
                                                    High Priority
                                                </span>
                                            )}
                                            {review.priority === 'medium' && (
                                                <span className="px-3 py-1 rounded-lg bg-orange-500/20 text-orange-400 text-xs font-medium">
                                                    Medium Priority
                                                </span>
                                            )}
                                            {review.priority === 'low' && (
                                                <span className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-medium">
                                                    Low Priority
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-sm text-gray-400 mt-2">
                                            Uploaded by <span className="text-indigo-400">{review.analyst}</span> • {review.uploadedDate}
                                        </p>

                                        <div className="flex items-center space-x-6 mt-4">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-400" />
                                                <span className="text-sm text-gray-300">
                                                    {review.requirements} requirements
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Copy className="w-4 h-4 text-orange-400" />
                                                <span className="text-sm text-gray-300">
                                                    {review.duplicates} duplicates
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <AlertCircle className="w-4 h-4 text-red-400" />
                                                <span className="text-sm text-gray-300">
                                                    {review.conflicts} conflicts
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <MessageSquare className="w-4 h-4 text-yellow-400" />
                                                <span className="text-sm text-gray-300">
                                                    {review.ambiguities} ambiguities
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <Link
                                        to={`/workspace/${slug}/review/${index}`}
                                        className="px-4 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-400 text-sm font-medium transition-colors"
                                    >
                                        Review Now
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Tips */}
                <motion.div variants={itemVariants}>
                    <div className="backdrop-blur-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6">
                        <div className="flex items-start space-x-4">
                            <div className="p-3 rounded-xl bg-indigo-500/20">
                                <Eye className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">
                                    Review Tip: Focus on high-priority items first
                                </h3>
                                <p className="text-sm text-gray-400 mt-1">
                                    Start with urgent requirements to keep projects on track. Add detailed comments when rejecting to help analysts improve.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </DashboardLayout>
    );
};

export default ReviewerDashboard;