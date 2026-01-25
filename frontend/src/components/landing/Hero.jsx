import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useMemo } from 'react';

const Hero = () => {
  // Generate wave parameters for each line - MORE VISIBLE
  const waves = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      delay: Math.random() * 5,
      duration: 6 + Math.random() * 3, // Slightly faster
      amplitude: 8 + Math.random() * 8, // More amplitude
      opacity: 0.15 + Math.random() * 0.15, // More visible
    }));
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Deep gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0b0f] via-[#0f1015] to-[#0a0b0f]" />

      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.02] mix-blend-soft-light">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' /%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }} />
      </div>

      {/* NLP Signal Wave Lines - ENHANCED VISIBILITY */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Adjusted mask for better visibility */}
        <div className="absolute inset-0" style={{
          maskImage: 'radial-gradient(ellipse 90% 70% at 50% 50%, transparent 20%, black 60%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 50%, transparent 20%, black 60%, transparent 100%)'
        }}>
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            <defs>
              {/* Enhanced gradient definitions with MORE opacity */}
              <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0" />
                <stop offset="15%" stopColor="rgb(99, 102, 241)" stopOpacity="0.4" />
                <stop offset="50%" stopColor="rgb(139, 92, 246)" stopOpacity="0.5" />
                <stop offset="85%" stopColor="rgb(99, 102, 241)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0" />
              </linearGradient>

              <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0" />
                <stop offset="15%" stopColor="rgb(139, 92, 246)" stopOpacity="0.35" />
                <stop offset="50%" stopColor="rgb(168, 85, 247)" stopOpacity="0.4" />
                <stop offset="85%" stopColor="rgb(139, 92, 246)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0" />
              </linearGradient>

              <linearGradient id="wave-gradient-3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
                <stop offset="15%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
                <stop offset="50%" stopColor="rgb(99, 102, 241)" stopOpacity="0.35" />
                <stop offset="85%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
              </linearGradient>

              {/* Stronger glow filter */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {waves.map((wave) => {
              const yPosition = (wave.id / waves.length) * 100;
              const gradientId = `wave-gradient-${(wave.id % 3) + 1}`;

              return (
                <motion.path
                  key={wave.id}
                  d={`M 0 ${yPosition} Q 25 ${yPosition} 50 ${yPosition} T 100 ${yPosition}`}
                  stroke={`url(#${gradientId})`}
                  strokeWidth="2"
                  fill="none"
                  filter="url(#glow)"
                  vectorEffect="non-scaling-stroke"
                  animate={{
                    d: [
                      `M 0 ${yPosition} Q 25 ${yPosition - wave.amplitude} 50 ${yPosition} T 100 ${yPosition}`,
                      `M 0 ${yPosition} Q 25 ${yPosition + wave.amplitude} 50 ${yPosition} T 100 ${yPosition}`,
                      `M 0 ${yPosition} Q 25 ${yPosition - wave.amplitude} 50 ${yPosition} T 100 ${yPosition}`,
                    ],
                  }}
                  transition={{
                    duration: wave.duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: wave.delay,
                  }}
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Subtle radial gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-[#0a0b0f]/40" />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-32">
        <div className="text-center space-y-8">
          {/* AI Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center space-x-2"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="relative flex items-center space-x-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-5 py-2.5 group-hover:border-white/20 transition-all duration-500">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                  Powered by Advanced NLP
                </span>
              </div>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
            className="space-y-6"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1.1]">
              <span className="block text-white mb-2">Radically better</span>
              <span className="block bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
                requirement analysis
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="max-w-2xl mx-auto text-lg lg:text-xl text-gray-400 leading-relaxed font-light"
            >
              Automatically detect ambiguity, duplicates, and conflicts in your SRS documents.
              AI-powered rewriting to IEEE standards. Ship better software, faster.
            </motion.p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative px-8 py-4 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
              <span className="relative z-10 flex items-center space-x-2">
                <span>Start analyzing for free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative px-8 py-4 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300"
            >
              <div className="absolute inset-0 bg-white/5 backdrop-blur-xl border border-white/10 group-hover:border-white/20 transition-all duration-300" />
              <span className="relative z-10">Book a demo</span>
            </motion.button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex items-center justify-center space-x-6 pt-8 text-sm text-gray-500"
          >
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
              <span>No credit card required</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-700" />
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" />
              <span>14-day free trial</span>
            </div>
          </motion.div>

          {/* Floating Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
            className="pt-16 relative"
          >
            <div className="relative max-w-5xl mx-auto">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/20 via-purple-500/10 to-transparent blur-3xl transform translate-y-12" />

              {/* Dashboard Card */}
              <div className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-2xl overflow-hidden">
                {/* Subtle Grid Pattern Inside Card */}
                <div className="absolute inset-0 opacity-[0.02]" style={{
                  backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px'
                }} />

                {/* Header */}
                <div className="relative flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-gray-400 text-sm font-medium">Live Analysis</span>
                  </div>
                  <div className="text-gray-500 text-sm">3 min ago</div>
                </div>

                {/* Analysis Results */}
                <div className="relative space-y-6">
                  {[
                    { label: 'Duplicates Detected', value: '12', color: 'from-indigo-500 to-purple-500', width: '75%' },
                    { label: 'Conflicts Found', value: '8', color: 'from-purple-500 to-pink-500', width: '60%' },
                    { label: 'Ambiguous Terms', value: '15', color: 'from-pink-500 to-rose-500', width: '85%' }
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 1.5 + index * 0.2 }}
                      className="space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm font-medium">{item.label}</span>
                        <span className="text-white text-sm font-semibold">{item.value}</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden backdrop-blur-xl">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: item.width }}
                          transition={{ duration: 1.5, delay: 1.8 + index * 0.2, ease: "easeOut" }}
                          className={`h-full bg-gradient-to-r ${item.color} rounded-full relative`}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Footer */}
                <div className="relative mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                  <span className="text-gray-500 text-sm">Analysis complete</span>
                  <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors group">
                    View full report
                    <ArrowRight className="inline-block w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Floating Badges */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -left-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 shadow-2xl"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-green-400 text-sm font-semibold">95% Accuracy</span>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-4 -right-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 shadow-2xl"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="text-indigo-400 text-sm font-semibold">10x Faster</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0b0f] to-transparent pointer-events-none" />
    </div>
  );
};

export default Hero;