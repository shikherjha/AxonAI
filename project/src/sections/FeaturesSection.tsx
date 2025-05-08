import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  FileText, 
  Compass, 
  HelpCircle, 
  ChevronRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Define feature icon components with consistent styling
const FeatureIcon: React.FC<{ icon: React.ReactNode, color: string }> = ({ icon, color }) => (
  <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-white mb-5`}>
    {icon}
  </div>
);

const FeatureCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  delay: number;
  link: string;  // Added link as a prop
}> = ({ title, description, icon, color, delay, link }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
    >
      <FeatureIcon icon={icon} color={color} />
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 mb-6 flex-grow">{description}</p>

      <Link 
        to={link}  // Using Link for navigation
        className="mt-auto self-start flex items-center text-blue-500 font-medium hover:text-blue-600 transition-colors"
      >
        Get Started <ChevronRight size={16} className="ml-1" />
      </Link>
    </motion.div>
  );
};

const FeaturesSection: React.FC = () => {
  const features = [
    {
      title: "Global Search",
      description: "Access vast educational resources with our powerful AI-driven search engine tailored for academic content.",
      icon: <Search size={24} />,
      color: "bg-gradient-to-r from-blue-400 to-blue-500",
      delay: 0.1,
      link: "/global-search"  // Added link
    },
    {
      title: "Curate Test",
      description: "Create customized assessments and quizzes based on specific learning objectives and curriculum requirements.",
      icon: <FileText size={24} />,
      color: "bg-gradient-to-r from-purple-400 to-purple-500",
      delay: 0.2,
      link: "/curate-test"  // Added link
    },
    {
      title: "Learning Pathway",
      description: "Follow personalized learning journeys designed to match your pace, style, and educational goals.",
      icon: <Compass size={24} />,
      color: "bg-gradient-to-r from-teal-400 to-teal-500",
      delay: 0.3,
      link: "/learning-pathway"  // Added link
    },
    {
      title: "Need Help?",
      description: "Get instant assistance with homework, research, or any academic questions from our AI assistant.",
      icon: <HelpCircle size={24} />,
      color: "bg-gradient-to-r from-amber-400 to-amber-500",
      delay: 0.4,
      link: "/ai-tutor"  // Added link
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-blue-100"></div>
        <div className="absolute top-1/2 -left-20 w-40 h-40 rounded-full bg-purple-100"></div>
        <div className="absolute -bottom-10 right-1/4 w-32 h-32 rounded-full bg-teal-100"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Powerful Learning Features
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the tools that make AxonAI the perfect companion for your educational journey.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              color={feature.color}
              delay={feature.delay}
              link={feature.link}  // Passing the link to the FeatureCard component
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;