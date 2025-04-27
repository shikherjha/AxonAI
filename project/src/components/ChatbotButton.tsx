import React, { useState, useRef } from 'react';
import { MessageCircle, X, Paperclip, Mic, Send, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getChatbotResponse } from '../utils/chatbotAPI';  // Adjusted path for utils folder


const ChatbotButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [chatHistory, setChatHistory] = useState<string[]>([]); // <-- Maintain chat history to show previous responses
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMicSupported] = useState('mediaDevices' in navigator);
  
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name);
    }
  };

  const handleMicToggle = async () => {
    if (!isRecording) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsRecording(true);
      } catch (err) {
        console.error('Microphone access denied:', err);
      }
    } else {
      setIsRecording(false);
    }
  };

  const handleSendMessage = async () => {
    if (message.trim()) {
      try {
        // Get AI chatbot response
        const response = await getChatbotResponse(message);
        
        // Add the new message and response to chat history
        setChatHistory(prev => [...prev, `You: ${message}`, `AI: ${response}`]);

        // Clear the input field
        setMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg shadow-xl mb-4 w-[90vw] sm:w-96 overflow-hidden"
          >
            <div className="bg-primary-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap size={24} />
                <h3 className="font-medium text-lg">AI Tutor</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="hover:bg-primary-500 p-1 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="h-[60vh] p-4 overflow-y-auto bg-gray-50">
              {chatHistory.length > 0 ? (
                <div>
                  {chatHistory.map((msg, index) => (
                    <div key={index} className="py-2">
                      <p>{msg}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 text-sm py-8">
                  How can I help you with your learning today?
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-2">
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
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.txt,.doc,.docx,image/*"
                />
              </div>
              <div className="flex gap-2">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask your question..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  rows={1}
                />
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        onClick={() => setIsOpen(!isOpen)}
        className="chatbot-button w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-700 transition-colors hover:shadow-glow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open AI Tutor"
      >
        <MessageCircle size={24} />
      </motion.button>
    </div>
  );
};

export default ChatbotButton;
