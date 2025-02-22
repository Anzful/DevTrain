// frontend/pages/dashboard.js
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/users/stats', {
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

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error || !userData) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 flex items-center justify-center">
          <div className="text-red-400 bg-red-900/20 px-4 py-2 rounded">
            {error || 'Failed to load user data'}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* User Profile Card */}
          <div className="bg-navy-800/50 rounded-lg p-6 border border-navy-600/50 mb-8">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{userData.currentBadge?.image || '🎯'}</div>
              <div>
                <h2 className="text-2xl font-bold text-white">{userData.name}</h2>
                <p className="text-navy-100">{userData.currentBadge?.name || 'Novice Coder'}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between mb-2">
                <span className="text-navy-100">Level {userData.level || 1}</span>
                <span className="text-navy-100">{userData.experiencePoints || 0} XP</span>
              </div>
              <div className="w-full bg-navy-700/50 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${userData.levelProgress || 0}%` }}
                ></div>
              </div>
              <div className="text-sm text-navy-200 mt-1">
                {Math.round(userData.levelProgress || 0)}% to Level {(userData.level || 1) + 1}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-navy-800/50 rounded-lg p-6 border border-navy-600/50">
              <h3 className="text-navy-100 text-sm font-medium">Experience Points</h3>
              <p className="text-2xl font-bold text-white mt-2">
                {userData.experiencePoints || 0} XP
              </p>
            </div>
            
            <div className="bg-navy-800/50 rounded-lg p-6 border border-navy-600/50">
              <h3 className="text-navy-100 text-sm font-medium">Challenges Completed</h3>
              <p className="text-2xl font-bold text-white mt-2">
                {userData.successfulSubmissions || 0}
              </p>
            </div>
            
            <div className="bg-navy-800/50 rounded-lg p-6 border border-navy-600/50">
              <h3 className="text-navy-100 text-sm font-medium">Success Rate</h3>
              <p className="text-2xl font-bold text-white mt-2">
                {Math.round(userData.successRate || 0)}%
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-navy-800/50 rounded-lg p-6 border border-navy-600/50">
            <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
            {userData.recentSubmissions?.length > 0 ? (
              <div className="space-y-4">
                {userData.recentSubmissions.map((submission, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-4 bg-navy-700/50 rounded-lg border border-navy-600/50"
                  >
                    <div className="flex items-center space-x-4">
                      <span className={`text-lg ${
                        submission.passed ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {submission.passed ? '✓' : '✗'}
                      </span>
                      <div>
                        <h3 className="text-white font-medium">
                          {submission.challengeTitle}
                        </h3>
                        <p className="text-navy-200 text-sm">
                          {new Date(submission.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-navy-100 text-sm">
                        {submission.language}
                      </span>
                      {submission.passed && (
                        <span className="flex items-center text-yellow-500 text-sm">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {submission.points} XP
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-navy-100">
                No recent activity. Start solving challenges!
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
