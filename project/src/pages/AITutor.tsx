import React, { useState, useRef, useEffect } from 'react';
import { Search, Send, Paperclip, Mic, X, ChevronLeft } from 'lucide-react';
import { getChatbotResponse, uploadFileToAI } from '../utils/chatbotAPI';
import { useNavigate } from 'react-router-dom';

const AITutor: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMicSupported] = useState('mediaDevices' in navigator);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
        
        // In a full implementation, you would upload the file to your backend
        // For now we'll just simulate it with a message
        const uploadResult = await uploadFileToAI(file);
        
        // Add AI response about the file
        setChatHistory(prev => [
          ...prev,
          `AI Tutor: I've received your file "${file.name}". What would you like to know about it?`
        ]);
      } catch (error) {
        console.error('Error uploading file:', error);
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
          <div className="text-gray-700 font-medium">
            New Era AI Learning Assistant
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-6xl mx-auto w-full">
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
              disabled={!message.trim()}
              className={`p-3 rounded-lg transition-colors ${
                message.trim() 
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