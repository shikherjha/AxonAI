import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen pt-16 pb-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.user_metadata.full_name || 'User'}
          </h1>
          <p className="text-gray-600 mt-1">Track your progress and improve your learning journey</p>
        </div>
        
        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Test Results Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Test Results</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-700">Mathematics</span>
                <span className="px-2 py-1 bg-green-50 text-green-600 font-medium rounded text-sm">85%</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-700">Science</span>
                <span className="px-2 py-1 bg-blue-50 text-blue-600 font-medium rounded text-sm">78%</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-700">Language</span>
                <span className="px-2 py-1 bg-yellow-50 text-yellow-600 font-medium rounded text-sm">70%</span>
              </div>
              <button className="text-blue-600 text-sm font-medium mt-2">
                View all results
              </button>
            </div>
          </div>
          
          {/* Weak Topics Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Areas to Improve</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Calculus</span>
                  <span className="text-sm text-gray-500">35%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Chemistry</span>
                  <span className="text-sm text-gray-500">45%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Grammar</span>
                  <span className="text-sm text-gray-500">55%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '55%' }}></div>
                </div>
              </div>
              <button className="text-blue-600 text-sm font-medium mt-2">
                Get targeted practice
              </button>
            </div>
          </div>
          
          {/* Learning Pathways Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Learning Pathways</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-gray-800 font-medium">Advanced Mathematics</h3>
                <div className="flex items-center mt-2">
                  <div className="w-full bg-gray-100 rounded-full h-2 mr-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <span className="text-xs text-gray-500">75%</span>
                </div>
              </div>
              <div>
                <h3 className="text-gray-800 font-medium">Physical Sciences</h3>
                <div className="flex items-center mt-2">
                  <div className="w-full bg-gray-100 rounded-full h-2 mr-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                  <span className="text-xs text-gray-500">40%</span>
                </div>
              </div>
              <div>
                <h3 className="text-gray-800 font-medium">Language Arts</h3>
                <div className="flex items-center mt-2">
                  <div className="w-full bg-gray-100 rounded-full h-2 mr-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  <span className="text-xs text-gray-500">60%</span>
                </div>
              </div>
              <button className="text-blue-600 text-sm font-medium mt-2">
                Explore all pathways
              </button>
            </div>
          </div>
        </div>
        
        {/* Summary Section */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recommended Next Steps</h2>
          <ul className="space-y-2 text-gray-700">
            <li>Complete practice problems for Calculus</li>
            <li>Review Chemistry fundamentals</li>
            <li>Practice grammar exercises</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
