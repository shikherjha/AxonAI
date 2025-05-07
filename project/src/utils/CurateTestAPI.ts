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
  const { subjectArea, topics, difficultyLevel } = params;

  let prompt = `You are an expert educator. Create a test with 10 multiple choice questions on the subject: "${subjectArea}".\n`;

  prompt += `The questions should be at a ${difficultyLevel} level.`;

  if (topics && topics.trim() !== '') {
    prompt += ` Focus specifically on the following topics: ${topics}.`;
  }

  prompt += `

Formatting Guidelines:
- Provide a title and a brief 2-3 sentence description of the test.
- Number each question (1 to 10).
- Each question must include 4 options labeled A, B, C, and D.
- Only one correct answer per question.
- Ensure a mix of conceptual understanding, factual recall, and application-based questions.
- Avoid repeating the same structure or phrasing across questions.

At the end, include an "Answer Key" section listing the correct option for each question like:
Answer Key:
1. B
2. A
...

Generate only the test and answer key, no explanations.`;

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