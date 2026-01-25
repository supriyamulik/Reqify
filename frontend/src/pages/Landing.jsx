import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import Footer from '../components/landing/Footer';

const Landing = () => {
    return (
        <div className="min-h-screen bg-[#0a0b0f]">
            <Navbar />
            <Hero />
            <Features />
            <Footer />
        </div>
    );
};

export default Landing;