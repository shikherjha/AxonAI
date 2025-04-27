import axios from 'axios';

// Replace with your actual Groq API key from environment variables
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Interface for the test parameters
export interface TestParameters {
  subjectArea: string;
  topics: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  questionType: 'mixed' | 'mcq' | 'written' | 'practical';
}

// Function to generate a test prompt based on user parameters
export const generateTestPrompt = (params: TestParameters): string => {
  const { subjectArea, topics, difficultyLevel, questionType } = params;
  
  // Map questionType values to more descriptive labels
  const questionTypeMap = {
    'mixed': 'a mix of multiple choice, written response, and practical problems',
    'mcq': 'multiple choice questions',
    'written': 'written response questions',
    'practical': 'practical problems requiring application of knowledge'
  };
  
  let prompt = `Generate a ${difficultyLevel} level test for the subject area: ${subjectArea}.`;
  
  if (topics && topics.trim() !== '') {
    prompt += ` Focus on the following topics: ${topics}.`;
  }
  
  prompt += ` Include ${questionTypeMap[questionType]}.`;
  
  prompt += `
  
Please format the test as follows:
1. Start with a title and brief description of the test
2. For each question:
   - Clearly number and state the question
   - For multiple choice questions, list options labeled A, B, C, D
   - For written response questions, specify expected length or format
   - For practical problems, provide necessary context and clear instructions

Please generate 10 questions total. For each question, also provide the correct answer in a separate "Answer Key" section at the end.`;

  return prompt;
};

// Function to call the Groq API with the generated prompt, specifically using LLaMA model
export const generateTest = async (params: TestParameters): Promise<string> => {
  try {
    const prompt = generateTestPrompt(params);
    
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: "llama3-70b-8192", // Specifically using LLaMA model via Groq
        messages: [
          {
            role: "system",
            content: "You are an expert test creator that generates high-quality educational assessments."
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
    console.error('Error generating test:', error);
    throw new Error('Failed to generate test. Please try again later.');
  }
};