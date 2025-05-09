import React, { useState } from 'react';
import { Map, BookOpen, Video, FileText, Headphones, ChevronRight } from 'lucide-react';
import { generateLearningPath } from '../utils/LearningPathway';

const LearningPathway: React.FC = () => {
  const [goal, setGoal] = useState('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [timeCommitment, setTimeCommitment] = useState<'1-2' | '3-5' | '5-10' | '10+'>('1-2');
  const [selectedMethods, setSelectedMethods] = useState<string[]>(['Reading']);
  const [learningPath, setLearningPath] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Interface for the user input
  interface LearningPathParameters {
    goal: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    timeCommitment: '1-2' | '3-5' | '5-10' | '10+';
    methods: string[];
  }

  const learningMethods = [
    { icon: BookOpen, label: 'Reading' },
    { icon: Video, label: 'Videos' },
    { icon: Headphones, label: 'Audio' },
    { icon: FileText, label: 'Practice' }
  ];

  const toggleMethod = (method: string) => {
    if (selectedMethods.includes(method)) {
      setSelectedMethods(selectedMethods.filter(m => m !== method));
    } else {
      setSelectedMethods([...selectedMethods, method]);
    }
  };

  const handleGenerateLearningPath = async () => {
    if (!goal.trim()) {
      alert('Please enter a learning goal');
      return;
    }

    const learningParams: LearningPathParameters = {
      goal,
      level,
      timeCommitment,
      methods: selectedMethods
    };

    setIsLoading(true);
    try {
      const generatedPath = await generateLearningPath(learningParams);
      
      // Process the learning path into a structured format
      const processedPath = processLearningPath(generatedPath);
      setLearningPath(processedPath);
    } catch (error) {
      console.error('Failed to generate learning path:', error);
      alert('Failed to generate learning path. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Process the learning path text into a structured format
  const processLearningPath = (pathText: string) => {
    const weeks = [];
    const weekRegex = /Week (\d+):/g;
    const contentRegex = /Week \d+:(.*?)(?=Week \d+:|$)/gs;
    
    let weekMatch;
    let contentMatch;
    let index = 0;
    
    while ((weekMatch = weekRegex.exec(pathText)) !== null) {
      const weekNumber = parseInt(weekMatch[1]);
      
      contentMatch = contentRegex.exec(pathText);
      if (contentMatch) {
        const content = contentMatch[1].trim();
        const items = content.split('\n')
          .map(item => item.trim())
          .filter(item => item && !item.startsWith('Week') && item !== '-');
        
        weeks.push({
          week: weekNumber,
          content: items
        });
      }
      
      index++;
      if (index >= 10) break; // Limit to 10 weeks
    }
    
    return weeks;
  };

  const getMethodColor = (method: string) => {
    if (selectedMethods.includes(method)) {
      return 'bg-blue-100 border-blue-500 text-blue-700';
    }
    return 'bg-white border-gray-200 text-gray-600';
  };

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Design Your Learning Journey</h1>
            <p className="text-gray-600 mb-6">
              Create a personalized learning pathway that adapts to your goals, pace, and preferred learning style.
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Learning Goal</label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="What do you want to learn? (e.g., Python, Machine Learning, Digital Marketing)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Commitment</label>
                  <select
                    value={timeCommitment}
                    onChange={(e) => setTimeCommitment(e.target.value as '1-2' | '3-5' | '5-10' | '10+')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="1-2">1-2 hours/week</option>
                    <option value="3-5">3-5 hours/week</option>
                    <option value="5-10">5-10 hours/week</option>
                    <option value="10+">10+ hours/week</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Learning Methods</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {learningMethods.map(({ icon: Icon, label }) => (
                    <button
                      key={label}
                      onClick={() => toggleMethod(label)}
                      className={`flex flex-col items-center p-3 border rounded-lg transition-colors ${getMethodColor(label)}`}
                    >
                      <Icon className="w-6 h-6 mb-2" />
                      <span className="text-sm">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerateLearningPath}
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:bg-blue-300"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Map size={20} />
                    <span>Create Learning Path</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {learningPath && learningPath.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Learning Path</h2>
              
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 h-full w-0.5 bg-blue-200"></div>
                
                {/* Weeks */}
                <div className="space-y-10">
                  {learningPath.map((week) => (
                    <div key={week.week} className="relative pl-14">
                      {/* Timeline dot */}
                      <div className="absolute left-0 top-0 h-12 w-12 rounded-full bg-blue-500 text-white flex items-center justify-center">
                        <span className="font-bold">{week.week}</span>
                      </div>
                      
                      {/* Timeline content */}
                      <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                        <h3 className="font-semibold text-blue-800 text-lg mb-3">Week {week.week}</h3>
                        <ul className="space-y-2">
                            {week.content.map((item: string, i: number) => (
                            <li key={i} className="flex items-start">
                              <ChevronRight className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{item}</span>
                            </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningPathway;