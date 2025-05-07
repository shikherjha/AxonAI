import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, CheckCircle, AlertCircle, BarChart, Loader, Home, Clock } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTestById, saveTestResult, TestQuestion, Test } from '../utils/SupabaseTestAPI';

// Component for the test-taking experience
const TakeTest: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  
  // State for test data
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for user progress
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [testCompleted, setTestCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(45 * 60); // 45 minutes in seconds
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  
  // State for results
  const [testResults, setTestResults] = useState<{
    score: number;
    total: number;
    weakAreas: string[];
    correctAnswers: number[];
    incorrectAnswers: number[];
  } | null>(null);
  
  // Load test data
  useEffect(() => {
    const fetchTestData = async () => {
      if (!testId) {
        setError('No test ID provided');
        setLoading(false);
        return;
      }
      
      try {
        // Fetch test from Supabase
        const fetchedTest = await getTestById(testId);
        
        if (!fetchedTest || !fetchedTest.questions || fetchedTest.questions.length === 0) {
          throw new Error('Invalid test data');
        }
        
        setTest(fetchedTest);
        setStartTime(new Date()); // Record when the test starts
      } catch (err) {
        console.error('Error loading test:', err);
        setError('Failed to load test. Please try generating a new one.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTestData();
    
    // Setup timer
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!testCompleted) {
            finishTest();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [testId]);
  
  // Handle selecting an answer
  const selectAnswer = (optionId: string) => {
    if (test?.questions[currentQuestionIndex]) {
      setUserAnswers(prev => ({
        ...prev,
        [test.questions[currentQuestionIndex].id]: optionId
      }));
    }
  };
  
  // Navigate to next/previous question
  const goToNextQuestion = () => {
    if (test && currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  // Calculate test results
  const calculateResults = () => {
    if (!test) return { score: 0, total: 0, weakAreas: [], correctAnswers: [], incorrectAnswers: [] };
    
    let correctCount = 0;
    const incorrectQuestions: TestQuestion[] = [];
    const correctAnswers: number[] = [];
    const incorrectAnswers: number[] = [];
    
    test.questions.forEach(question => {
      const userAnswer = userAnswers[question.id];
      if (userAnswer === question.correctAnswer) {
        correctCount++;
        correctAnswers.push(question.id);
      } else {
        incorrectQuestions.push(question);
        incorrectAnswers.push(question.id);
      }
    });
    
    // Topic-based analysis
    // This approach extracts potential topics from question text
    const topicKeywords: Record<string, string[]> = {
      'equations': ['equation', 'solve', 'value', 'solve for'],
      'expressions': ['expression', 'simplify', 'equivalent', 'terms'],
      'functions': ['function', 'domain', 'range', 'graph', 'f(x)'],
      'geometry': ['angle', 'triangle', 'circle', 'polygon', 'area', 'volume'],
      'algebra': ['variable', 'coefficient', 'factor', 'factorize', 'polynomial'],
      'calculus': ['derivative', 'integral', 'limit', 'differentiate', 'integrate'],
      'statistics': ['probability', 'mean', 'median', 'standard deviation', 'normal distribution'],
      'logic': ['logic', 'truth', 'proposition', 'logical', 'argument']
    };
    
    // Identify weak areas
    const topicMisses: Record<string, number> = {};
    
    // Check if test has explicit topics
    let testTopics: string[] = [];
    if (test.topics) {
      testTopics = test.topics.split(',').map(t => t.trim().toLowerCase());
    }
    
    // Analyze incorrect questions
    incorrectQuestions.forEach(question => {
      const questionText = question.text.toLowerCase();
      
      // First check against explicit test topics if available
      if (testTopics.length > 0) {
        testTopics.forEach(topic => {
          if (topicMisses[topic]) {
            topicMisses[topic]++;
          } else {
            topicMisses[topic] = 1;
          }
        });
      } else {
        // Fall back to keyword analysis
        Object.entries(topicKeywords).forEach(([topic, keywords]) => {
          if (keywords.some(keyword => questionText.includes(keyword.toLowerCase()))) {
            if (topicMisses[topic]) {
              topicMisses[topic]++;
            } else {
              topicMisses[topic] = 1;
            }
          }
        });
      }
    });
    
    // Get topics with the most misses
    const weakAreas = Object.entries(topicMisses)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic]) => topic);
    
    return { 
      score: correctCount, 
      total: test.questions.length, 
      weakAreas,
      correctAnswers,
      incorrectAnswers
    };
  };
  
  // Finish the test and save results
  const finishTest = async () => {
    if (testCompleted || !test || !startTime) return;
    
    try {
      setTestCompleted(true);
      
      // Calculate results
      const results = calculateResults();
      setTestResults(results);
      setWeakTopics(results.weakAreas);
      
      // Calculate time taken
      const timeTaken = Math.round((new Date().getTime() - startTime.getTime()) / 1000);
      
      // Save results to Supabase
      await saveTestResult({
        test_id: testId!,
        score: results.score,
        total_questions: results.total,
        time_taken: timeTaken,
        answers: userAnswers,
        weak_topics: results.weakAreas
      });
      
    } catch (error) {
      console.error('Error finishing test:', error);
      setError('Failed to save test results. Your progress has been recorded locally.');
    }
  };
  
  // Format time remaining (MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Return to home or create new test
  const handleGoHome = () => {
    navigate('/');
  };
  
  const handleCreateNewTest = () => {
    navigate('/curate-test');
  };
  
  // Handle retry test
  const handleRetryTest = () => {
    // Reset state
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setTestCompleted(false);
    setTimeRemaining(45 * 60);
    setWeakTopics([]);
    setTestResults(null);
    setStartTime(new Date());
  };
  
  // Calculate progress percentage
  const calculateProgress = (): number => {
    if (!test) return 0;
    const answeredCount = Object.keys(userAnswers).length;
    return Math.round((answeredCount / test.questions.length) * 100);
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader size={40} className="animate-spin mx-auto mb-4 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-700">Loading Test...</h2>
          <p className="text-gray-500">Please wait while we prepare your questions.</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
          <AlertCircle size={40} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Test</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleGoHome}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-all"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }
  
  // Test not found
  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
          <AlertCircle size={40} className="mx-auto mb-4 text-amber-500" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Test Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find the test you're looking for.</p>
          <button
            onClick={handleCreateNewTest}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-all"
          >
            Create a New Test
          </button>
        </div>
      </div>
    );
  }
  
  // Results view
  if (testCompleted && testResults) {
    return (
      <div className="min-h-screen pt-16 pb-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden"
          >
            {/* Results header */}
            <div className="bg-primary-600 p-6 text-white">
              <h1 className="text-2xl font-bold mb-2">Test Results</h1>
              <p>{test.title}</p>
            </div>
            
            {/* Score summary */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Your Score</h2>
                  <p className="text-gray-600">{test.subject_area} • {test.difficulty_level}</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600">
                    {testResults.score}/{testResults.total}
                  </div>
                  <p className="text-gray-600">{Math.round((testResults.score / testResults.total) * 100)}%</p>
                </div>
              </div>
            </div>
            
            {/* Areas for improvement */}
            <div className="p-6 border-b">
              <h3 className="font-semibold mb-3 flex items-center">
                <BarChart size={18} className="mr-2 text-amber-500" />
                Areas for Improvement
              </h3>
              
              {weakTopics.length > 0 ? (
                <div className="space-y-2">
                  {weakTopics.map((topic, index) => (
                    <div key={index} className="px-3 py-2 bg-amber-50 border border-amber-100 rounded-md">
                      <span className="capitalize">{topic}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Great job! No specific weak areas detected.</p>
              )}
            </div>
            
            {/* Question breakdown */}
            <div className="p-6">
              <h3 className="font-semibold mb-3">Question Breakdown</h3>
              
              <div className="space-y-3 mb-6">
                {test.questions.map((question, index) => {
                  const userAnswer = userAnswers[question.id] || '';
                  const isCorrect = userAnswer === question.correctAnswer;
                  
                  return (
                    <div 
                      key={question.id}
                      className={`p-3 rounded-md ${
                        isCorrect ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="mr-2 mt-1">
                          {isCorrect ? (
                            <CheckCircle size={16} className="text-green-600" />
                          ) : (
                            <AlertCircle size={16} className="text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">Question {index + 1}</p>
                          <p className="text-sm text-gray-700 mt-1">{question.text}</p>
                          
                          {!isCorrect && (
                            <div className="mt-2 text-sm">
                              <p className="text-red-700">
                                Your answer: {userAnswer || 'Not answered'} - {
                                  question.options.find(o => o.id === userAnswer)?.text || 'N/A'
                                }
                              </p>
                              <p className="text-green-700 mt-1">
                                Correct answer: {question.correctAnswer} - {
                                  question.options.find(o => o.id === question.correctAnswer)?.text || 'N/A'
                                }
                              </p>
                              {question.explanation && (
                                <p className="mt-2 p-2 bg-blue-50 rounded">
                                  <span className="font-medium">Explanation:</span> {question.explanation}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleRetryTest}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-all flex items-center justify-center"
                >
                  <ChevronLeft size={18} className="mr-1" />
                  Retry Test
                </button>
                <button
                  onClick={handleCreateNewTest}
                  className="flex-1 px-4 py-2 bg-white border border-primary-600 text-primary-700 rounded-md hover:bg-primary-50 transition-all flex items-center justify-center"
                >
                  Create New Test
                  <ChevronRight size={18} className="ml-1" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }
  
  // Test taking view
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with timer and progress */}
      <header className="bg-white border-b border-gray-200 fixed w-full top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={handleGoHome}
                className="mr-6 text-gray-500 hover:text-gray-700"
              >
                <Home size={20} />
              </button>
              <h1 className="font-medium text-gray-900 truncate max-w-xs">{test.title}</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm hidden sm:block">
                <span className="text-gray-500">Progress:</span> {Object.keys(userAnswers).length}/{test.questions.length}
              </div>
              
              <div className="flex items-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  timeRemaining < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  <Clock size={14} className="mr-1" />
                  {formatTime(timeRemaining)}
                </span>
              </div>
              
              <button
                onClick={finishTest}
                className="px-3 py-1 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-all"
              >
                Finish Test
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Progress bar */}
      <div className="fixed top-16 w-full z-10">
        <div 
          className="h-1 bg-primary-600 transition-all" 
          style={{ width: `${calculateProgress()}%` }}
        ></div>
      </div>
      
      {/* Main content */}
      <main className="flex-grow pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
            {/* Question */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">
                  Question {currentQuestionIndex + 1} of {test.questions.length}
                </span>
                <span className="text-sm font-medium text-primary-600">
                  {test.difficulty_level}
                </span>
              </div>
              
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-lg font-medium text-gray-900 mb-1">
                  {test.questions[currentQuestionIndex].text}
                </h2>
              </motion.div>
            </div>
            
            {/* Options */}
            <div className="space-y-3 mb-8">
              {test.questions[currentQuestionIndex].options.map((option) => {
                const isSelected = userAnswers[test.questions[currentQuestionIndex].id] === option.id;
                
                return (
                  <motion.button
                    key={option.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => selectAnswer(option.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      isSelected 
                        ? 'border-primary-600 bg-primary-50 text-primary-900' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-primary-600' : 'border-gray-300'
                      }`}>
                        {isSelected && (
                          <div className="w-3 h-3 rounded-full bg-primary-600"></div>
                        )}
                      </div>
                      <div className="ml-3">
                        <span className="font-medium mr-2">{option.id}.</span>
                        {option.text}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
            
            {/* Navigation buttons */}
            <div className="flex justify-between">
              <button
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className={`px-4 py-2 rounded-md flex items-center ${
                  currentQuestionIndex === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft size={20} className="mr-1" />
                Previous
              </button>
              
              {currentQuestionIndex < test.questions.length - 1 ? (
                <button
                  onClick={goToNextQuestion}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-all flex items-center"
                >
                  Next
                  <ChevronRight size={20} className="ml-1" />
                </button>
              ) : (
                <button
                  onClick={finishTest}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all flex items-center"
                >
                  Finish Test
                  <CheckCircle size={20} className="ml-1" />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Question navigation footer */}
      <footer className="fixed bottom-0 w-full bg-white border-t border-gray-200 py-2">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2">
            {test.questions.map((question, index) => {
              const isAnswered = userAnswers[question.id] !== undefined;
              const isCurrent = index === currentQuestionIndex;
              
              return (
                <button
                  key={question.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    isCurrent
                      ? 'bg-primary-600 text-white'
                      : isAnswered
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TakeTest;