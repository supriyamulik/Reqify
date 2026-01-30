import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import {
  Users,
  FileText,
  Clock,
  CheckCircle,
  Upload,
  UserPlus,
  BarChart3,
  TrendingUp,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

const OwnerDashboard = () => {
  const { slug } = useParams();

  // Mock data (replace with real API calls later)
  const stats = [
    {
      label: 'Total Users',
      value: '12',
      change: '+2 this week',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      label: 'Total Requirements',
      value: '248',
      change: '+24 this month',
      icon: FileText,
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20'
    },
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
      value: '186',
      change: '75% completion',
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
  ];

  const quickActions = [
    {
      title: 'Invite Team Member',
      description: 'Add analysts and reviewers',
      icon: UserPlus,
      link: `/workspace/${slug}/team`,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      title: 'Upload Requirements',
      description: 'Start new analysis',
      icon: Upload,
      link: `/workspace/${slug}/upload`,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'View Analytics',
      description: 'Check team performance',
      icon: BarChart3,
      link: `/workspace/${slug}/analytics`,
      color: 'from-purple-500 to-pink-500'
    },
  ];

  const recentActivity = [
    {
      user: 'Sarah Johnson',
      action: 'uploaded new requirements',
      document: 'Mobile App SRS v2.0',
      time: '5 minutes ago',
      type: 'upload'
    },
    {
      user: 'Mike Chen',
      action: 'approved requirement',
      document: 'REQ-2024-048',
      time: '1 hour ago',
      type: 'approve'
    },
    {
      user: 'Lisa Wang',
      action: 'invited new team member',
      document: 'john@company.com',
      time: '2 hours ago',
      type: 'invite'
    },
    {
      user: 'System',
      action: 'completed analysis',
      document: 'E-commerce Platform SRS',
      time: '3 hours ago',
      type: 'analysis'
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
            Welcome back, Owner! 👋
          </h1>
          <p className="mt-2 text-gray-400">
            Here's what's happening with your workspace today.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => {
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
            {quickActions.map((action, index) => {
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

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Recent Activity</h2>
            <Link
              to={`/workspace/${slug}/activity`}
              className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
            >
              View all
            </Link>
          </div>

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className={`
                  px-6 py-4 flex items-start space-x-4
                  ${index !== recentActivity.length - 1 ? 'border-b border-white/10' : ''}
                  hover:bg-white/5 transition-colors
                `}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {activity.user.charAt(0)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">
                    <span className="font-semibold">{activity.user}</span>
                    {' '}{activity.action}{' '}
                    <span className="text-indigo-400">{activity.document}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.time}
                  </p>
                </div>

                {/* Type indicator */}
                <div className={`
                  px-2 py-1 rounded-lg text-xs font-medium flex-shrink-0
                  ${activity.type === 'upload' ? 'bg-blue-500/20 text-blue-400' : ''}
                  ${activity.type === 'approve' ? 'bg-green-500/20 text-green-400' : ''}
                  ${activity.type === 'invite' ? 'bg-purple-500/20 text-purple-400' : ''}
                  ${activity.type === 'analysis' ? 'bg-orange-500/20 text-orange-400' : ''}
                `}>
                  {activity.type}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div variants={itemVariants}>
          <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-xl bg-green-500/20">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  All systems operational
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  NLP service running • Database connected • Email notifications active
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default OwnerDashboard;
