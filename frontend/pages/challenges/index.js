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
      <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-white">
                Coding Challenges
              </h1>
            </div>
            <p className="text-navy-100 mt-2">
              Enhance your coding skills with our programming challenges
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 mb-6">
            {['all', 'easy', 'medium', 'hard'].map((level) => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChallenges.map((challenge) => (
                <div
                  key={challenge._id}
                  className="bg-navy-800/50 rounded-lg border border-navy-600/50 hover:border-blue-500/50 transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-white">
                        {challenge.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium
                        ${challenge.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                          challenge.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'}`}
                      >
                        {challenge.difficulty}
                      </span>
                    </div>

                    <p className="text-navy-100 mb-6 h-12 overflow-hidden">
                      {challenge.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex space-x-4 text-navy-200">
                        {/* XP Points */}
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span>{challenge.points || 0} XP</span>
                        </div>
                        
                        {/* Time Limit */}
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span>{challenge.timeLimit || 30} min</span>
                        </div>
                      </div>

                      <Link
                        href={`/challenges/${challenge._id}`}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        Start Challenge
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
