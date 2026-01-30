import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Menu
} from 'lucide-react';

const Header = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Mock notifications (replace with real data later)
  const notifications = [
    { id: 1, text: 'New requirement uploaded', time: '5 min ago', unread: true },
    { id: 2, text: 'Analysis complete', time: '1 hour ago', unread: true },
    { id: 3, text: 'Team member invited', time: '2 hours ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/5 border-b border-white/10">
      <div className="px-4 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          
          {/* Left Section - Menu + Search */}
          <div className="flex items-center space-x-4 flex-1">
            {/* Desktop Sidebar Toggle */}
            <button
              onClick={onToggleSidebar}
              className="hidden lg:block p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-400" />
            </button>

            {/* Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-xl">
              <div className="relative w-full group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Search requirements, documents..."
                  className="
                    w-full pl-12 pr-4 py-3 rounded-xl
                    bg-white/5 border border-white/10
                    text-white placeholder-gray-500
                    focus:bg-white/10 focus:border-indigo-500/50 focus:outline-none
                    transition-all duration-300
                  "
                />
                {/* Focus glow */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-indigo-500/0 opacity-0 group-focus-within:opacity-20 blur-xl pointer-events-none transition-opacity duration-300" />
              </div>
            </div>
          </div>

          {/* Right Section - Notifications + Profile */}
          <div className="flex items-center space-x-3">
            
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-400" />
                
                {/* Notification badge */}
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs font-bold flex items-center justify-center text-white border-2 border-[#0a0b0f]"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 rounded-xl backdrop-blur-xl bg-gray-900/95 border border-white/10 shadow-2xl overflow-hidden"
                  >
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-white/10">
                      <h3 className="font-semibold text-white">Notifications</h3>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`
                              px-4 py-3 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors
                              ${notification.unread ? 'bg-indigo-500/5' : ''}
                            `}
                          >
                            <div className="flex items-start space-x-3">
                              {notification.unread && (
                                <div className="mt-2 w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white">
                                  {notification.text}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center text-gray-400">
                          No notifications
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 border-t border-white/10 text-center">
                      <button className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-3 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>

                {/* Name (hidden on mobile) */}
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-white">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">
                    {user?.role || 'Member'}
                  </p>
                </div>

                {/* Chevron */}
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-64 rounded-xl backdrop-blur-xl bg-gray-900/95 border border-white/10 shadow-2xl overflow-hidden"
                  >
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="font-semibold text-white">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-sm text-gray-400">
                        {user?.email || 'user@example.com'}
                      </p>
                      <div className="mt-2 inline-flex items-center px-2 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
                        <span className="text-xs font-medium text-indigo-400 capitalize">
                          {user?.role || 'Member'}
                        </span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate(`/workspace/${user?.organizationId}/profile`);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-white/5 transition-colors text-left"
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-white">Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate(`/workspace/${user?.organizationId}/settings`);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-white/5 transition-colors text-left"
                      >
                        <Settings className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-white">Settings</span>
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-white/10 py-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-red-500/10 transition-colors text-left text-red-400"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              className="
                w-full pl-12 pr-4 py-3 rounded-xl
                bg-white/5 border border-white/10
                text-white placeholder-gray-500
                focus:bg-white/10 focus:border-indigo-500/50 focus:outline-none
                transition-all duration-300
              "
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;