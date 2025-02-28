// frontend/pages/challenges/index.js
import useSWR from 'swr';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { useState } from 'react';

const fetcher = (url) =>
  fetch(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  }).then((res) => res.json());

export default function Challenges() {
  const { data: challenges, error } = useSWR('http://localhost:5000/api/challenges', fetcher);
  const [filter, setFilter] = useState('all');

  const filteredChallenges = challenges?.filter(challenge => {
    if (filter === 'all') return true;
    return challenge.difficulty === filter;
  });

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 px-4 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Coding Challenges
              </h1>
            </div>
            <p className="text-navy-100 text-sm sm:text-base mt-2">
              Enhance your coding skills with our programming challenges
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['all', 'easy', 'medium', 'hard'].map((level) => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors
                  ${filter === level
                    ? 'bg-blue-600 text-white'
                    : 'bg-navy-700/50 text-navy-100 hover:bg-navy-600'
                  }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>

          {/* Challenge Cards */}
          {error ? (
            <div className="text-red-400 bg-red-900/20 p-4 rounded-lg text-center">
              Failed to load challenges
            </div>
          ) : !challenges ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredChallenges.map((challenge) => (
                <div
                  key={challenge._id}
                  className={`bg-navy-800/50 rounded-lg border ${
                    challenge.completed 
                      ? 'border-green-500/50' 
                      : 'border-navy-600/50 hover:border-blue-500/50'
                  } transition-all duration-300 overflow-hidden`}
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                      <div className="flex items-center">
                        <h3 className="text-lg sm:text-xl font-semibold text-white">
                          {challenge.title}
                        </h3>
                        {challenge.completed && (
                          <span className="ml-2 flex items-center text-green-400" title="Completed">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium
                        ${challenge.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                          challenge.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'}`}
                      >
                        {challenge.difficulty}
                      </span>
                    </div>

                    <p className="text-navy-100 text-sm mb-4 sm:mb-6 h-10 sm:h-12 overflow-hidden">
                      {challenge.description}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex space-x-4 text-navy-200">
                        {/* XP Points */}
                        <div className="flex items-center">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-xs sm:text-sm">{challenge.points || 0} XP</span>
                        </div>
                        
                        {/* Time Limit */}
                        <div className="flex items-center">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs sm:text-sm">{challenge.timeLimit || 30} min</span>
                        </div>
                      </div>

                      <Link
                        href={`/challenges/${challenge._id}`}
                        className={`inline-flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                          challenge.completed
                            ? 'text-navy-900 bg-green-400 hover:bg-green-500 focus:ring-green-500'
                            : 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                        }`}
                      >
                        {challenge.completed ? 'Try Again' : 'Start Challenge'}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
