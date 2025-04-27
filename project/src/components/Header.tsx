import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LanguageSelector from './LanguageSelector';
import Navigation from './Navigation';
import AuthModal from './AuthModal';
import { LANGUAGES } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [chatbotOpen, setChatbotOpen] = useState(false);
  
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleNeedHelp = () => {
    const chatbotButton = document.querySelector('.chatbot-button') as HTMLButtonElement;
    if (chatbotButton) {
      chatbotButton.click();
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-md shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <a href="/" className="flex items-center gap-2">
            <span className="font-bold text-2xl text-primary-600">AxonAI</span>
          </a>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <Navigation onNeedHelp={handleNeedHelp} />
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <LanguageSelector 
              languages={LANGUAGES} 
              selected={selectedLanguage} 
              onSelect={setSelectedLanguage} 
            />
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Dashboard
                </button>
                <button 
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-all hover:shadow-glow"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => handleAuthClick('login')}
                  className="px-4 py-2 text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Login
                </button>
                <button 
                  onClick={() => handleAuthClick('signup')}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-all hover:shadow-glow"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          <button 
            className="md:hidden text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 shadow-lg">
          <nav className="flex flex-col space-y-3">
            <Navigation mobile onNeedHelp={handleNeedHelp} />
          </nav>
          <div className="mt-4 flex flex-col space-y-3">
            <LanguageSelector 
              languages={LANGUAGES} 
              selected={selectedLanguage} 
              onSelect={setSelectedLanguage} 
              mobile 
            />
            <div className="flex flex-col space-y-2 pt-3 border-t border-gray-100">
              {user ? (
                <>
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="px-4 py-2 text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={handleSignOut}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-all hover:shadow-glow"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => handleAuthClick('login')}
                    className="px-4 py-2 text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => handleAuthClick('signup')}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-all hover:shadow-glow"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </header>
  );
};

export default Header;