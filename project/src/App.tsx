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
import AITutor from './pages/AITutor';  // Import the AI Tutor page
import PrivateRoute from './components/PrivateRoute';
import TakeTest from './pages/TakeTest';

// Layout wrapper for pages that need the standard layout
const StandardLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Header />
    <main className="flex-grow">
      {children}
    </main>
    <ChatbotButton />
    <Footer />
  </>
);

// Layout wrapper for full-page experiences (like AI Tutor)
const FullPageLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    {children}
  </>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Routes>
            {/* Standard layout routes */}
            <Route path="/" element={
              <StandardLayout>
                <>
                  <HeroSection />
                  <FeaturesSection />
                </>
              </StandardLayout>
            } />
            <Route path="/global-search" element={
              <StandardLayout>
                <GlobalSearch />
              </StandardLayout>
            } />
            <Route path="/curate-test" element={
              <StandardLayout>
                <CurateTest />
              </StandardLayout>
            } />
            <Route path="/learning-pathway" element={
              <StandardLayout>
                <LearningPathway />
              </StandardLayout>
            } />
            <Route path="/dashboard" element={
              <StandardLayout>
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              </StandardLayout>
            } />
            
            {/* Full-page layout for AI Tutor */}
            <Route path="/ai-tutor" element={
              <FullPageLayout>
                <AITutor />
              </FullPageLayout>
            } />
            <Route path="/take-test" element={
              <StandardLayout>
                <TakeTest />
                </StandardLayout>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;