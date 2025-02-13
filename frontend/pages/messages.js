import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';
import ChatWindow from '../components/ChatWindow';
import { useRouter } from 'next/router';

export default function Messages() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    // Check for token first
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        const currentUserId = localStorage.getItem('userId');
        const otherUsers = Array.isArray(data) 
          ? data.filter(user => user._id !== currentUserId)
          : [];

        setUsers(otherUsers);
        setFilteredUsers(otherUsers);
        setError(null);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users');
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [router]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    const filtered = users.filter(user => 
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term)
    );
    
    setFilteredUsers(filtered);
  };

  const handleStartChat = (user) => {
    setSelectedUser(user);
    setShowChat(true);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setSelectedUser(null);
  };

  // Render loading state
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800">
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </Layout>
    );
  }

  // Render error state
  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-red-400 bg-red-900/20 px-4 py-2 rounded">
              {error}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Main content
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Messages</h1>

          <div className="bg-navy-800/50 rounded-lg p-6 border border-navy-600/50 mb-6">
            <input
              type="text"
              placeholder="Search users..."
              className="w-full bg-navy-700 border border-navy-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <div className="space-y-4">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <div
                  key={user._id}
                  className="bg-navy-800/50 rounded-lg p-4 border border-navy-600/50 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{user.currentBadge?.image || '🎯'}</div>
                    <div>
                      <h3 className="font-medium text-white">{user.name}</h3>
                      <p className="text-sm text-navy-200">
                        Level {user.level || 1}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStartChat(user)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Message
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-navy-100">
                {searchTerm ? 'No users found matching your search' : 'No other users available'}
              </div>
            )}
          </div>

          {showChat && selectedUser && (
            <ChatWindow
              user={selectedUser}
              onClose={handleCloseChat}
            />
          )}
        </div>
      </div>
    </Layout>
  );
} 