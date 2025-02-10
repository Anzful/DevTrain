// frontend/pages/leaderboards.js
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

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
      console.log('Leaderboard data received:', data); // Debug log
      setLeaderboardData(data);
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-red-600">Error: {error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Leaderboards</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Experience Points Leaderboard */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Experience Points</h2>
            {leaderboardData.experiencePoints.length > 0 ? (
              <div className="space-y-4">
                {leaderboardData.experiencePoints.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center">
                      <span className="text-lg font-semibold w-8">{index + 1}</span>
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Level {user.level}</div>
                      <div className="font-semibold">{user.experiencePoints} XP</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                No experience points data available
              </div>
            )}
          </div>

          {/* Performance Leaderboard */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Top Performers</h2>
            {leaderboardData.performance.length > 0 ? (
              <div className="space-y-4">
                {leaderboardData.performance.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center">
                      <span className="text-lg font-semibold w-8">{index + 1}</span>
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">{user.submissions} submissions</div>
                      <div className="font-semibold">{user.score} points</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                No performance data available
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
