import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClerkProvider, SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from '@clerk/clerk-react';
import { FaMicrophone, FaKeyboard, FaRobot, FaGlobe, FaUserAlt, FaDatabase } from 'react-icons/fa';
import { Link } from "react-router-dom";
import './styles/App.css'; // Make sure to create this file for your styles



// Replace with your actual Clerk publishable key
const clerkPubKey = 'pk_test_aW50ZW50LWJlZGJ1Zy0yMi5jbGVyay5hY2NvdW50cy5kZXYk';

function Home() {

  const [isListening, setIsListening] = useState(false);
  
  // Animated background gradient effect
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0,
  });
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Features of the AI Entity
  const features = [
    { 
      icon: <FaMicrophone className="feature-icon indigo" />, 
      title: "Voice Recognition", 
      description: "Speak naturally and get intelligent responses with advanced speech recognition." 
    },
    { 
      icon: <FaRobot className="feature-icon blue" />, 
      title: "Animated Avatar", 
      description: "Interactive avatars with realistic expressions that respond to your queries in real-time." 
    },
    {
      icon: <FaGlobe className="feature-icon purple" />,
      title: "Multilingual Support",
      description: "Communicate in your preferred language with our AI that supports multiple languages."
    },
    {
      icon: <FaUserAlt className="feature-icon indigo" />,
      title: "Personalized Experience",
      description: "Customize your avatar's appearance and voice to match your organizational identity."
    },
    {
      icon: <FaDatabase className="feature-icon blue" />,
      title: "Knowledge Integration",
      description: "Access your organization's knowledge base instantly with AI-powered retrieval."
    },
    {
      icon: <FaKeyboard className="feature-icon purple" />,
      title: "Hybrid Interaction",
      description: "Seamlessly switch between text and voice interactions based on your preference."
    }
  ];

  // Avatar pulse animation variants
  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 0.9, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Floating particles for background effect
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    size: Math.random() * 10 + 3,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10
  }));

  const dynamicBackgroundStyle = {
    background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(129, 140, 248, 0.5), rgba(109, 40, 217, 0.2) 40%, rgba(17, 24, 39, 0.1) 80%)`,
  };

  return (
    <>
   

    <ClerkProvider publishableKey={clerkPubKey}>
      <div className="app-container">
        {/* Dynamic background gradient */}
        <div 
          className="dynamic-background"
          style={dynamicBackgroundStyle}
        />
        
        {/* Floating particles */}
        <div className="particles-container">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="particle"
              style={{
                width: particle.size,
                height: particle.size,
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
              animate={{
                x: ['-20px', '20px', '-20px'],
                y: ['-30px', '30px', '-30px'],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
        
        {/* Navigation Bar */}
        <nav className="navbar">
          <div className="logo-container">
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 10 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            >
              <FaRobot className="logo-icon" />
            </motion.div>
            <span className="logo-text">
              AI Entity
            </span>
          </div>
          
          <div className="auth-buttons">
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="sign-in-button">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="sign-up-button">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
          </div>
        </nav>
        
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-grid">
            <div className="hero-content">
              <motion.h1 
                className="hero-title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                The <span className="gradient-text">AI Entity</span> That Feels Alive
              </motion.h1>
              <motion.p 
                className="hero-description"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Transform your ERP support experience with an AI-powered avatar that speaks, listens, and understands, making documentation obsolete.
              </motion.p>
              <motion.div 
                className="hero-buttons"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <SignedOut>
                  <SignUpButton mode="modal">
                    <button className="get-started-button">
                      Get Started
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <button className="launch-button">
                    Launch Assistant
                  </button>
                </SignedIn>
                <button className="demo-button">
                  Watch Demo
                </button>
              </motion.div>
            </div>
            
            <div className="avatar-container">
              <motion.div
                className="avatar-glow"
                variants={pulseVariants}
                animate="pulse"
              />
              <motion.div 
                className="avatar-wrapper"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
              >
                <div className="avatar-circle">
                  {/* Avatar placeholder - replace with actual avatar component */}
                  <div className="avatar-inner">
                    <motion.div 
                      className="avatar-background"
                      animate={{ 
                        scale: [1, 1.05, 1],
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity,
                        ease: "easeInOut" 
                      }}
                    />
                    <div className="avatar-face">
                      {/* Placeholder avatar face - replace with your actual avatar rendering */}
                      <div className="avatar-placeholder">
                        <FaUserAlt className="avatar-icon" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Microphone button */}
                  <motion.button
                    className={`mic-button ${isListening ? 'listening' : ''}`}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsListening(!isListening)}
                  >
                    <FaMicrophone className="mic-icon" />
                    {isListening && (
                      <motion.div
                        className="mic-animation"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="features-section">
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="gradient-text">
              Revolutionize 
            </span> Your Support Experience
          </motion.h2>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="feature-content">
                  {feature.icon}
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="cta-section">
          <motion.div 
            className="cta-container"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="cta-content">
              <div className="cta-text">
                <h2 className="cta-title">Ready to Transform Your ERP Experience?</h2>
                <p className="cta-description">Join IDMS Infotech in revolutionizing enterprise support.</p>
              </div>
              <div className="cta-buttons">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <button className="cta-button">
                      Get Started Now
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                <Link to="/chat">
      <button className="cta-button">Launch Assistant</button>
    </Link>
                </SignedIn>
              </div>
            </div>
          </motion.div>
        </section>
        
        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-logo">
              <FaRobot className="footer-icon" />
              <span className="footer-text">
                AI Entity
              </span>
            </div>
            <div className="copyright">
              © {new Date().getFullYear()} IDMS Infotech. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </ClerkProvider>
    </>
  );
};

export default Home;