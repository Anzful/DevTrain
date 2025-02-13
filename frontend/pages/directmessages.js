import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';
import ChatWindow from '../components/ChatWindow';

export default function DirectMessages() {
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

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">Messages</h1>
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search users..."
                className="w-full bg-navy-700 border border-navy-600 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={handleSearch}
              />
              <svg 
                className="absolute left-3 top-2.5 h-5 w-5 text-navy-300"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="space-y-4">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <div
                  key={user._id}
                  className="bg-navy-800/50 rounded-lg p-4 border border-navy-600/50 flex items-center justify-between hover:bg-navy-700/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-navy-700 text-2xl">
                      {user.currentBadge?.image || '🎯'}
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{user.name}</h3>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-navy-200">Level {user.level || 1}</span>
                        <span className="text-navy-400">•</span>
                        <span className="text-navy-200">{user.experiencePoints || 0} XP</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStartChat(user)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>Message</span>
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-navy-800/50 rounded-lg border border-navy-600/50">
                <div className="text-navy-200 text-lg mb-2">
                  {searchTerm ? 'No users found matching your search' : 'No other users available'}
                </div>
                <p className="text-navy-300 text-sm">
                  {searchTerm ? 'Try a different search term' : 'Check back later for new users'}
                </p>
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