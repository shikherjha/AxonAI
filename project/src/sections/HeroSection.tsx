import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Brain, ExternalLink, ArrowRight } from 'lucide-react';

const HeroSection: React.FC = () => {
  const controls = useAnimation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const shimmerInterval = setInterval(() => {
      controls.start({
        opacity: [1, 0.85, 1],
        transition: { duration: 2, ease: 'easeInOut' }
      });
    }, 8000);

    return () => clearInterval(shimmerInterval);
  }, [controls]);

  // Animation variants
  const backgroundVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8,
        ease: [0.23, 1, 0.32, 1]
      }
    }
  };

  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-gradient-to-b from-blue-50 to-white">
      {/* Modern abstract background elements */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        initial="hidden"
        animate="visible"
        variants={backgroundVariants}
      >
        <div className="absolute top-0 right-0 w-full h-full">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-blue-100 opacity-50"></div>
          <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-indigo-50 opacity-70"></div>
          <div className="absolute bottom-20 right-1/3 w-40 h-40 rounded-full bg-teal-50 opacity-60"></div>
        </div>
        
        {/* Connected dots network */}
        <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <radialGradient id="dotGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
            </radialGradient>
          </defs>
          {Array.from({ length: 8 }).map((_, i) => (
            <circle
              key={i}
              cx={15 + Math.random() * 70}
              cy={15 + Math.random() * 70}
              r="0.5"
              fill="#3B82F6"
            />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <line
              key={i}
              x1={10 + Math.random() * 30}
              y1={10 + Math.random() * 80}
              x2={60 + Math.random() * 30}
              y2={10 + Math.random() * 80}
              stroke="#3B82F6"
              strokeWidth="0.1"
              strokeOpacity="0.2"
            />
          ))}
        </svg>
      </motion.div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <motion.div 
            className="lg:w-1/2 mb-16 lg:mb-0 text-center lg:text-left"
            initial="hidden"
            animate="visible"
            variants={contentVariants}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              AxonAI <span className="md:block">—</span> Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
                Intelligent Learning Companion
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
              <motion.span animate={controls} className="inline-block">
                Curate Knowledge, Explore Smarter, Evolve Faster
              </motion.span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a href="/ai-tutor" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center">
                Try AI Tutor <ArrowRight size={18} className="ml-2" />
              </a>
              <a href="/learning-pathway" className="px-6 py-3 bg-white text-blue-600 border border-blue-200 font-medium rounded-xl hover:shadow-md transition-all flex items-center justify-center">
                Explore Pathways <ExternalLink size={18} className="ml-2" />
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="lg:w-1/2 flex justify-center"
          >
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              {/* Main brain icon with pulsing effect */}
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 0 rgba(59, 130, 246, 0.0)',
                    '0 0 40px rgba(59, 130, 246, 0.3)',
                    '0 0 0 rgba(59, 130, 246, 0.0)',
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-full h-full rounded-full bg-gradient-to-br from-blue-100 to-white flex items-center justify-center relative z-10"
              >
                <motion.div 
                  initial={{ rotateZ: 0 }}
                  animate={{ rotateZ: 360 }}
                  transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 opacity-20"
                >
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    <defs>
                      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.3" />
                      </linearGradient>
                    </defs>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <circle 
                        key={i}
                        cx="100" 
                        cy="100" 
                        r={70 + i * 3} 
                        fill="none" 
                        stroke="url(#grad)" 
                        strokeWidth="0.5"
                        strokeDasharray={`${2 + i} ${6 - i * 0.5}`} 
                      />
                    ))}
                  </svg>
                </motion.div>

                <Brain className="w-32 h-32 md:w-40 md:h-40 text-blue-500" />
              </motion.div>

              {/* Floating feature boxes - Fixed positioning and z-index */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="absolute -top-4 -right-4 bg-white p-4 rounded-xl shadow-lg z-20"
                style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              >
                <p className="text-sm font-semibold text-gray-800">AI-Powered Learning</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="absolute -bottom-4 -left-4 bg-white p-4 rounded-xl shadow-lg z-20"
                style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              >
                <p className="text-sm font-semibold text-gray-800">Smart Pathways</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;