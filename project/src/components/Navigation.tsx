import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '../utils/constants';

interface NavigationProps {
  mobile?: boolean;
  onNeedHelp?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ mobile = false, onNeedHelp }) => {
  const location = useLocation();

  const handleClick = (path: string) => {
    if (path === '/help' && onNeedHelp) {
      onNeedHelp();
      return;
    }
  };

  return (
    <nav className={mobile ? 'flex flex-col space-y-2' : 'flex items-center space-x-6'}>
      {NAVIGATION_ITEMS.map((item) => (
        <Link
          key={item.id}
          to={item.path === '/help' ? '#' : item.path}
          onClick={() => handleClick(item.path)}
          className={`relative font-medium transition-all duration-200 ${
            mobile 
              ? 'p-2 hover:bg-gray-50 rounded-md text-gray-800 hover:text-primary-600' 
              : 'text-gray-700 hover:text-primary-600 hover:scale-105'
          } ${
            location.pathname === item.path ? 'text-primary-600' : ''
          } ${
            (item.title === 'Curate Test' || item.title === 'Learning Pathway') 
              ? 'after:content-[""] after:absolute after:h-0.5 after:w-0 after:left-0 after:bottom-0 after:bg-primary-500 hover:after:w-full after:transition-all' 
              : ''
          }`}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
};

export default Navigation;