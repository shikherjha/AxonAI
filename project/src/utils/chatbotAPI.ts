import axios from 'axios';

// Replace with your actual Groq API key
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'; // Correct API URL for chat completions

// Function to send a prompt to the LLaMA3 model and get a response
export const getChatbotResponse = async (prompt: string): Promise<string> => {
  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: "llama-3.3-70b-versatile",  // Specify the model you want to use
        messages: [
          {
            role: "user", // The user is sending the prompt
            content: prompt, // User input as the content
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`, // API key for authorization
          'Content-Type': 'application/json', // Content-Type header for JSON requests
        },
      }
    );

    // Extract the assistant's response from the API response
    return response.data.choices[0].message.content.trim(); // Groq's response format
  } catch (error) {
    console.error('Error getting response from Groq:', error);
    return 'Sorry, I am having trouble understanding that right now.';
  }
};
