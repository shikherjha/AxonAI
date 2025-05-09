import React, { useState, useRef, useEffect } from 'react';
import { Search, Send, Paperclip, Mic, X, ChevronLeft, AlertCircle } from 'lucide-react';
import { getChatbotResponse, uploadFileToAI, checkBackendHealth, supabase, isAuthenticated } from '../utils/chatbotAPI';
import { useNavigate } from 'react-router-dom';

const AITutor: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMicSupported] = useState('mediaDevices' in navigator);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'loading' | 'healthy' | 'fallback'>('loading');
  const [userAuth, setUserAuth] = useState<boolean>(false);
  const navigate = useNavigate();

  // Check if user is authenticated and backend health on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const auth = await isAuthenticated();
      setUserAuth(auth);
      
      // If not authenticated, redirect to login
      if (!auth) {
        navigate('/login');
        return;
      }
      
      // Check backend health
      const isHealthy = await checkBackendHealth();
      setBackendStatus(isHealthy ? 'healthy' : 'fallback');
    };
    
    checkAuth();
    
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/login');
      } else if (event === 'SIGNED_IN' && session) {
        setUserAuth(true);
      }
    });

    return () => {
      // Clean up the subscription
      authListener?.subscription.unsubscribe();
    };
  }, [navigate]);

  // Scroll to bottom of chat when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Show file upload message
        setChatHistory(prev => [
          ...prev,
          `You: [Uploading file: ${file.name}]`
        ]);
        
        setIsLoading(true);
        const uploadResult = await uploadFileToAI(file);
        setIsLoading(false);
        
        // Add AI response about the file
        setChatHistory(prev => [
          ...prev,
          `AI Tutor: ${uploadResult}`
        ]);
      } catch (error) {
        console.error('Error uploading file:', error);
        setIsLoading(false);
        setChatHistory(prev => [
          ...prev,
          `AI Tutor: I had trouble processing your file. Could you try again?`
        ]);
      }
    }
  };

  const handleMicToggle = async () => {
    if (!isRecording) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsRecording(true);
        // In a real app, you would start recording here
      } catch (err) {
        console.error('Microphone access denied:', err);
      }
    } else {
      setIsRecording(false);
      // In a real app, you would stop recording and process the audio here
    }
  };

  const handleSendMessage = async () => {
    if (message.trim()) {
      try {
        const userMessage = message;
        
        // Add user message to chat history immediately
        setChatHistory(prev => [
          ...prev,
          `You: ${userMessage}`
        ]);
        
        // Clear input field
        setMessage('');
        
        // Show loading state
        setIsLoading(true);
        
        // Get AI response
        const response = await getChatbotResponse(userMessage);
        
        // Add AI response to chat history
        setChatHistory(prev => [
          ...prev,
          `AI Tutor: ${response.replace(/\n/g, '\n\n')}`
        ]);
        
        // Hide loading state
        setIsLoading(false);
      } catch (error) {
        console.error('Error sending message:', error);
        setChatHistory(prev => [
          ...prev,
          `AI Tutor: Sorry, I'm having trouble responding right now. Please try again later.`
        ]);
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleBackToHome = () => {
    navigate('/');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleBackToHome}
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="text-primary-600 font-bold text-2xl flex items-center">
              <svg viewBox="0 0 24 24" width="32" height="32" className="mr-2">
                <circle cx="12" cy="12" r="10" fill="#2563EB" opacity="0.2" />
                <circle cx="12" cy="12" r="6" fill="#2563EB" />
              </svg>
              AI Tutor
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {backendStatus !== 'loading' && (
              <div className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center ${
                backendStatus === 'healthy' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                <span className={`w-2 h-2 rounded-full mr-1 ${
                  backendStatus === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'
                }`}></span>
                {backendStatus === 'healthy' ? 'Advanced AI' : 'Standard AI'}
              </div>
            )}
            <div className="text-gray-700 font-medium">
              New Era AI Learning Assistant
            </div>
            {userAuth && (
              <button 
                onClick={handleSignOut}
                className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-6xl mx-auto w-full">
        {/* Backend Status Banner (shows only when in fallback mode) */}
        {backendStatus === 'fallback' && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Advanced AI features are currently unavailable. Running in standard mode.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Chat Container */}
        <div 
          ref={chatContainerRef}
          className="flex-1 p-6 overflow-y-auto bg-gray-50"
        >
          {chatHistory.length > 0 ? (
            <div className="space-y-6">
              {chatHistory.map((msg, index) => {
                const isUser = msg.startsWith('You:');
                return (
                  <div 
                    key={index} 
                    className={`${isUser ? 'ml-auto max-w-3xl' : 'mr-auto max-w-3xl'}`}
                  >
                    <div 
                      className={`rounded-lg p-4 ${
                        isUser 
                          ? 'bg-primary-600 text-white'
                          : 'bg-white border border-gray-200 shadow-sm'
                      }`}
                    >
                      <p className="whitespace-pre-line">
                        {msg.substring(msg.indexOf(':') + 1)}
                      </p>
                    </div>
                  </div>
                );
              })}
              {isLoading && (
                <div className="mr-auto max-w-3xl">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="bg-primary-50 rounded-full p-4 mb-4">
                <svg viewBox="0 0 24 24" width="48" height="48" className="text-primary-600">
                  <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2" />
                  <circle cx="12" cy="12" r="6" fill="currentColor" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to AI Tutor</h2>
              <p className="text-gray-600 max-w-lg mb-6">
                Your personal learning assistant. Ask any question about your studies, and I'll help you understand concepts, solve problems, and enhance your learning experience.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="font-medium text-gray-800 mb-2">Ask Questions</h3>
                  <p className="text-gray-600 text-sm">Get answers to your academic questions across various subjects</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="font-medium text-gray-800 mb-2">Solve Problems</h3>
                  <p className="text-gray-600 text-sm">Get step-by-step help with homework and assignments</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="font-medium text-gray-800 mb-2">Study Resources</h3>
                  <p className="text-gray-600 text-sm">Access explanations, examples, and study materials</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="font-medium text-gray-800 mb-2">Upload Files</h3>
                  <p className="text-gray-600 text-sm">Share documents for context-aware assistance</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="max-w-4xl mx-auto flex items-center gap-2">
            <div className="flex-1 flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask your question..."
                className="flex-1 p-3 focus:outline-none resize-none min-h-[44px] max-h-24"
                rows={1}
              />
              <div className="flex items-center pr-2">
                <button
                  onClick={handleFileUpload}
                  className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors"
                  title="Upload File"
                >
                  <Paperclip size={20} />
                </button>
                {isMicSupported && (
                  <button
                    onClick={handleMicToggle}
                    className={`p-2 rounded-full transition-colors ${
                      isRecording 
                        ? 'text-red-500 hover:text-red-600 hover:bg-red-50' 
                        : 'text-gray-500 hover:text-primary-600 hover:bg-gray-100'
                    }`}
                    title="Voice Input"
                  >
                    <Mic size={20} />
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              className={`p-3 rounded-lg transition-colors ${
                message.trim() && !isLoading
                  ? 'bg-primary-600 text-white hover:bg-primary-700' 
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <Send size={20} />
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.txt,.doc,.docx,image/*"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-gray-500 text-sm">
              Powered by Axon AI
            </div>
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-500 hover:text-gray-700">Privacy Policy</a>
            <a href="#" className="text-gray-500 hover:text-gray-700">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AITutor;