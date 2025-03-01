// frontend/pages/leaderboards.js
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';
import { TrophyIcon, StarIcon, FireIcon, AcademicCapIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import Head from 'next/head';

export default function Leaderboards() {
  const [leaderboardData, setLeaderboardData] = useState({
    experiencePoints: [],
    performance: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('xp'); // 'xp' or 'performance'

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/leaderboards', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboards');
      }

      const data = await response.json();
      setLeaderboardData(data);
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
      setError(error.message);
      toast.error('Failed to load leaderboards');
    } finally {
      setLoading(false);
    }
  };

  // Get medal color based on position
  const getMedalColor = (position) => {
    switch (position) {
      case 0: return 'from-yellow-400 to-yellow-600'; // Gold
      case 1: return 'from-gray-300 to-gray-500'; // Silver
      case 2: return 'from-amber-600 to-amber-800'; // Bronze
      default: return 'from-navy-600 to-navy-700'; // Default
    }
  };

  // Get medal emoji based on position
  const getMedalEmoji = (position) => {
    switch (position) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '';
    }
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

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-navy-900 to-navy-800 flex items-center justify-center">
          <div className="text-red-400 bg-red-900/20 px-6 py-4 rounded-lg shadow-lg">
            {error}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Leaderboards - DevTrain</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-navy-900 to-navy-800 py-6 sm:py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-navy-800/60 rounded-xl p-6 border border-navy-600/50 shadow-lg mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
                <span className="bg-blue-500/20 text-blue-400 p-2 rounded-lg mr-3">
                  <TrophyIcon className="h-6 w-6" />
                </span>
                Leaderboards
              </h1>
              <p className="text-navy-300 max-w-xl">
                See how you stack up against other developers in experience points and challenge completions.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex mb-6 bg-navy-800/40 rounded-lg p-1 max-w-md mx-auto">
            <button
              onClick={() => setActiveTab('xp')}
              className={`flex-1 py-2.5 px-4 rounded-md flex items-center justify-center space-x-2 transition-all ${
                activeTab === 'xp' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-navy-300 hover:text-white hover:bg-navy-700/50'
              }`}
            >
              <StarIcon className="h-5 w-5" />
              <span>Experience Points</span>
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`flex-1 py-2.5 px-4 rounded-md flex items-center justify-center space-x-2 transition-all ${
                activeTab === 'performance' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-navy-300 hover:text-white hover:bg-navy-700/50'
              }`}
            >
              <FireIcon className="h-5 w-5" />
              <span>Top Performers</span>
            </button>
          </div>

          {/* Top 3 Podium (for active tab) */}
          {(activeTab === 'xp' ? leaderboardData.experiencePoints : leaderboardData.performance).length > 0 && (
            <div className="mb-8">
              <div className="flex flex-col md:flex-row items-end justify-center gap-4 py-6">
                {/* Only show if we have at least 2 users */}
                {(activeTab === 'xp' ? leaderboardData.experiencePoints : leaderboardData.performance).length > 1 && (
                  <div className="order-2 md:order-1 w-full md:w-1/4">
                    <div className="bg-navy-800/60 rounded-t-lg border border-navy-600/50 pt-4 pb-6 px-4 text-center h-40 flex flex-col items-center justify-end">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center mb-2 border-2 border-navy-600/50 shadow-lg">
                        <span className="text-2xl">🥈</span>
                      </div>
                      <div className="font-semibold text-white truncate w-full">
                        {activeTab === 'xp' 
                          ? leaderboardData.experiencePoints[1]?.name 
                          : leaderboardData.performance[1]?.name}
                      </div>
                      <div className="text-sm text-navy-300">
                        {activeTab === 'xp' 
                          ? `${leaderboardData.experiencePoints[1]?.experiencePoints} XP` 
                          : `${leaderboardData.performance[1]?.score} points`}
                      </div>
                    </div>
                    <div className="bg-gray-500/20 text-center py-1 rounded-b-lg border-x border-b border-navy-600/50">
                      <span className="text-gray-300 font-medium">2nd Place</span>
                    </div>
                  </div>
                )}

                {/* 1st Place - Always show if we have at least 1 user */}
                {(activeTab === 'xp' ? leaderboardData.experiencePoints : leaderboardData.performance).length > 0 && (
                  <div className="order-1 md:order-2 w-full md:w-1/3 -mt-4">
                    <div className="bg-navy-800/60 rounded-t-lg border border-navy-600/50 pt-4 pb-6 px-4 text-center h-48 flex flex-col items-center justify-end relative">
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="bg-yellow-500/20 text-yellow-500 p-2 rounded-full">
                          <TrophyIcon className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center mb-2 border-2 border-navy-600/50 shadow-lg">
                        <span className="text-3xl">🥇</span>
                      </div>
                      <div className="font-bold text-lg text-white truncate w-full">
                        {activeTab === 'xp' 
                          ? leaderboardData.experiencePoints[0]?.name 
                          : leaderboardData.performance[0]?.name}
                      </div>
                      <div className="text-sm text-navy-300">
                        {activeTab === 'xp' 
                          ? `Level ${leaderboardData.experiencePoints[0]?.level}` 
                          : `${leaderboardData.performance[0]?.submissions} submissions`}
                      </div>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          activeTab === 'xp' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {activeTab === 'xp' 
                            ? `${leaderboardData.experiencePoints[0]?.experiencePoints} XP` 
                            : `${leaderboardData.performance[0]?.score} points`}
                        </span>
                      </div>
                    </div>
                    <div className="bg-yellow-500/20 text-center py-1 rounded-b-lg border-x border-b border-navy-600/50">
                      <span className="text-yellow-400 font-medium">1st Place</span>
                    </div>
                  </div>
                )}

                {/* Only show if we have at least 3 users */}
                {(activeTab === 'xp' ? leaderboardData.experiencePoints : leaderboardData.performance).length > 2 && (
                  <div className="order-3 w-full md:w-1/4">
                    <div className="bg-navy-800/60 rounded-t-lg border border-navy-600/50 pt-4 pb-6 px-4 text-center h-36 flex flex-col items-center justify-end">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center mb-2 border-2 border-navy-600/50 shadow-lg">
                        <span className="text-xl">🥉</span>
                      </div>
                      <div className="font-semibold text-white truncate w-full">
                        {activeTab === 'xp' 
                          ? leaderboardData.experiencePoints[2]?.name 
                          : leaderboardData.performance[2]?.name}
                      </div>
                      <div className="text-sm text-navy-300">
                        {activeTab === 'xp' 
                          ? `${leaderboardData.experiencePoints[2]?.experiencePoints} XP` 
                          : `${leaderboardData.performance[2]?.score} points`}
                      </div>
                    </div>
                    <div className="bg-amber-700/20 text-center py-1 rounded-b-lg border-x border-b border-navy-600/50">
                      <span className="text-amber-400 font-medium">3rd Place</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Leaderboard Table */}
          <div className="bg-navy-800/60 rounded-xl border border-navy-600/50 shadow-lg overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-navy-600/50 flex items-center">
              <div className={`p-2 rounded-lg mr-3 ${
                activeTab === 'xp' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
              }`}>
                {activeTab === 'xp' ? <AcademicCapIcon className="h-5 w-5" /> : <UserGroupIcon className="h-5 w-5" />}
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                {activeTab === 'xp' ? 'Experience Points Ranking' : 'Top Performers Ranking'}
              </h2>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 p-4 bg-navy-700/30 text-navy-300 text-sm font-medium">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-7">User</div>
              <div className="col-span-4 text-right">
                {activeTab === 'xp' ? 'Experience' : 'Score'}
              </div>
            </div>

            {/* Table Body */}
            {(activeTab === 'xp' ? leaderboardData.experiencePoints : leaderboardData.performance).length > 0 ? (
              <div className="divide-y divide-navy-700/30">
                {(activeTab === 'xp' ? leaderboardData.experiencePoints : leaderboardData.performance).map((user, index) => (
                  <div 
                    key={user.id} 
                    className={`grid grid-cols-12 gap-2 p-4 ${index < 3 ? 'bg-navy-700/10' : ''} hover:bg-navy-700/20 transition-colors`}
                  >
                    <div className="col-span-1 flex justify-center">
                      {index < 3 ? (
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getMedalColor(index)} flex items-center justify-center text-white font-bold shadow-sm`}>
                          {getMedalEmoji(index)}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-navy-700/40 flex items-center justify-center text-navy-300 font-medium">
                          {index + 1}
                        </div>
                      )}
                    </div>
                    <div className="col-span-7 flex items-center">
                      <div>
                        <div className="font-medium text-white">{user.name}</div>
                        <div className="text-xs text-navy-300">
                          {activeTab === 'xp' 
                            ? `Level ${user.level}` 
                            : `${user.submissions} submissions`}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-4 flex items-center justify-end">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        activeTab === 'xp' 
                          ? 'bg-yellow-500/10 text-yellow-400' 
                          : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {activeTab === 'xp' 
                          ? `${user.experiencePoints} XP` 
                          : `${user.score} points`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-navy-700/40 mb-4">
                  <UserGroupIcon className="h-8 w-8 text-navy-300" />
                </div>
                <div className="text-navy-100 text-lg font-medium mb-2">
                  No data available
                </div>
                <p className="text-navy-300 text-sm max-w-md mx-auto">
                  Complete challenges to earn experience points and appear on the leaderboard.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
