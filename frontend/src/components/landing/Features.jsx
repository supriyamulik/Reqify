import { motion } from 'framer-motion';
import { Copy, AlertTriangle, FileCheck, Sparkles, Zap, Shield } from 'lucide-react';

const Features = () => {
    const features = [
        {
            icon: Copy,
            title: 'Duplicate Detection',
            description: 'Automatically identify duplicate requirements using TF-IDF and cosine similarity algorithms with 95% accuracy.',
            color: 'from-indigo-500 to-purple-500',
            delay: 0.1
        },
        {
            icon: AlertTriangle,
            title: 'Conflict Analysis',
            description: 'Detect contradicting requirements and highlight inconsistencies before they become costly issues.',
            color: 'from-purple-500 to-pink-500',
            delay: 0.2
        },
        {
            icon: FileCheck,
            title: 'Ambiguity Highlighting',
            description: 'Flag unclear terms and vague statements that could lead to misinterpretation and project delays.',
            color: 'from-pink-500 to-rose-500',
            delay: 0.3
        },
        {
            icon: Sparkles,
            title: 'AI-Powered Rewriting',
            description: 'Get intelligent suggestions to rewrite requirements in clear, IEEE 830-compliant format automatically.',
            color: 'from-rose-500 to-orange-500',
            delay: 0.4
        },
        {
            icon: Zap,
            title: 'Instant Processing',
            description: 'Analyze 200-500 requirements in under 5 minutes. Upload TXT, PDF, or DOCX files seamlessly.',
            color: 'from-orange-500 to-amber-500',
            delay: 0.5
        },
        {
            icon: Shield,
            title: 'IEEE Standard Compliance',
            description: 'Generate clean, standardized SRS documents following IEEE 830 guidelines for professional delivery.',
            color: 'from-amber-500 to-yellow-500',
            delay: 0.6
        }
    ];

    return (
        <section className="relative py-32 overflow-hidden bg-[#0a0b0f]">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-radial from-gray-900/30 via-[#0a0b0f] to-[#0a0b0f]" />

            {/* Animated Orb */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.15, 0.1],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial from-indigo-500/10 to-transparent blur-3xl"
            />

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-20 space-y-4"
                >
                    <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 mb-4">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm font-medium text-gray-300">Core Features</span>
                    </div>

                    <h2 className="text-4xl lg:text-5xl font-bold text-white">
                        Everything you need to
                        <span className="block mt-2 bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                            perfect your requirements
                        </span>
                    </h2>

                    <p className="text-lg text-gray-400 max-w-2xl mx-auto font-light">
                        Powered by advanced NLP algorithms and machine learning to deliver unmatched accuracy and speed.
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: feature.delay }}
                                className="group relative"
                            >
                                {/* Card Glow Effect */}
                                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500 rounded-2xl`} />

                                {/* Card */}
                                <div className="relative h-full bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-500 group-hover:-translate-y-1">
                                    {/* Icon */}
                                    <div className="relative mb-6">
                                        <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-20 blur-2xl group-hover:opacity-30 transition-opacity duration-500`} />
                                        <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                                            <Icon className="w-7 h-7 text-white" />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                                        {feature.title}
                                    </h3>

                                    <p className="text-gray-400 leading-relaxed font-light">
                                        {feature.description}
                                    </p>

                                    {/* Subtle Bottom Border Effect */}
                                    <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="text-center mt-20"
                >
                    <p className="text-gray-400 mb-6">
                        Ready to transform your requirement analysis workflow?
                    </p>
                    <button className="group relative px-8 py-4 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-105">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 group-hover:from-indigo-500 group-hover:via-purple-500 group-hover:to-indigo-500 transition-all duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
                        <span className="relative z-10">Start free trial</span>
                    </button>
                </motion.div>
            </div>
        </section>
    );
};

export default Features;