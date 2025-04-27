import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Target, Clock, Brain, Download, Loader, FileText, Printer, Sparkles } from 'lucide-react';
import { generateTest, TestParameters } from '../utils/CurateTestAPI';

const CurateTest: React.FC = () => {
  // State for form inputs
  const [subjectArea, setSubjectArea] = useState('');
  const [topics, setTopics] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [questionType, setQuestionType] = useState<'mixed' | 'mcq' | 'written' | 'practical'>('mixed');
  
  // State for test generation
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedTest, setGeneratedTest] = useState<string | null>(null);

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
        questionType
      };
      
      // Call API to generate test
      const result = await generateTest(params);
      setGeneratedTest(result);
      
      // Scroll to the generated test
      setTimeout(() => {
        document.getElementById('generated-test')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle printing the test
  const handlePrintTest = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && generatedTest) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${subjectArea} Test</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
              h1 { color: #333; }
              .test-content { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <h1>${subjectArea} Test</h1>
            <div class="test-content">${generatedTest.replace(/\n/g, '<br>')}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  // Handle downloading the test
  const handleDownloadTest = () => {
    if (generatedTest) {
      const blob = new Blob([generatedTest], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${subjectArea.replace(/\s+/g, '_')}_test.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
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
                <Sparkles size={16} className="mr-1" />
                Powered by LLaMA
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Specify your requirements and let AI generate a personalized test that matches your learning objectives.
            </p>

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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question Types</label>
                  <select 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value as 'mixed' | 'mcq' | 'written' | 'practical')}
                  >
                    <option value="mixed">Mixed</option>
                    <option value="mcq">Multiple Choice</option>
                    <option value="written">Written Response</option>
                    <option value="practical">Practical Problems</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 transition-all hover:shadow-glow flex items-center justify-center gap-2 disabled:bg-primary-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Generating Test with LLaMA...
                  </>
                ) : (
                  <>
                    <Brain size={20} />
                    Generate Test
                  </>
                )}
              </button>
            </form>
          </motion.div>

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
              <h3 className="text-lg font-semibold mb-2">Instant Generation</h3>
              <p className="text-gray-600">Get your customized test in seconds with detailed solutions.</p>
            </motion.div>
          </div>

          {/* Generated Test Section */}
          {generatedTest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              id="generated-test"
              className="bg-white rounded-lg shadow-lg p-6 mb-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Your Generated Test</h2>
                <div className="flex gap-3">
                  <button
                    onClick={handlePrintTest}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                  >
                    <Printer size={18} />
                    Print
                  </button>
                  <button
                    onClick={handleDownloadTest}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-md transition-colors"
                  >
                    <Download size={18} />
                    Download
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-md whitespace-pre-wrap font-mono text-sm">
                {generatedTest}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CurateTest;