import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

interface NavigationProps {
  mobile?: boolean;
  onNeedHelp?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ mobile = false, onNeedHelp }) => {
  const navigate = useNavigate();
  
  const handleAITutorClick = () => {
    navigate('/ai-tutor');
  };

  const baseClasses = mobile
    ? "block py-2 text-gray-700 hover:text-primary-600 transition-colors"
    : "text-gray-700 hover:text-primary-600 transition-colors";

  const activeClasses = mobile
    ? "block py-2 text-primary-600 font-medium transition-colors"
    : "text-primary-600 font-medium transition-colors";

  return (
    <>
      <NavLink 
        to="/global-search" 
        className={({ isActive }) => isActive ? activeClasses : baseClasses}
      >
        Global Search
      </NavLink>
      <NavLink 
        to="/curate-test" 
        className={({ isActive }) => isActive ? activeClasses : baseClasses}
      >
        Curate Test
      </NavLink>
      <NavLink 
        to="/learning-pathway" 
        className={({ isActive }) => isActive ? activeClasses : baseClasses}
      >
        Learning Pathway
      </NavLink>
      <button 
        onClick={handleAITutorClick}
        className={baseClasses}
      >
        AI Tutor
      </button>
      <button 
        onClick={onNeedHelp} 
        className={baseClasses}
      >
        Need Help?
      </button>
    </>
  );
};

export default Navigation;