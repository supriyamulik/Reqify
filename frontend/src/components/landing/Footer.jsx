import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
    const links = {
        product: [
            { name: 'Features', href: '#features' },
            { name: 'How it works', href: '#how-it-works' },
            { name: 'Pricing', href: '#pricing' },
            { name: 'Modules', href: '#modules' }
        ],
        company: [
            { name: 'About', href: '#about' },
            { name: 'Blog', href: '#blog' },
            { name: 'Careers', href: '#careers' },
            { name: 'Contact', href: '#contact' }
        ],
        resources: [
            { name: 'Documentation', href: '#docs' },
            { name: 'API Reference', href: '#api' },
            { name: 'Support', href: '#support' },
            { name: 'Status', href: '#status' }
        ],
        legal: [
            { name: 'Privacy', href: '#privacy' },
            { name: 'Terms', href: '#terms' },
            { name: 'Security', href: '#security' }
        ]
    };

    const socialLinks = [
        { icon: Github, href: '#', label: 'GitHub' },
        { icon: Twitter, href: '#', label: 'Twitter' },
        { icon: Linkedin, href: '#', label: 'LinkedIn' },
        { icon: Mail, href: '#', label: 'Email' }
    ];

    return (
        <footer className="relative bg-[#0a0b0f] border-t border-white/5">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/50 to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20">
                {/* Main Footer Content */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-16">
                    {/* Brand */}
                    <div className="col-span-2">
                        <div className="flex items-center space-x-4 mb-6 group cursor-pointer">
                            <div className="relative w-10 h-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
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
                        <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs font-light">
                            AI-powered requirement analysis platform. Ship better software with clear, conflict-free specifications.
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center space-x-3">
                            {socialLinks.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        aria-label={social.label}
                                        className="w-10 h-10 rounded-lg bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all duration-300 hover:scale-110"
                                    >
                                        <Icon className="w-4 h-4" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Links Columns */}
                    {Object.entries(links).map(([category, items]) => (
                        <div key={category}>
                            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                                {category}
                            </h3>
                            <ul className="space-y-3">
                                {items.map((link) => (
                                    <li key={link.name}>
                                        <a
                                            href={link.href}
                                            className="text-gray-400 hover:text-white text-sm transition-colors duration-300 font-light"
                                        >
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                    <p className="text-gray-500 text-sm font-light">
                        © 2026 Reqify. All rights reserved.
                    </p>

                    <div className="flex items-center space-x-6 text-sm">
                        <a href="#privacy" className="text-gray-500 hover:text-gray-300 transition-colors duration-300 font-light">
                            Privacy Policy
                        </a>
                        <a href="#terms" className="text-gray-500 hover:text-gray-300 transition-colors duration-300 font-light">
                            Terms of Service
                        </a>
                        <a href="#cookies" className="text-gray-500 hover:text-gray-300 transition-colors duration-300 font-light">
                            Cookie Policy
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
