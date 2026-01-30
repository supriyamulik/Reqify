import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-gray-950/60 backdrop-blur-2xl border-b border-white/5 shadow-2xl' : 'bg-transparent'}`}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <Link to="/" className="flex items-center space-x-4 group">
                        <div className="relative w-14 h-14 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                            <img
                                src="/reqify-logo.png"
                                alt="Reqify Logo"
                                className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]"
                            />
                        </div>
                        <span className="text-2xl font-bold text-white tracking-wide bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent hover:from-purple-200 hover:via-white hover:to-purple-200 transition-all duration-300" style={{ fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif', letterSpacing: '-0.02em' }}>
                            Reqify
                        </span>
                    </Link>

                    <div className="hidden lg:flex items-center space-x-1">
                        {['Features', 'How It Works', 'Modules', 'Pricing'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase().replace(' ', '-')}`}
                                className="relative px-4 py-2 text-gray-400 hover:text-white transition-colors duration-300 text-sm font-medium group"
                            >
                                {item}
                                <span className="absolute inset-x-4 -bottom-px h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </a>
                        ))}
                    </div>

                    <div className="hidden lg:flex items-center space-x-3">
                        <Link
                            to="/login"
                            className="px-5 py-2.5 text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium"
                        >
                            Sign in
                        </Link>

                        <Link
                            to="/signup"
                            className="relative group px-6 py-2.5 rounded-xl font-medium text-sm text-white overflow-hidden transition-all duration-300 hover:scale-105"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 group-hover:from-indigo-500 group-hover:via-purple-500 group-hover:to-indigo-500 transition-all duration-300" />
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
                            <span className="relative z-10">Get Started</span>
                        </Link>
                    </div>

                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="lg:hidden text-gray-300 hover:text-white transition-colors p-2"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <div className="lg:hidden bg-gray-950/95 backdrop-blur-2xl border-t border-white/5">
                    <div className="px-6 py-6 space-y-4">
                        {['Features', 'How It Works', 'Modules', 'Pricing'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase().replace(' ', '-')}`}
                                className="block text-gray-300 hover:text-white transition-colors py-2 text-base"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item}
                            </a>
                        ))}

                        <div className="pt-4 space-y-3 border-t border-white/5">
                            <Link
                                to="/login"
                                onClick={() => setIsMenuOpen(false)}
                                className="block text-gray-300 hover:text-white py-3 text-base font-medium text-center"
                            >
                                Sign in
                            </Link>

                            <Link
                                to="/signup"
                                onClick={() => setIsMenuOpen(false)}
                                className="block bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl text-base font-medium text-center shadow-lg shadow-indigo-500/30"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
