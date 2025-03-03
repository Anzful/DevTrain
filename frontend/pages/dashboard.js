import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip } from 'react-tooltip';
import Link from 'next/link';
import { ArrowRightIcon, CodeBracketIcon, CheckCircleIcon, ClockIcon, FireIcon, TrophyIcon } from '@heroicons/react/24/solid';

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'; // Fallback for local dev
      const response = await fetch(`${BACKEND_URL}/api/users/stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user stats');
      }

      const data = await response.json();
      setUserData(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      setError('Failed to load dashboard data');
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();

    // Set up event listener for challenge completion
    const handleChallengeComplete = () => {
      fetchUserData();
    };

    window.addEventListener('challenge-complete', handleChallengeComplete);

    return () => {
      window.removeEventListener('challenge-complete', handleChallengeComplete);
    };
  }, []);

  // Function to prepare activity data for the heatmap
  const getActivityData = () => {
    if (!userData?.activityData) return [];
    
    // Create a map of dates to counts
    const dateMap = {};
    userData.activityData.forEach(item => {
      dateMap[item.date] = {
        count: item.count,
        successCount: item.successCount
      };
    });
    
    // Create a full year of data with zeros for days with no activity
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 365);
    
    const result = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const activity = dateMap[dateStr] || { count: 0, successCount: 0 };
      
      result.push({
        date: dateStr,
        count: activity.count,
        successCount: activity.successCount
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return result;
  };

  // Function to determine color based on activity count
  const getColor = (count) => {
    if (!count) return 'bg-navy-700/50';
    if (count === 1) return 'bg-green-900/70';
    if (count === 2) return 'bg-green-700/70';
    if (count === 3) return 'bg-green-600/70';
    return 'bg-green-500/70';
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-navy-900 to-navy-800 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error || !userData) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-navy-900 to-navy-800 flex items-center justify-center">
          <div className="text-red-400 bg-red-900/20 px-6 py-4 rounded-lg shadow-lg">
            {error || 'Failed to load user data'}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-navy-900 to-navy-800 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8 flex items-center">
            <span className="bg-blue-500/20 text-blue-400 p-2 rounded-lg mr-3">
              <TrophyIcon className="h-6 w-6" />
            </span>
            Dashboard
          </h1>
          
          {/* User Profile Card */}
          <div className="bg-navy-800/60 rounded-xl p-6 border border-navy-600/50 mb-8 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-4xl shadow-lg">
                  {userData.currentBadge?.image || '🎯'}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{userData.name}</h2>
                    <p className="text-blue-400 font-medium">{userData.currentBadge?.name || 'Novice Coder'}</p>
                  </div>
                  
                  <div className="mt-4 md:mt-0 bg-navy-700/40 rounded-lg px-4 py-2 border border-navy-600/30">
                    <div className="flex items-center">
                      <FireIcon className="h-5 w-5 text-yellow-500 mr-2" />
                      <span className="text-yellow-500 font-bold text-lg">{userData.experiencePoints || 0} XP</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-navy-100 font-medium">Level {userData.level || 1}</span>
                    <span className="text-navy-100">Level {(userData.level || 1) + 1}</span>
                  </div>
                  <div className="w-full bg-navy-700/50 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full transition-all duration-500" 
                      style={{ width: `${userData.levelProgress || 0}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-navy-300 mt-1.5 text-right">
                    {Math.round(userData.levelProgress || 0)}% to next level
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-navy-800/60 rounded-xl p-5 border border-navy-600/50 shadow-lg hover:border-blue-500/30 transition-all">
              <div className="flex items-start">
                <div className="p-2 bg-yellow-500/20 rounded-lg mr-3">
                  <FireIcon className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-navy-300 text-sm font-medium">Experience Points</h3>
                  <p className="text-2xl font-bold text-white mt-1">
                    {userData.experiencePoints || 0}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-navy-800/60 rounded-xl p-5 border border-navy-600/50 shadow-lg hover:border-blue-500/30 transition-all">
              <div className="flex items-start">
                <div className="p-2 bg-green-500/20 rounded-lg mr-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-navy-300 text-sm font-medium">Challenges Completed</h3>
                  <p className="text-2xl font-bold text-white mt-1">
                    {userData.successfulSubmissions || 0}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-navy-800/60 rounded-xl p-5 border border-navy-600/50 shadow-lg hover:border-blue-500/30 transition-all">
              <div className="flex items-start">
                <div className="p-2 bg-blue-500/20 rounded-lg mr-3">
                  <CodeBracketIcon className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-navy-300 text-sm font-medium">Total Submissions</h3>
                  <p className="text-2xl font-bold text-white mt-1">
                    {userData.totalSubmissions || 0}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-navy-800/60 rounded-xl p-5 border border-navy-600/50 shadow-lg hover:border-blue-500/30 transition-all">
              <div className="flex items-start">
                <div className="p-2 bg-purple-500/20 rounded-lg mr-3">
                  <TrophyIcon className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-navy-300 text-sm font-medium">Success Rate</h3>
                  <p className="text-2xl font-bold text-white mt-1">
                    {Math.round(userData.successRate || 0)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Activity Heatmap */}
            <div className="bg-navy-800/60 rounded-xl p-6 border border-navy-600/50 shadow-lg lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2 text-blue-400" />
                  Coding Activity
                </h2>
                <div className="flex items-center space-x-1 text-xs text-navy-300">
                  <span>Less</span>
                  <div className="w-3 h-3 bg-navy-700/50 rounded"></div>
                  <div className="w-3 h-3 bg-green-900/70 rounded"></div>
                  <div className="w-3 h-3 bg-green-700/70 rounded"></div>
                  <div className="w-3 h-3 bg-green-600/70 rounded"></div>
                  <div className="w-3 h-3 bg-green-500/70 rounded"></div>
                  <span>More</span>
                </div>
              </div>
              
              <div className="activity-heatmap">
                <CalendarHeatmap
                  startDate={new Date(Date.now() - 364 * 24 * 60 * 60 * 1000)}
                  endDate={new Date()}
                  values={getActivityData()}
                  classForValue={(value) => {
                    if (!value || value.count === 0) {
                      return 'color-empty';
                    }
                    return `color-scale-${Math.min(4, value.count)}`;
                  }}
                  tooltipDataAttrs={(value) => {
                    if (!value || !value.date) return null;
                    return {
                      'data-tooltip-id': 'activity-tooltip',
                      'data-tooltip-content': `${value.date}: ${value.count} submissions (${value.successCount} successful)`,
                    };
                  }}
                />
                <Tooltip id="activity-tooltip" />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-navy-800/60 rounded-xl p-6 border border-navy-600/50 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-6">Quick Stats</h2>
              
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-navy-300">Last Active</span>
                    <span className="text-navy-100">{formatDate(userData.lastActive)}</span>
                  </div>
                  <div className="h-1 w-full bg-navy-700/50 rounded-full overflow-hidden">
                    <div className="h-1 bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-navy-300">Success Rate</span>
                    <span className="text-navy-100">{Math.round(userData.successRate || 0)}%</span>
                  </div>
                  <div className="h-1 w-full bg-navy-700/50 rounded-full overflow-hidden">
                    <div 
                      className="h-1 bg-green-500 rounded-full" 
                      style={{ width: `${Math.round(userData.successRate || 0)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-navy-300">Level Progress</span>
                    <span className="text-navy-100">{Math.round(userData.levelProgress || 0)}%</span>
                  </div>
                  <div className="h-1 w-full bg-navy-700/50 rounded-full overflow-hidden">
                    <div 
                      className="h-1 bg-purple-500 rounded-full" 
                      style={{ width: `${Math.round(userData.levelProgress || 0)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <Link 
                  href="/challenges" 
                  className="flex items-center justify-center w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                >
                  <span>Solve Challenges</span>
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-navy-800/60 rounded-xl p-6 border border-navy-600/50 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-blue-400" />
              Recent Activity
            </h2>
            
            {userData.recentSubmissions?.length > 0 ? (
              <div className="space-y-4">
                {userData.recentSubmissions.map((submission, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-navy-700/40 rounded-xl border border-navy-600/30 hover:border-navy-500/50 transition-all"
                  >
                    <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                        submission.passed 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-red-500/20 text-red-500'
                      }`}>
                        {submission.passed 
                          ? <CheckCircleIcon className="h-6 w-6" />
                          : <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        }
                      </div>
                      
                      <div>
                        <h3 className="text-white font-medium">
                          {submission.challengeTitle}
                        </h3>
                        <div className="flex items-center text-navy-300 text-xs">
                          <span>{formatDate(submission.createdAt)}</span>
                          <span className="mx-2">•</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            submission.difficulty === 'easy' 
                              ? 'bg-green-500/20 text-green-400' 
                              : submission.difficulty === 'medium'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-red-500/20 text-red-400'
                          }`}>
                            {submission.difficulty?.charAt(0).toUpperCase() + submission.difficulty?.slice(1) || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
                      <span className="px-2 py-1 bg-navy-700/60 rounded-lg text-navy-200 text-xs">
                        {submission.language}
                      </span>
                      
                      {submission.passed && (
                        <span className="flex items-center text-yellow-500 font-medium bg-yellow-500/10 px-2 py-1 rounded-lg text-xs">
                          <FireIcon className="h-3.5 w-3.5 mr-1" />
                          {submission.points} XP
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-navy-700/30 rounded-xl border border-navy-600/30">
                <CodeBracketIcon className="h-10 w-10 text-navy-400 mx-auto mb-3" />
                <p className="text-navy-300">No recent activity found</p>
                <Link 
                  href="/challenges" 
                  className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <span>Start Solving</span>
                  <ArrowRightIcon className="h-3.5 w-3.5 ml-1.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .react-calendar-heatmap .color-empty { fill: rgba(15, 23, 42, 0.3); }
        .react-calendar-heatmap .color-scale-1 { fill: rgba(20, 83, 45, 0.7); }
        .react-calendar-heatmap .color-scale-2 { fill: rgba(22, 101, 52, 0.7); }
        .react-calendar-heatmap .color-scale-3 { fill: rgba(22, 163, 74, 0.7); }
        .react-calendar-heatmap .color-scale-4 { fill: rgba(34, 197, 94, 0.7); }
        .react-calendar-heatmap rect:hover { stroke: #60a5fa; stroke-width: 1px; }
      `}</style>
    </Layout>
  );
}