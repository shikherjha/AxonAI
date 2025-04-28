import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import { FeatureCardProps } from '../utils/types';

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  description, 
  icon: Icon,
  className = '' 
}) => {
  return (
    <div 
      className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 
        hover:translate-y-[-5px] border border-gray-100 ${className}`}
    >
      <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-primary-100 text-primary-600">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
      
      {/* Add CTA button with glow effect for specific features */}
      {(title === 'Curate Test' || title === 'Learning Pathway') && (
        <Link to={`/${title.toLowerCase().replace(/\s+/g, '-')}`} className="mt-4 py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-all hover:shadow-glow">
          Get Started
        </Link>
      )}
    </div>
  );
};

export default FeatureCard;
