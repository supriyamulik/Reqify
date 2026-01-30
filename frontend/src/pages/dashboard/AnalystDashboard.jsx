import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import {
  Upload,
  FileText,
  AlertCircle,
  Copy,
  Zap,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';

const AnalystDashboard = () => {
  const { slug } = useParams();

  // Mock data (replace with real API calls later)
  const stats = [
    {
      label: 'My Uploads',
      value: '24',
      change: '+4 this week',
      icon: Upload,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      label: 'Total Requirements',
      value: '186',
      change: '+18 this week',
      icon: FileText,
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20'
    },
    {
      label: 'Duplicates Found',
      value: '12',
      change: 'Needs review',
      icon: Copy,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20'
    },
    {
      label: 'Analysis Complete',
      value: '18',
      change: '3 pending',
      icon: Zap,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
  ];

  const recentUploads = [
    {
      name: 'Mobile App Requirements v3.0',
      date: '2 hours ago',
      status: 'analyzing',
      requirements: 48,
      duplicates: null,
      conflicts: null
    },
    {
      name: 'E-commerce Platform SRS',
      date: '1 day ago',
      status: 'completed',
      requirements: 124,
      duplicates: 8,
      conflicts: 3
    },
    {
      name: 'Payment Gateway Integration',
      date: '2 days ago',
      status: 'completed',
      requirements: 32,
      duplicates: 2,
      conflicts: 1
    },
    {
      name: 'User Authentication Module',
      date: '3 days ago',
      status: 'completed',
      requirements: 28,
      duplicates: 0,
      conflicts: 0
    },
  ];

  const quickActions = [
    {
      title: 'Upload New Document',
      description: 'Start requirement analysis',
      icon: Upload,
      link: `/workspace/${slug}/upload`,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      title: 'View All Requirements',
      description: 'Browse your requirements',
      icon: FileText,
      link: `/workspace/${slug}/requirements`,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Analysis Results',
      description: 'Check duplicates & conflicts',
      icon: Zap,
      link: `/workspace/${slug}/analytics`,
      color: 'from-purple-500 to-pink-500'
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
            Analyst Dashboard 📊
          </h1>
          <p className="mt-2 text-gray-400">
            Manage and analyze your requirements efficiently.
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

        {/* Recent Uploads */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Recent Uploads</h2>
            <Link
              to={`/workspace/${slug}/requirements`}
              className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
            >
              View all
            </Link>
          </div>

          <div className="space-y-4">
            {recentUploads.map((upload, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.01 }}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-white">
                        {upload.name}
                      </h3>
                      {upload.status === 'analyzing' ? (
                        <span className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-medium flex items-center">
                          <Clock className="w-3 h-3 mr-1 animate-spin" />
                          Analyzing
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-400 mt-2">
                      {upload.date} • {upload.requirements} requirements
                    </p>

                    {upload.status === 'completed' && (
                      <div className="flex items-center space-x-4 mt-4">
                        <div className="flex items-center space-x-2">
                          <Copy className="w-4 h-4 text-orange-400" />
                          <span className="text-sm text-gray-300">
                            {upload.duplicates} duplicates
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          <span className="text-sm text-gray-300">
                            {upload.conflicts} conflicts
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/workspace/${slug}/requirements/${index}`}
                    className="px-4 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-400 text-sm font-medium transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tips */}
        <motion.div variants={itemVariants}>
          <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-xl bg-purple-500/20">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Pro Tip: Organize your requirements
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Use clear naming conventions and group related requirements together for better analysis results.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default AnalystDashboard;