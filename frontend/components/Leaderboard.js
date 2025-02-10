// frontend/components/Leaderboard.js
import { useState, useEffect } from 'react';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('all'); // 'all', 'week', 'month'

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }

        const response = await fetch(`http://localhost:5000/api/leaderboards?timeframe=${timeframe}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard');
        }

        const data = await response.json();
        setLeaderboardData(Array.isArray(data) ? data : []);
        setError(null);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setError('Failed to load leaderboard');
        setLeaderboardData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timeframe]);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-4">
        <div className="text-center py-4">Loading leaderboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-4">
        <div className="text-center text-red-500 py-4">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Leaderboard</h2>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="border rounded p-1"
        >
          <option value="all">All Time</option>
          <option value="month">This Month</option>
          <option value="week">This Week</option>
        </select>
      </div>

      {leaderboardData.length > 0 ? (
        <ul className="divide-y">
          {leaderboardData.map((user, index) => (
            <li key={user._id} className="flex justify-between p-4 hover:bg-gray-50">
              <div className="flex items-center">
                <span className="font-medium w-8">{index + 1}.</span>
                <div className="flex items-center">
                  <span className="text-2xl mr-2">{user.currentBadge?.image || '🔰'}</span>
                  <div>
                    <span className="font-medium">{user.name}</span>
                    <div className="text-sm text-gray-500">
                      Level {user.level || 1}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-indigo-600">
                  {user.experiencePoints || 0} XP
                </div>
                <div className="text-sm text-gray-500">
                  {user.successfulSubmissions || 0} challenges
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-4 text-gray-500">
          No leaderboard data available
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
