import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Map, BookOpen, Video, FileText, Headphones } from 'lucide-react';
import { generateLearningPath } from '../utils/LearningPathway'; // Import the utility function

const LearningPathway: React.FC = () => {
  const [goal, setGoal] = useState('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [timeCommitment, setTimeCommitment] = useState<'1-2' | '3-5' | '5-10' | '10+'>('1-2');
  const [learningPath, setLearningPath] = useState<string | null>(null);

  // Define the LearningPathParameters type (already defined outside this file)
  interface LearningPathParameters {
    goal: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    timeCommitment: '1-2' | '3-5' | '5-10' | '10+';
  }

  const handleGenerateLearningPath = async () => {
    const learningParams: LearningPathParameters = {
      goal,
      level,
      timeCommitment,
    };

    try {
      const generatedPath = await generateLearningPath(learningParams);
      setLearningPath(generatedPath);
    } catch (error) {
      console.error('Failed to generate learning path:', error);
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
                  placeholder="What do you want to learn?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  {[{ icon: BookOpen, label: 'Reading' }, { icon: Video, label: 'Videos' }, { icon: Headphones, label: 'Audio' }, { icon: FileText, label: 'Practice' }].map(
                    ({ icon: Icon, label }) => (
                      <button key={label} className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
                        <Icon className="w-6 h-6 text-primary-600 mb-2" />
                        <span className="text-sm">{label}</span>
                      </button>
                    )
                  )}
                </div>
              </div>

              <button
                onClick={handleGenerateLearningPath}
                className="w-full py-3 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 transition-all hover:shadow-glow flex items-center justify-center gap-2"
              >
                <Map size={20} />
                Create Learning Path
              </button>
            </div>
          </motion.div>

          {learningPath && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-lg p-6 mt-8"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Learning Path</h2>
              <div className="space-y-6">
                {learningPath.split("\n").map((week, index) => (
                  <div key={index} className="space-y-2">
                    <h3 className="font-semibold text-gray-800">Week {index + 1}:</h3>
                    <ul className="list-disc pl-6">
                      {week.split(",").map((point, i) => (
                        <li key={i} className="text-gray-600">{point}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LearningPathway;
