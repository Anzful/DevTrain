// frontend/pages/leaderboards.js
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';

export default function Leaderboards() {
  const [leaderboardData, setLeaderboardData] = useState({
    experiencePoints: [],
    performance: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 flex items-center justify-center">
          <div className="text-red-400 bg-red-900/20 px-4 py-2 rounded">
            {error}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 py-4 sm:py-6 md:py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 md:mb-8">Leaderboards</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {/* Experience Points Leaderboard */}
            <div className="bg-navy-800/50 rounded-lg p-4 sm:p-6 border border-navy-600/50">
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-6">Experience Points</h2>
              {leaderboardData.experiencePoints.length > 0 ? (
                <div className="space-y-2 sm:space-y-4">
                  {leaderboardData.experiencePoints.map((user, index) => (
                    <div 
                      key={user.id} 
                      className="flex items-center justify-between p-3 sm:p-4 bg-navy-700/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-4">
                        <span className="text-base sm:text-lg font-semibold text-navy-100 w-6 sm:w-8">
                          #{index + 1}
                        </span>
                        <div>
                          <span className="font-medium text-white text-sm sm:text-base">{user.name}</span>
                          <div className="text-xs sm:text-sm text-navy-200">Level {user.level}</div>
                        </div>
                      </div>
                      <div className="flex items-center text-yellow-500 text-xs sm:text-sm">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>{user.experiencePoints} XP</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8 text-navy-100 text-sm sm:text-base">
                  No data available
                </div>
              )}
            </div>

            {/* Performance Leaderboard */}
            <div className="bg-navy-800/50 rounded-lg p-4 sm:p-6 border border-navy-600/50">
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-6">Top Performers</h2>
              {leaderboardData.performance.length > 0 ? (
                <div className="space-y-2 sm:space-y-4">
                  {leaderboardData.performance.map((user, index) => (
                    <div 
                      key={user.id} 
                      className="flex items-center justify-between p-3 sm:p-4 bg-navy-700/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-4">
                        <span className="text-base sm:text-lg font-semibold text-navy-100 w-6 sm:w-8">
                          #{index + 1}
                        </span>
                        <div>
                          <span className="font-medium text-white text-sm sm:text-base">{user.name}</span>
                          <div className="text-xs sm:text-sm text-navy-200">
                            {user.submissions} submissions
                          </div>
                        </div>
                      </div>
                      <div className="text-blue-400 font-semibold text-xs sm:text-sm">
                        {user.score} points
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8 text-navy-100 text-sm sm:text-base">
                  No data available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
