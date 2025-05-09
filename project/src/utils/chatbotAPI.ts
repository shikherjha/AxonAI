import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Configuration
const USE_FASTAPI = true; // Set to true to use FastAPI backend
const FASTAPI_BASE_URL = 'http://127.0.0.1:8000'; // Your FastAPI server address
const FASTAPI_CHAT_ENDPOINT = `${FASTAPI_BASE_URL}/api/tutor/chat`; // Correct endpoint path
const FASTAPI_UPLOAD_ENDPOINT = `${FASTAPI_BASE_URL}/api/documents/upload`; // Document upload endpoint
const FASTAPI_RESOURCES_ENDPOINT = `${FASTAPI_BASE_URL}/api/tutor/resources`; // Resources endpoint if available

// Groq API configuration (fallback)
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Get the current user's session token
const getSupabaseToken = async (): Promise<string | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      console.error('Error getting Supabase session:', error);
      return null;
    }
    
    return session.access_token;
  } catch (error) {
    console.error('Error getting Supabase token:', error);
    return null;
  }
};

// Function to send a prompt and get a response
export const getChatbotResponse = async (prompt: string, context?: string[]): Promise<string> => {
  // Try FastAPI first if enabled
  if (USE_FASTAPI) {
    try {
      const response = await getResponseFromFastAPI(prompt, context);
      return response;
    } catch (error) {
      console.error('FastAPI backend failed, falling back to Groq:', error);
      // Fall back to Groq on error
      return getResponseFromGroq(prompt);
    }
  } else {
    // Use Groq directly if FastAPI is disabled
    return getResponseFromGroq(prompt);
  }
};

// Function to get response from your FastAPI backend
const getResponseFromFastAPI = async (prompt: string, context?: string[]): Promise<string> => {
  try {
    // Get Supabase authentication token
    const token = await getSupabaseToken();
    
    if (!token) {
      throw new Error('Failed to get Supabase authentication token');
    }
    
    const conversationId = localStorage.getItem('conversationId') || '';
    
    const response = await axios.post(
      FASTAPI_CHAT_ENDPOINT,
      {
        message: prompt,
        conversation_id: conversationId,
        documents: [], // Add document references if needed
        model: "default", // Use default model
        mode: "educational" // Educational mode
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        timeout: 30000, // 30 second timeout
      }
    );

    // Store conversation ID for future messages
    if (response.data.conversation_id) {
      localStorage.setItem('conversationId', response.data.conversation_id);
    }

    // Return the response text
    return response.data.response || response.data.message || 'No response received';
  } catch (error: any) {
    console.error('Error getting response from FastAPI:', error);
    
    // Check if it's an authentication error
    if (error.response && error.response.status === 401) {
      // Maybe refresh the token or redirect to login
      // For now, just throw the error to trigger fallback
    }
    
    // Throw the error to trigger fallback
    throw error;
  }
};

// Function to get response from Groq (fallback)
const getResponseFromGroq = async (prompt: string): Promise<string> => {
  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error getting response from Groq:', error);
    return 'Sorry, I am having trouble understanding that right now. Both primary and fallback systems are unavailable.';
  }
};

// Upload file to the AI system (for document analysis)
export const uploadFileToAI = async (file: File): Promise<string> => {
  if (!USE_FASTAPI) {
    // If FastAPI is disabled, simulate a file upload response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`I've received your file "${file.name}" and will analyze it. What would you like to know about it?`);
      }, 1500);
    });
  }
  
  try {
    // Get Supabase authentication token
    const token = await getSupabaseToken();
    
    if (!token) {
      throw new Error('Failed to get Supabase authentication token');
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Add conversation ID if available for context
    const conversationId = localStorage.getItem('conversationId');
    if (conversationId) {
      formData.append('conversation_id', conversationId);
    }
    
    const response = await axios.post(
      FASTAPI_UPLOAD_ENDPOINT,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
        timeout: 60000, // 60 second timeout for larger files
      }
    );
    
    return response.data.message || "File uploaded successfully.";
  } catch (error: any) {
    console.error('Error uploading file to AI system:', error);
    
    // Fall back to simulated response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`I've received your file "${file.name}" and will analyze it, but processing might be limited. What would you like to know about it?`);
      }, 1500);
    });
  }
};

// Function to get AI-generated learning resources
export const getAILearningResources = async (topic: string): Promise<any[]> => {
  if (!USE_FASTAPI) {
    return [{ 
      title: "Sample Resource",
      description: "This is a placeholder. Connect to FastAPI for real resources.",
      type: "article"
    }];
  }
  
  try {
    // Get Supabase authentication token
    const token = await getSupabaseToken();
    
    if (!token) {
      throw new Error('Failed to get Supabase authentication token');
    }
    
    const response = await axios.get(
      FASTAPI_RESOURCES_ENDPOINT,
      {
        params: { topic },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    
    return response.data.resources || [];
  } catch (error: any) {
    console.error('Error getting learning resources:', error);
    
    // Return fallback resources
    return [{ 
      title: "Sample Resource",
      description: "This is a placeholder. Connect to FastAPI for real resources.",
      type: "article"
    }];
  }
};

// Function to check FastAPI backend health
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(
      `${FASTAPI_BASE_URL}/health`,
      { timeout: 5000 } // 5 second timeout
    );
    
    return response.data.status === 'healthy';
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

// Function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

// Initialize backend check on load
(async () => {
  try {
    const isHealthy = await checkBackendHealth();
    console.log(`FastAPI backend is ${isHealthy ? 'healthy' : 'unavailable'}`);
    // You can automatically set USE_FASTAPI based on health check if desired
  } catch (error) {
    console.error('Error during initial health check:', error);
  }
})();