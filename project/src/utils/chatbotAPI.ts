import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY!;
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// FastAPI Configuration
const USE_FASTAPI = true;
const FASTAPI_BASE_URL = 'http://127.0.0.1:8000';
const FASTAPI_TOKEN_ENDPOINT = `${FASTAPI_BASE_URL}/token`;
const FASTAPI_CHAT_ENDPOINT = `${FASTAPI_BASE_URL}/api/tutor/chat`;
const FASTAPI_UPLOAD_ENDPOINT = `${FASTAPI_BASE_URL}/api/documents/upload`;
const FASTAPI_RESOURCES_ENDPOINT = `${FASTAPI_BASE_URL}/api/tutor/resources`;

// Groq API (fallback)
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY!;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// ------------------------------------------------------------------------
// 1) Fetch & cache your FastAPI JWT
// ------------------------------------------------------------------------
const getAxonToken = async (): Promise<string> => {
  // Check if token exists and isn't expired (simple expiration check)
  const cachedToken = localStorage.getItem('axon_token');
  const tokenTimestamp = localStorage.getItem('axon_token_timestamp');
  const tokenExpiry = 55 * 60 * 1000; // 55 minutes in milliseconds (slightly less than backend's 60min)
  
  const isTokenValid = cachedToken && tokenTimestamp && 
                      (Date.now() - parseInt(tokenTimestamp) < tokenExpiry);
  
  if (isTokenValid) {
    console.log('Using cached token');
    return cachedToken;
  }
  
  try {
    console.log('Fetching new token');
    const { data } = await axios.post(FASTAPI_TOKEN_ENDPOINT);
    if (!data.access_token) {
      throw new Error('Invalid token response');
    }
    
    const token = data.access_token;
    
    // Store token with timestamp
    localStorage.setItem('axon_token', token);
    localStorage.setItem('axon_token_timestamp', Date.now().toString());
    
    return token;
  } catch (error) {
    console.error('Failed to get authentication token:', error);
    throw new Error('Authentication failed');
  }
};

// ------------------------------------------------------------------------
// 2) Main entry: prompt → response
// ------------------------------------------------------------------------
export const getChatbotResponse = async (prompt: string, context?: string[]): Promise<string> => {
  if (USE_FASTAPI) {
    try {
      return await getResponseFromFastAPI(prompt, context);
    } catch (err) {
      console.error('FastAPI backend failed, falling back to Groq:', err);
      return getResponseFromGroq(prompt);
    }
  } else {
    return getResponseFromGroq(prompt);
  }
};

