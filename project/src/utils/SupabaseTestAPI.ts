import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Replace with your Supabase URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ✅ Initialize Supabase client
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Test interface definitions
export interface TestQuestion {
  id: number;
  text: string;
  options: {
    id: string;
    text: string;
  }[];
  correctAnswer: string;
  explanation?: string;
}

export interface Test {
  id?: string;
  title: string;
  description: string;
  questions: TestQuestion[];
  created_at?: string;
  user_id?: string;
  subject_area: string;
  difficulty_level: string;
  topics?: string;
  raw_content?: string;
}

// (rest of your code remains unchanged)

// Create a single supabase client instance for the app
// Improved parser for test content
export const parseTestContent = (rawContent: string): Partial<Test> => {
    try {
      console.log("Parsing test content:", rawContent.substring(0, 100)); // Debug log
      
      // First, try to extract the title from the first line
      const lines = rawContent.split('\n');
      const title = lines[0].replace(/\*\*/g, '').trim();
      
      // Extract description (everything until the first question)
      let descriptionLines = [];
      let i = 1;
      while (i < lines.length && !lines[i].toLowerCase().includes('question')) {
        if (lines[i].trim() && !lines[i].includes('**')) {
          descriptionLines.push(lines[i].trim());
        }
        i++;
      }
      const description = descriptionLines.join(' ').trim();
      
      // Process answer key first to get correct answers
      const answerKeyIndex = lines.findIndex(line => 
        line.toLowerCase().includes('answer key') || 
        line.toLowerCase().includes('answers:')
      );
      
      // Create answer map
      const answerMap: Record<number, string> = {};
      if (answerKeyIndex !== -1) {
        for (let i = answerKeyIndex + 1; i < lines.length; i++) {
          const answerLine = lines[i].trim();
          // Try different formats: "1. A" or "1: A" or "Question 1: A"
          const answerMatch = answerLine.match(/(?:Question\s*)?(\d+)(?:\.|\:)?\s*([A-D])/i);
          if (answerMatch) {
            answerMap[parseInt(answerMatch[1])] = answerMatch[2];
          }
        }
      }
      
      // Extract questions using a more robust approach
      const questions: TestQuestion[] = [];
      let currentQuestion: Partial<TestQuestion> | null = null;
      
      for (let lineIndex = 0; lineIndex < (answerKeyIndex !== -1 ? answerKeyIndex : lines.length); lineIndex++) {
        const line = lines[lineIndex].trim();
        if (!line) continue;
        
        // Check for new question
        const questionMatch = line.match(/\*\*Question\s+(\d+)\*\*/) || 
                             line.match(/^(\d+)\.\s+/);
        
        if (questionMatch) {
          // Save previous question if it exists
          if (currentQuestion && currentQuestion.id && currentQuestion.options && currentQuestion.options.length > 0) {
            questions.push(currentQuestion as TestQuestion);
          }
          
          // Start new question
          const questionId = parseInt(questionMatch[1]);
          currentQuestion = {
            id: questionId,
            text: "",
            options: [],
            correctAnswer: answerMap[questionId] || ''
          };
          
          // Get question text - it might be on the same line or the next line
          if (line.includes(questionMatch[0]) && line.length > questionMatch[0].length) {
            // Question text is on the same line
            currentQuestion.text = line.substring(line.indexOf(questionMatch[0]) + questionMatch[0].length).trim();
          } else {
            // Look for question text on the next line
            let nextIndex = lineIndex + 1;
            while (nextIndex < lines.length && 
                  !lines[nextIndex].match(/^[A-D]\)/) && 
                  !lines[nextIndex].match(/^[A-D]\./) &&
                  !lines[nextIndex].includes('**Question')) {
              const nextLine = lines[nextIndex].trim();
              if (nextLine && !nextLine.startsWith('**')) {
                currentQuestion.text += (currentQuestion.text ? ' ' : '') + nextLine;
              }
              nextIndex++;
            }
            lineIndex = nextIndex - 1; // Adjust line index to continue from option lines
          }
          continue;
        }
        
        // Check for options
        const optionMatch = line.match(/^([A-D])[\.\)]?\s+(.+?)(\*\*)?$/);
        if (optionMatch && currentQuestion) {
          const optionId = optionMatch[1].toUpperCase();
          const optionText = optionMatch[2].trim();
          
          // Add option to current question
          if (!currentQuestion.options) {
            currentQuestion.options = [];
          }
          
          // Check if we already have this option (avoid duplicates)
          const existingOption = currentQuestion.options.find(opt => opt.id === optionId);
          if (!existingOption) {
            currentQuestion.options.push({
              id: optionId,
              text: optionText
            });
          }
        }
      }
      
      // Add the last question if it exists
      if (currentQuestion && currentQuestion.id && currentQuestion.options && currentQuestion.options.length > 0) {
        questions.push(currentQuestion as TestQuestion);
      }
      
      // Validate questions and fill in missing answers
      questions.forEach((question) => {
        // Ensure each question has all options A, B, C, D or at least 2 options
        const optionIds = question.options.map(opt => opt.id);
        
        // If correct answer not specified, use first option as default
        if (!question.correctAnswer && question.options.length > 0) {
          question.correctAnswer = question.options[0].id;
        }
        
        // Ensure correct answer is among the options
        if (!optionIds.includes(question.correctAnswer) && question.options.length > 0) {
          question.correctAnswer = question.options[0].id;
        }
      });
      
      // If no questions were found, throw an error
      if (questions.length === 0) {
        console.error("All parsing approaches failed. Raw content:", rawContent);
        throw new Error("Failed to parse any questions from the test content");
      }
      
      return {
        title: title || 'Generated Test',
        description: description || 'Test your knowledge with these questions.',
        questions: questions,
        raw_content: rawContent
      };
    } catch (error) {
      console.error('Error parsing test content:', error);
      throw error;
    }
  };

// Save a test to Supabase
export const saveTest = async (test: Partial<Test>): Promise<string> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Insert test into database
    const { data, error } = await supabase
      .from('tests')
      .insert({
        ...test,
        user_id: user.id,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();
    
    if (error) throw error;
    
    return data.id;
  } catch (error) {
    console.error('Error saving test:', error);
    throw error;
  }
};

// Get a test by ID
export const getTestById = async (testId: string): Promise<Test> => {
  try {
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .eq('id', testId)
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Test not found');
    
    return data;
  } catch (error) {
    console.error('Error fetching test:', error);
    throw error;
  }
};

// Get all tests for the current user
export const getUserTests = async (): Promise<Test[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching user tests:', error);
    throw error;
  }
};

// Save test results
export interface TestResult {
  test_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  time_taken: number; // in seconds
  answers: Record<number, string>; // question_id -> selected_answer
  weak_topics?: string[];
  created_at?: string;
}

export const saveTestResult = async (result: Partial<TestResult>): Promise<string> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('test_results')
      .insert({
        ...result,
        user_id: user.id,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();
    
    if (error) throw error;
    
    return data.id;
  } catch (error) {
    console.error('Error saving test result:', error);
    throw error;
  }
};