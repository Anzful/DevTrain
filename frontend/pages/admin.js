import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'; // Fallback for local dev

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [forumPosts, setForumPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch(`${BACKEND_URL}/api/users/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch user data');
        
        const userData = await response.json();
        if (!userData.isAdmin) {
          router.push('/dashboard');
          toast.error('Access denied: Admin only');
          return;
        }

        setIsAdmin(true);
        fetchData();
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/dashboard');
      }
    };

    checkAdmin();
  }, [router]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch users, challenges, and forum posts
      const usersResponse = await fetch(`${BACKEND_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const challengesResponse = await fetch(`${BACKEND_URL}/api/challenges`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const forumResponse = await fetch(`${BACKEND_URL}/api/forum`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const [usersData, challengesData, forumData] = await Promise.all([
        usersResponse.json(),
        challengesResponse.json(),
        forumResponse.json()
      ]);

      setUsers(usersData);
      setChallenges(challengesData);
      setForumPosts(forumData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteForumPost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      console.log('Attempting to delete post:', postId);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BACKEND_URL}/api/forum/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Delete response:', { status: response.status, data });

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete post');
      }

      setForumPosts(posts => posts.filter(post => post._id !== postId));
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Delete error details:', error);
      toast.error(error.message || 'Failed to delete post');
    }
  };

  const handleAddChallenge = () => {
    router.push('/challenges/new');
  };

  const handleEditChallenge = (challengeId) => {
    router.push(`/challenges/edit/${challengeId}`);
  };

  const handleDeleteChallenge = async (challengeId) => {
    if (!confirm('Are you sure you want to delete this challenge?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Deleting challenge:', challengeId);
      
      const response = await fetch(`${BACKEND_URL}/api/challenges/${challengeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete challenge');
      }

      setChallenges(challenges => challenges.filter(c => c._id !== challengeId));
      toast.success('Challenge deleted successfully');
    } catch (error) {
      console.error('Error deleting challenge:', error);
      toast.error(error.message || 'Failed to delete challenge');
    }
  };

  if (loading || !isAdmin) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

          {/* Tabs */}
          <div className="mb-8">
            <div className="flex space-x-4 border-b border-navy-600">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'users'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-navy-100 hover:text-white'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab('challenges')}
                className={`py-2 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'challenges'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-navy-100 hover:text-white'
                }`}
              >
                Challenges
              </button>
              <button
                onClick={() => setActiveTab('forum')}
                className={`py-2 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'forum'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-navy-100 hover:text-white'
                }`}
              >
                Forum Posts
              </button>
            </div>
          </div>

          {/* Users Tab */}
          {activeTab === 'users' && (
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Users ({users.length})</h2>
              <div className="bg-navy-800/50 rounded-lg border border-navy-600/50 overflow-hidden">
                <table className="min-w-full divide-y divide-navy-600/50">
                  <thead className="bg-navy-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-navy-200 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-navy-200 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-navy-200 uppercase tracking-wider">Level</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-navy-200 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-600/50">
                    {users.map(user => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-2xl mr-2">{user.currentBadge?.image || '🎯'}</div>
                            <div className="text-sm font-medium text-white">{user.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-navy-200">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-navy-200">{user.level || 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isAdmin 
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-navy-600/50 text-navy-200'
                          }`}>
                            {user.isAdmin ? 'Admin' : 'User'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Challenges Tab */}
          {activeTab === 'challenges' && (
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Challenges ({challenges.length})</h2>
                <button
                  onClick={handleAddChallenge}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add New Challenge
                </button>
              </div>
              <div className="bg-navy-800/50 rounded-lg border border-navy-600/50 overflow-hidden">
                <table className="min-w-full divide-y divide-navy-600/50">
                  <thead className="bg-navy-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-navy-200 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-navy-200 uppercase tracking-wider">Difficulty</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-navy-200 uppercase tracking-wider">Points</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-navy-200 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-navy-200 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-600/50">
                    {challenges.map(challenge => (
                      <tr key={challenge._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                          {challenge.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            challenge.difficulty === 'easy'
                              ? 'bg-green-500/20 text-green-400'
                              : challenge.difficulty === 'medium'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {challenge.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-navy-200">
                          {challenge.points} XP
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            challenge.isActive
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {challenge.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleEditChallenge(challenge._id)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteChallenge(challenge._id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Forum Posts Tab */}
          {activeTab === 'forum' && (
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Forum Posts ({forumPosts.length})</h2>
              <div className="bg-navy-800/50 rounded-lg border border-navy-600/50 overflow-hidden">
                <table className="min-w-full divide-y divide-navy-600/50">
                  <thead className="bg-navy-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-navy-200 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-navy-200 uppercase tracking-wider">Content</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-navy-200 uppercase tracking-wider">Author</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-navy-200 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-navy-200 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-600/50">
                    {forumPosts.map(post => (
                      <tr key={post._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                          {post.title}
                        </td>
                        <td className="px-6 py-4 text-sm text-navy-200 max-w-xs truncate">
                          {post.content}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-navy-200">
                          {post.user?.name || 'Anonymous'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-navy-200">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDeleteForumPost(post._id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </div>
    </Layout>
  );
}