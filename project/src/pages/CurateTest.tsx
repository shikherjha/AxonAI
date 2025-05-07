import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Target, Clock, Brain, Loader, ChevronRight, BookMarked } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateTest, TestParameters } from '../utils/CurateTestAPI';
import { parseTestContent, saveTest, getUserTests, Test } from '../utils/SupabaseTestAPI';

const CurateTest: React.FC = () => {
  const navigate = useNavigate();
  
  // State for form inputs
  const [subjectArea, setSubjectArea] = useState('');
  const [topics, setTopics] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  
  // State for test generation
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testGenerated, setTestGenerated] = useState(false);
  const [currentTestId, setCurrentTestId] = useState<string | null>(null);
  
  // State for previous tests
  const [previousTests, setPreviousTests] = useState<Test[]>([]);
  const [isLoadingPreviousTests, setIsLoadingPreviousTests] = useState(true);

  // Load previous tests on component mount
  useEffect(() => {
    const loadPreviousTests = async () => {
      try {
        const tests = await getUserTests();
        setPreviousTests(tests);
      } catch (error) {
        console.error('Error loading previous tests:', error);
      } finally {
        setIsLoadingPreviousTests(false);
      }
    };
    
    loadPreviousTests();
  }, []);

  // Handle form submission
  const handleGenerateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!subjectArea.trim()) {
      setError('Please enter a subject area');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare parameters for API call
      const params: TestParameters = {
        subjectArea,
        topics,
        difficultyLevel,
        questionType: 'mcq' // Fixed to MCQ type
      };
      
      // Call API to generate test
      const rawTestContent = await generateTest(params);
      
      // Parse the test content
      const parsedTest = parseTestContent(rawTestContent);
      
      // Add metadata
      const testToSave = {
        ...parsedTest,
        subject_area: subjectArea,
        topics: topics,
        difficulty_level: difficultyLevel,
        raw_content: rawTestContent
      };
      
      // Save test to Supabase
      const testId = await saveTest(testToSave);
      setCurrentTestId(testId);
      
      // Update previous tests list
      setPreviousTests(prev => [{
        ...testToSave,
        id: testId,
        created_at: new Date().toISOString()
      } as Test, ...prev]);
      
      // Set test as generated
      setTestGenerated(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Start the test
  const handleStartTest = () => {
    if (currentTestId) {
      navigate(`/take-test/${currentTestId}`);
    }
  };
  
  // Take a previous test
  const handleTakePreviousTest = (testId: string) => {
    navigate(`/take-test/${testId}`);
  };

  return (
    <div className="min-h-screen pt-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-6 mb-8"
          >
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-900">Create Your Test</h1>
              <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                <span className="mr-1">✨</span>
                Powered by LLaMA
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Specify your requirements and let AI generate a personalized multiple-choice test that matches your learning objectives.
            </p>

            {testGenerated ? (
              <div>
                <div className="flex items-center justify-center p-8 bg-green-50 rounded-lg border border-green-200 mb-6">
                  <div className="text-center">
                    <div className="text-green-600 text-4xl mb-2">✓</div>
                    <h3 className="text-xl font-semibold mb-2">Test Generated Successfully!</h3>
                    <p className="text-gray-600 mb-4">Your {difficultyLevel} level test on {subjectArea} is ready to take.</p>
                    <button
                      onClick={handleStartTest}
                      className="flex items-center justify-center w-full py-3 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 transition-all hover:shadow-lg"
                    >
                      <span>Start Test Now</span>
                      <ChevronRight size={20} className="ml-1" />
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={() => setTestGenerated(false)}
                  className="text-primary-600 hover:text-primary-700 font-medium text-center w-full"
                >
                  Create Another Test
                </button>
              </div>
            ) : (
              <form onSubmit={handleGenerateTest} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject Area</label>
                  <input
                    type="text"
                    placeholder="e.g., Physics, Mathematics, History"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={subjectArea}
                    onChange={(e) => setSubjectArea(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Topics</label>
                  <textarea
                    placeholder="Enter specific topics to cover"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={topics}
                    onChange={(e) => setTopics(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                  <select 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={difficultyLevel}
                    onChange={(e) => setDifficultyLevel(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 transition-all hover:shadow-lg flex items-center justify-center gap-2 disabled:bg-primary-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader size={20} className="animate-spin" />
                      Generating Test with LLaMA...
                    </>
                  ) : (
                    <>
                      <Brain size={20} />
                      Generate Multiple Choice Test
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>

          {/* Previous Tests Section */}
          {previousTests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-lg p-6 mb-8"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <BookMarked size={20} className="mr-2 text-primary-600" />
                Your Previous Tests
              </h2>
              
              <div className="space-y-4">
                {previousTests.map((test) => (
                  <div 
                    key={test.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-200 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{test.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {test.subject_area} • {test.difficulty_level} • {test.questions.length} questions
                        </p>
                        <p className="text-xs text-gray-500">
                          Created: {new Date(test.created_at!).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleTakePreviousTest(test.id!)}
                        className="px-3 py-1 bg-primary-50 text-primary-700 rounded-md text-sm hover:bg-primary-100 transition-all"
                      >
                        Take Test
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Benefits section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <BookOpen className="w-8 h-8 text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Comprehensive Coverage</h3>
              <p className="text-gray-600">AI ensures thorough topic coverage aligned with learning objectives.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <Target className="w-8 h-8 text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Targeted Learning</h3>
              <p className="text-gray-600">Questions adapted to your specific knowledge level and goals.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <Clock className="w-8 h-8 text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Instant Feedback</h3>
              <p className="text-gray-600">Take interactive tests and receive immediate performance insights.</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurateTest;