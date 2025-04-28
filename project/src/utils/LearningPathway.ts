import axios from 'axios';

// Replace with your actual Groq API key from environment variables
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Interface for the user input
export interface LearningPathParameters {
  goal: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  timeCommitment: string;
}

// Function to generate a learning path prompt based on user parameters
export const generateLearningPathPrompt = (params: LearningPathParameters): string => {
  const { goal, level, timeCommitment } = params;
  
  let prompt = `Design a personalized learning pathway for someone who wants to learn ${goal}.`;
  prompt += ` The learner's current level is ${level} and they can commit ${timeCommitment} per week.`;
  
  prompt += `
  Break the learning path into weekly goals and topics.
  Provide a structured plan with specific topics, resources (e.g., books, videos, articles), and practical exercises.
  Focus on a balanced learning experience tailored to the level of the learner.
  Include estimated time for each topic, and give a suggested pace for completion.

  Please generate a plan for 6 weeks.`;

  return prompt;
};

// Function to call the Groq API with the generated prompt, specifically using LLaMA model
export const generateLearningPath = async (params: LearningPathParameters): Promise<string> => {
  try {
    const prompt = generateLearningPathPrompt(params);
    
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: "llama3-70b-8192", // Specifically using LLaMA model via Groq
        messages: [
          {
            role: "system",
            content: "You are an expert learning path designer who creates personalized learning pathways."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 4000
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract the assistant's response from the API response
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating learning path:', error);
    throw new Error('Failed to generate learning path. Please try again later.');
  }
};
