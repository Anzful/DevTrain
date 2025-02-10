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
        <div className="flex justify-center items-center h-screen">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </Layout>
    );
  }

  if (error || !userData) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="text-red-500">{error || 'Failed to load user data'}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">{userData.currentBadge?.image || '🔰'}</div>
            <div>
              <h2 className="text-xl font-bold">{userData.name}</h2>
              <p className="text-gray-600">{userData.currentBadge?.name || 'Novice Coder'}</p>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between mb-1">
              <span>Level {userData.level || 1}</span>
              <span>{userData.experiencePoints || 0} XP</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${userData.levelProgress || 0}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {Math.round(userData.levelProgress || 0)}% to Level {(userData.level || 1) + 1}
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Experience Points</h2>
            <p className="text-3xl font-bold text-blue-600">{userData.experiencePoints || 0}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Challenges Completed</h2>
            <p className="text-3xl font-bold text-green-600">{userData.successfulSubmissions || 0}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Success Rate</h2>
            <p className="text-3xl font-bold text-purple-600">
              {Math.round(userData.successRate || 0)}%
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          {userData.recentSubmissions?.length > 0 ? (
            <div className="space-y-2">
              {userData.recentSubmissions.map((submission, index) => (
                <div key={index} className="flex justify-between items-center p-2 hover:bg-gray-50">
                  <div>
                    <span className="font-medium">{submission.challengeTitle}</span>
                    <span className={`ml-2 text-sm ${submission.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {submission.passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(submission.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent activity</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
