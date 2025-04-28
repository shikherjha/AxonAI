import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Brain } from 'lucide-react';
import ChatbotButton from '../components/ChatbotButton'; // Import your chatbot component

const HeroSection: React.FC = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const featuresRef = useRef<HTMLElement | null>(null); // Reference to Features Section
  const controls = useAnimation();

  const handleStartLearningClick = () => {
    setIsChatbotOpen(true); // Open chatbot when "Start Learning" button is clicked
  };

  const handleExploreFeaturesClick = () => {
    if (featuresRef.current) {
      featuresRef.current.scrollIntoView({ behavior: 'smooth' }); // Smooth scroll to features section
    }
  };

  useEffect(() => {
    const shimmerInterval = setInterval(() => {
      controls.start({
        opacity: [1, 0.85, 1],
        transition: { duration: 2, ease: 'easeInOut' }
      });
    }, 10000);

    return () => clearInterval(shimmerInterval);
  }, [controls]);

  return (
    <section className="relative min-h-screen pt-32 pb-16 md:pt-40 md:pb-24 bg-gradient-to-b from-primary-50 to-white overflow-hidden">
      {/* Neural Network Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute w-full h-full">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0 relative z-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight"
            >
              AxonAI — Your{' '}
              <span className="text-primary-600">Intelligent Learning Companion</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
              className="text-xl text-gray-600 mb-8 max-w-lg"
            >
              <motion.span animate={controls} className="inline-block">
                Curate Knowledge, Explore Smarter, Evolve Faster
              </motion.span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
              className="flex flex-col sm:flex-row gap-4"
            >
              
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="md:w-1/2 flex justify-center"
          >
            <div className="relative">
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 0 rgba(56, 189, 248, 0.4)',
                    '0 0 20px rgba(56, 189, 248, 0.2)',
                    '0 0 0 rgba(56, 189, 248, 0.4)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-64 h-64 md:w-80 md:h-80 bg-primary-100 rounded-full flex items-center justify-center"
              >
                <Brain className="w-32 h-32 md:w-40 md:h-40 text-primary-600" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="absolute -top-4 -right-4 bg-white p-4 rounded-lg shadow-md"
              >
                <p className="text-sm font-medium text-gray-800">AI-Powered Learning</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="absolute -bottom-4 -left-4 bg-white p-4 rounded-lg shadow-md"
              >
                <p className="text-sm font-medium text-gray-800">Smart Pathways</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Conditionally render Chatbot */}
      {isChatbotOpen && <ChatbotButton />} {/* Changed Chatbot to ChatbotButton to match your import */}
    </section>
  );
};

export default HeroSection;