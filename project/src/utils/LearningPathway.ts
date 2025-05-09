import axios from 'axios';

// Replace with your actual Groq API key from environment variables
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Interface for the user input
export interface LearningPathParameters {
  goal: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  timeCommitment: string;
  methods?: string[];
}

// Function to generate a learning path prompt based on user parameters
export const generateLearningPathPrompt = (params: LearningPathParameters): string => {
  const { goal, level, timeCommitment, methods = [] } = params;
  
  // Extract hours per week
  const timeRange = timeCommitment.replace('+', '-15');
  
  let prompt = `Design a concise, structured learning pathway for someone who wants to learn ${goal}.`;
  prompt += ` The learner's current level is ${level} and they can commit ${timeCommitment} hours per week.`;
  
  if (methods.length > 0) {
    prompt += ` They prefer learning through: ${methods.join(', ')}.`;
  }
  
  prompt += `
  Important guidelines:
  1. Limit the plan to a MAXIMUM of 8-10 weeks (do not exceed 10 weeks).
  2. Structure the output clearly with Week 1:, Week 2:, etc. at the start of each week.
  3. For each week, provide 3-5 specific learning tasks, resources, or exercises.
  4. Balance theory with practical applications.
  5. Include specific, actionable items for each week.
  6. Ensure the weekly workload fits within their time commitment (${timeRange} hours per week).
  7. Keep explanations brief and focused.
  
  Format your response following this example structure:
  Week 1:
  - Topic/Concept 1 (brief description, resource)
  - Activity/Exercise
  - Project component
  
  Week 2:
  - Topic/Concept 2 (brief description, resource)
  - Activity/Exercise
  ...and so on
  
  Make sure all resources mentioned are specific and real.`;

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
            content: "You are an expert learning path designer who creates structured, concise, and personalized learning pathways. You focus on creating practical, actionable learning plans limited to 8-10 weeks maximum."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 2500
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