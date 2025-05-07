import axios from 'axios';

// Configuration
const USE_FASTAPI = false; // Set to true when your FastAPI backend is ready
const FASTAPI_ENDPOINT = 'http://localhost:8000/api/chat'; // Update with your actual endpoint

// Groq API configuration (fallback)
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Function to send a prompt and get a response
export const getChatbotResponse = async (prompt: string, context?: string[]): Promise<string> => {
  if (USE_FASTAPI) {
    return getResponseFromFastAPI(prompt, context);
  } else {
    return getResponseFromGroq(prompt);
  }
};

// Function to get response from your FastAPI backend
const getResponseFromFastAPI = async (prompt: string, context?: string[]): Promise<string> => {
  try {
    const response = await axios.post(
      FASTAPI_ENDPOINT,
      {
        message: prompt,
        context: context || [], // Previous messages for context
        user_id: localStorage.getItem('userId') || 'anonymous', // Get user ID if available
      },
      {
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers if needed
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    // Return the response from your agentic AI system
    return response.data.response;
  } catch (error) {
    console.error('Error getting response from FastAPI:', error);
    return 'Sorry, I am having trouble connecting to the AI system right now.';
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
    return 'Sorry, I am having trouble understanding that right now.';
  }
};

// Upload file to the AI system (for document analysis)
export const uploadFileToAI = async (file: File): Promise<string> => {
  if (!USE_FASTAPI) {
    // Since FastAPI is not enabled, we'll simulate a file upload response
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        resolve(`I've received your file "${file.name}" and will analyze it. What would you like to know about it?`);
      }, 1500);
    });
  }
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(
      `${FASTAPI_ENDPOINT.replace('/chat', '/upload')}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          // Add authentication headers if needed
        },
      }
    );
    
    return response.data.message || "File uploaded successfully.";
  } catch (error) {
    console.error('Error uploading file to AI system:', error);
    return 'Sorry, I had trouble processing your file.';
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
    const response = await axios.get(
      `${FASTAPI_ENDPOINT.replace('/chat', '/resources')}`,
      {
        params: { topic },
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers if needed
        },
      }
    );
    
    return response.data.resources || [];
  } catch (error) {
    console.error('Error getting learning resources:', error);
    return [];
  }
};