// frontend/pages/challenges/index.js
import useSWR from 'swr';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const fetcher = (url) =>
  fetch(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  }).then((res) => res.json());

export default function Challenges() {
  const router = useRouter();
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  
  // Fetch challenges with filters
  const { data: challenges, error, mutate } = useSWR(
    `http://localhost:5000/api/challenges?difficulty=${difficultyFilter}&category=${categoryFilter}`, 
    fetcher
  );
  
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/challenges/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Apply filters
  const handleFilterChange = (type, value) => {
    if (type === 'difficulty') {
      setDifficultyFilter(value);
    } else if (type === 'category') {
      setCategoryFilter(value);
    }
    
    // Update URL query params
    router.push({
      pathname: router.pathname,
      query: { 
        ...router.query,
        [type]: value 
      }
    }, undefined, { shallow: true });
  };
  
  // Initialize filters from URL on page load
  useEffect(() => {
    if (router.isReady) {
      if (router.query.difficulty) {
        setDifficultyFilter(router.query.difficulty);
      }
      if (router.query.category) {
        setCategoryFilter(router.query.category);
      }
    }
  }, [router.isReady, router.query]);

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

          {/* Filter Section */}
          <div className="bg-navy-800/50 rounded-lg p-4 mb-6 border border-navy-600/50">
            <h2 className="text-white font-medium mb-3">Filters</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Difficulty Filter */}
              <div>
                <label className="block text-navy-100 text-sm mb-2">Difficulty</label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'easy', 'medium', 'hard'].map((level) => (
                    <button
                      key={level}
                      onClick={() => handleFilterChange('difficulty', level)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                        ${difficultyFilter === level
                          ? 'bg-blue-600 text-white'
                          : 'bg-navy-700/50 text-navy-100 hover:bg-navy-600'
                        }`}
                    >
                      {level === 'all' ? 'All Difficulties' : level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Category Filter */}
              <div>
                <label className="block text-navy-100 text-sm mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleFilterChange('category', 'all')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                      ${categoryFilter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-navy-700/50 text-navy-100 hover:bg-navy-600'
                      }`}
                  >
                    All Categories
                  </button>
                  
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleFilterChange('category', category)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                        ${categoryFilter === category
                          ? 'bg-blue-600 text-white'
                          : 'bg-navy-700/50 text-navy-100 hover:bg-navy-600'
                        }`}
                    >
                      {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
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
          ) : challenges.length === 0 ? (
            <div className="bg-navy-800/50 p-8 rounded-lg text-center border border-navy-600/50">
              <p className="text-navy-100">No challenges found with the selected filters.</p>
              <button 
                onClick={() => {
                  setDifficultyFilter('all');
                  setCategoryFilter('all');
                  router.push('/challenges', undefined, { shallow: true });
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {challenges.map((challenge) => (
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
                      <div className="flex flex-col space-y-2">
                        {/* XP Points */}
                        <div className="flex items-center">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-xs sm:text-sm text-navy-200">{challenge.points || 0} XP</span>
                        </div>
                        
                        {/* Category */}
                        <div className="flex items-center">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 text-navy-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <span className="text-xs sm:text-sm text-navy-200">
                            {challenge.category ? challenge.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Other'}
                          </span>
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
