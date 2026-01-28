import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  // Stable sparkle config (SSR-safe)
  const sparkles = useMemo(
    () =>
      Array.from({ length: 18 }).map(() => ({
        size: Math.random() > 0.7 ? 6 : 3,
        gradient: Math.random() > 0.5,
        top: Math.random() * 100,
        left: Math.random() * 100,
        duration: 6 + Math.random() * 6,
        delay: Math.random() * 4,
      })),
    []
  );

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Deep gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0b0f] via-[#0f1015] to-[#0a0b0f]" />

      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.02] mix-blend-soft-light">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' /%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />
      </div>

      {/* Premium crystal sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {sparkles.map((s, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: s.size,
              height: s.size,
              top: `${s.top}%`,
              left: `${s.left}%`,
              background: s.gradient
                ? 'linear-gradient(135deg, rgba(167,139,250,0.8), rgba(99,102,241,0.8))'
                : 'rgba(255,255,255,0.6)',
              filter: 'blur(0.5px)',
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.4, 1],
            }}
            transition={{
              duration: s.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: s.delay,
            }}
          />
        ))}
      </div>

      {/* Radial depth overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(10,11,15,0.4)_100%)]" />

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-32">
        <div className="text-center space-y-8">
          {/* AI Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative flex items-center space-x-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-5 py-2.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                  Powered by Advanced NLP
                </span>
              </div>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="space-y-6"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.1]">
              <span className="block text-white mb-2">Radically better</span>
              <span className="block bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
                requirement analysis
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="max-w-2xl mx-auto text-lg lg:text-xl text-gray-400"
            >
              Automatically detect ambiguity, duplicates, and conflicts in your
              SRS documents. AI-powered rewriting to IEEE standards.
            </motion.p>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row justify-center gap-4 pt-4"
          >
            <Link to="/signup">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative px-8 py-4 rounded-xl font-semibold text-white overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                <span className="relative z-10 flex items-center gap-2">
                  Start analyzing for free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </motion.button>
            </Link>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 rounded-xl font-semibold text-white bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all"
            >
              Book a demo
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#0a0b0f] to-transparent pointer-events-none" />
    </div>
  );
};

export default Hero;