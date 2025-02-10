import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';

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

        const response = await fetch('http://localhost:5000/api/users/stats', {
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
      
      // Fetch users
      const usersResponse = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Fetch challenges
      const challengesResponse = await fetch('http://localhost:5000/api/challenges', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const [usersData, challengesData] = await Promise.all([
        usersResponse.json(),
        challengesResponse.json()
      ]);

      setUsers(usersData);
      setChallenges(challengesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteForumPost = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/forum/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete post');
      
      setForumPosts(posts => posts.filter(post => post._id !== postId));
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
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
      
      const response = await fetch(`http://localhost:5000/api/challenges/${challengeId}`, {
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
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-xl">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="mb-6">
          <div className="flex space-x-4 border-b">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-4 ${activeTab === 'users' ? 'border-b-2 border-indigo-600' : ''}`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('challenges')}
              className={`py-2 px-4 ${activeTab === 'challenges' ? 'border-b-2 border-indigo-600' : ''}`}
            >
              Challenges
            </button>
            <button
              onClick={() => setActiveTab('forum')}
              className={`py-2 px-4 ${activeTab === 'forum' ? 'border-b-2 border-indigo-600' : ''}`}
            >
              Forum Posts
            </button>
          </div>
        </div>

        {activeTab === 'users' && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">Users ({users.length})</h2>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map(user => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-2xl mr-2">{user.currentBadge?.image || '🔰'}</div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.level || 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isAdmin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
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

        {activeTab === 'challenges' && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Challenges ({challenges.length})</h2>
              <button
                onClick={handleAddChallenge}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Add New Challenge
              </button>
            </div>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {challenges.map(challenge => (
                    <tr key={challenge._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {challenge.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {challenge.difficulty}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {challenge.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          challenge.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {challenge.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditChallenge(challenge._id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteChallenge(challenge._id)}
                            className="text-red-600 hover:text-red-900"
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

        {activeTab === 'forum' && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">Forum Posts</h2>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {forumPosts.map(post => (
                    <tr key={post._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {post.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {post.author.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteForumPost(post._id)}
                          className="text-red-600 hover:text-red-900"
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
    </Layout>
  );
} 