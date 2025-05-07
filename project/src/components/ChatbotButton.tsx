import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Paperclip, Mic, Send, GraduationCap, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getChatbotResponse } from '../utils/chatbotAPI';
import { Link, useNavigate } from 'react-router-dom';

const ChatbotButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [chatHistory, setChatHistory] = useState<string[]>([]); 
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMicSupported] = useState('mediaDevices' in navigator);
  const navigate = useNavigate();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatPopupRef = useRef<HTMLDivElement>(null);

  // Effect to scroll chat to bottom when messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Handle click outside to close popup
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (chatPopupRef.current && !chatPopupRef.current.contains(event.target as Node) && 
          !(event.target as Element).closest('.chatbot-button')) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Position adjustment to prevent header overlap
  useEffect(() => {
    if (isOpen) {
      const header = document.querySelector('header') || document.querySelector('nav');
      if (header && chatPopupRef.current) {
        const headerRect = header.getBoundingClientRect();
        chatPopupRef.current.style.top = 'auto';
        chatPopupRef.current.style.bottom = '70px';
      }
    }
  }, [isOpen]);

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setChatHistory(prev => [
        ...prev,
        `You: Uploaded file: ${file.name}`
      ]);
      
      // Simulate AI processing the file
      setTimeout(() => {
        setChatHistory(prev => [
          ...prev,
          `AI: I've received your file "${file.name}". How can I help you with this content?`
        ]);
      }, 1000);
    }
  };

  const handleMicToggle = async () => {
    if (!isRecording) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsRecording(true);
        
        // Simulate voice recording for demo purposes
        setTimeout(() => {
          setIsRecording(false);
          setChatHistory(prev => [
            ...prev,
            `You: [Voice message recorded]`
          ]);
          
          // Simulate AI response to voice
          setTimeout(() => {
            setChatHistory(prev => [
              ...prev, 
              `AI: I've processed your voice message. How else can I assist you with your learning?`
            ]);
          }, 1000);
        }, 3000);
        
      } catch (err) {
        console.error('Microphone access denied:', err);
      }
    } else {
      setIsRecording(false);
    }
  };

  const handleSendMessage = async () => {
    if (message.trim()) {
      const userMessage = message.trim();
      
      // Add user message to chat history immediately
      setChatHistory(prev => [
        ...prev, 
        `You: ${userMessage}`
      ]);
      
      // Clear input field
      setMessage('');
      
      try {
        // Get AI chatbot response
        const response = await getChatbotResponse(userMessage);
        
        // Add AI response to chat history
        setChatHistory(prev => [
          ...prev,
          `AI: ${response.replace(/\n/g, '\n\n')}` // Add double newlines for paragraph spacing
        ]);
      } catch (error) {
        console.error('Error sending message:', error);
        // Add error message to chat history
        setChatHistory(prev => [
          ...prev,
          `AI: Sorry, I encountered an error. Please try again.`
        ]);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const openFullTutor = () => {
    setIsOpen(false); // Close the popup first
    navigate('/ai-tutor'); // Navigate to full AI Tutor page
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatPopupRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="bg-white rounded-2xl shadow-2xl mb-4 w-[90vw] sm:w-96 max-h-[80vh] overflow-hidden absolute bottom-16 right-0"
            style={{ 
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              borderWidth: '1px',
              borderColor: 'rgba(226, 232, 240, 1)',
            }}
          >
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap size={24} />
                <h3 className="font-semibold text-lg">AI Tutor</h3>
              </div>
              <div className="flex items-center">
                <button 
                  onClick={openFullTutor}
                  className="mr-2 hover:bg-blue-600/50 p-1.5 rounded transition-colors flex items-center"
                  title="Open full AI Tutor"
                  aria-label="Open full AI Tutor"
                >
                  <ExternalLink size={18} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-blue-600/50 p-1.5 rounded-full transition-colors"
                  aria-label="Close chat"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div 
              ref={chatContainerRef}
              className="h-[50vh] p-4 overflow-y-auto bg-gray-50/50"
            >
              {chatHistory.length > 0 ? (
                <div className="space-y-4">
                  {chatHistory.map((msg, index) => {
                    const isAI = msg.startsWith('AI:');
                    const messageText = msg.substring(msg.indexOf(':') + 1).trim();
                    
                    return (
                      <div 
                        key={index} 
                        className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}
                      >
                        <div 
                          className={`max-w-[80%] p-3 rounded-2xl ${
                            isAI 
                              ? 'bg-white border border-gray-200 text-gray-800' 
                              : 'bg-blue-500 text-white'
                          }`}
                        >
                          <p className="whitespace-pre-line text-sm">{messageText}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <GraduationCap size={28} className="text-blue-500" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-800 mb-2">Welcome to AI Tutor</h4>
                  <p className="text-gray-600 text-sm">How can I help you with your learning today?</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={handleFileUpload}
                  className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                  title="Upload File"
                  aria-label="Upload File"
                >
                  <Paperclip size={20} />
                </button>
                {isMicSupported && (
                  <button
                    onClick={handleMicToggle}
                    className={`p-2 rounded-full transition-colors ${
                      isRecording 
                        ? 'text-red-500 bg-red-50 animate-pulse' 
                        : 'text-gray-500 hover:text-blue-500 hover:bg-blue-50'
                    }`}
                    title={isRecording ? "Stop Recording" : "Voice Input"}
                    aria-label={isRecording ? "Stop Recording" : "Start Voice Recording"}
                  >
                    <Mic size={20} />
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.txt,.doc,.docx,image/*"
                />
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1 relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask your question..."
                    className="w-full p-3 pr-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                    rows={1}
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className={`p-3 rounded-xl transition-colors flex-shrink-0 ${
                    message.trim() 
                      ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md' 
                      : 'bg-gray-100 text-gray-400'
                  }`}
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        onClick={() => setIsOpen(!isOpen)}
        className="chatbot-button w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle AI Tutor chat"
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <MessageCircle size={24} />
        )}
      </motion.button>
    </div>
  );
};

export default ChatbotButton;