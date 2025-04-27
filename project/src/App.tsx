import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import ChatbotButton from './components/ChatbotButton';
import Footer from './components/Footer';
import HeroSection from './sections/HeroSection';
import FeaturesSection from './sections/FeaturesSection';
import GlobalSearch from './pages/GlobalSearch';
import CurateTest from './pages/CurateTest';
import LearningPathway from './pages/LearningPathway';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={
                <>
                  <HeroSection />
                  <FeaturesSection />
                </>
              } />
              <Route path="/global-search" element={<GlobalSearch />} />
              <Route path="/curate-test" element={<CurateTest />} />
              <Route path="/learning-pathway" element={<LearningPathway />} />
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
            </Routes>
          </main>
          <ChatbotButton />
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App