// ------------------------------------------------------------------------
// 3) Talk to FastAPI /chat
// ------------------------------------------------------------------------
const getResponseFromFastAPI = async (prompt: string, context?: string[]): Promise<string> => {
  try {
    const token = await getAxonToken();
    const conversationId = localStorage.getItem('conversationId') || '';

    console.log(`Sending request to ${FASTAPI_CHAT_ENDPOINT}`);
    console.log(`ConversationId: ${conversationId || 'new conversation'}`);
    
    const resp = await axios.post(
      FASTAPI_CHAT_ENDPOINT,
      {
        message: prompt,
        conversation_id: conversationId,
        documents: context || [],
        model: 'default',
        mode: 'educational',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        timeout: 30000,
      }
    );

    console.log('Response received with status:', resp.status);
    
    if (resp.data.conversation_id) {
      localStorage.setItem('conversationId', resp.data.conversation_id);
    }

    return resp.data.message || 'No response received';
  } catch (error: any) {
    // Enhanced error handling
    if (error.response) {
      console.error(`Error response: ${error.response.status} - ${error.response.statusText}`);
      console.error('Error data:', error.response.data);
      
      // If token is invalid or expired, try once with a fresh token
      if (error.response.status === 401) {
        try {
          console.log('Token rejected, trying with fresh token');
          // Clear existing token
          localStorage.removeItem('axon_token');
          localStorage.removeItem('axon_token_timestamp');
          
          // Get new token
          const newToken = await getAxonToken();
          const conversationId = localStorage.getItem('conversationId') || '';
          
          // Retry request with new token
          const retryResp = await axios.post(
            FASTAPI_CHAT_ENDPOINT,
            {
              message: prompt,
              conversation_id: conversationId,
              documents: context || [],
              model: 'default',
              mode: 'educational',
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newToken}`,
              },
              timeout: 30000,
            }
          );
          
          if (retryResp.data.conversation_id) {
            localStorage.setItem('conversationId', retryResp.data.conversation_id);
          }
          
          return retryResp.data.message || 'No response received';
        } catch (retryError: any) {
          console.error('Retry with fresh token failed:', retryError.message);
        }
      }
    } else {
      console.error('Error with request:', error.message);
    }
    
    // Rethrow to trigger fallback
    throw error;
  }
};

// ------------------------------------------------------------------------
// 4) Groq fallback (unchanged)
// ------------------------------------------------------------------------
const getResponseFromGroq = async (prompt: string): Promise<string> => {
  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
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
    return 'Sorry, both systems are unavailable right now.';
  }
};

// ------------------------------------------------------------------------
// 5) File upload → FastAPI
// ------------------------------------------------------------------------
export const uploadFileToAI = async (file: File): Promise<string> => {
  if (!USE_FASTAPI) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`I've received your file "${file.name}" and will analyze it. What would you like to know?`);
      }, 1500);
    });
  }

  try {
    const token = await getAxonToken();
    const formData = new FormData();
    formData.append('file', file);

    const conversationId = localStorage.getItem('conversationId');
    if (conversationId) {
      formData.append('conversation_id', conversationId);
    }

    console.log(`Uploading file ${file.name} to ${FASTAPI_UPLOAD_ENDPOINT}`);
    
    const resp = await axios.post(FASTAPI_UPLOAD_ENDPOINT, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
      },
      timeout: 60000,
    });

    console.log('File upload response:', resp.status);
    return resp.data.message || 'File uploaded successfully.';
  } catch (error: any) {
    console.error('Error uploading file to AI system:', error.message);
    
    // If token is invalid or expired, try once with a fresh token
    if (error.response && error.response.status === 401) {
      try {
        // Clear existing token
        localStorage.removeItem('axon_token');
        localStorage.removeItem('axon_token_timestamp');
        
        // Get new token
        const newToken = await getAxonToken();
        
        // Prepare form data again
        const formData = new FormData();
        formData.append('file', file);
        
        const conversationId = localStorage.getItem('conversationId');
        if (conversationId) {
          formData.append('conversation_id', conversationId);
        }
        
        // Retry upload with new token
        const retryResp = await axios.post(FASTAPI_UPLOAD_ENDPOINT, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${newToken}`,
          },
          timeout: 60000,
        });
        
        return retryResp.data.message || 'File uploaded successfully.';
      } catch (retryError: any) {
        console.error('Retry file upload failed:', retryError.message);
      }
    }
    
    return `I received your file "${file.name}" but encountered an error during processing.`;
  }
};

// ------------------------------------------------------------------------
// 6) Learning resources → FastAPI
// ------------------------------------------------------------------------
export const getAILearningResources = async (topic: string): Promise<any[]> => {
  if (!USE_FASTAPI) {
    return [{
      title: 'Sample Resource',
      description: 'This is a placeholder. Connect to FastAPI for real resources.',
      type: 'article',
    }];
  }

  try {
    const token = await getAxonToken();
    const resp = await axios.get(FASTAPI_RESOURCES_ENDPOINT, {
      params: { topic },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return resp.data.resources || [];
  } catch (error: any) {
    // If token is invalid or expired, try once with a fresh token
    if (error.response && error.response.status === 401) {
      try {
        // Clear existing token
        localStorage.removeItem('axon_token');
        localStorage.removeItem('axon_token_timestamp');
        
        // Get new token
        const newToken = await getAxonToken();
        
        // Retry request with new token
        const retryResp = await axios.get(FASTAPI_RESOURCES_ENDPOINT, {
          params: { topic },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`,
          },
        });
        
        return retryResp.data.resources || [];
      } catch (retryError) {
        console.error('Retry getting resources failed:', retryError);
      }
    }
    
    console.error('Error getting learning resources:', error.message);
    return [{
      title: 'Sample Resource',
      description: 'Resources temporarily unavailable.',
      type: 'article',
    }];
  }
};

// ------------------------------------------------------------------------
// 7) Health & Auth checks (Supabase‑based)
// ------------------------------------------------------------------------
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    console.log(`Checking backend health at ${FASTAPI_BASE_URL}/health`);
    const resp = await axios.get(`${FASTAPI_BASE_URL}/health`, { timeout: 5000 });
    return resp.data.status === 'healthy';
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

// ------------------------------------------------------------------------
// 8) Run health check on load
// ------------------------------------------------------------------------
(async () => {
  try {
    const healthy = await checkBackendHealth();
    console.log(`FastAPI backend is ${healthy ? 'healthy' : 'unavailable'}`);
  } catch (error) {
    console.error('Error during initial health check:', error);
  }
})();