import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';
import ChatWindow from '../components/ChatWindow';
import { ChatBubbleLeftRightIcon, MagnifyingGlassIcon, UserCircleIcon, PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline';

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
      <div className="min-h-screen bg-gradient-to-br from-navy-900 to-navy-800 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-navy-800/60 rounded-xl p-6 border border-navy-600/50 shadow-lg mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
                <span className="bg-blue-500/20 text-blue-400 p-2 rounded-lg mr-3">
                  <ChatBubbleLeftRightIcon className="h-6 w-6" />
                </span>
                Messages
              </h1>
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full bg-navy-700/60 border border-navy-600/50 text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-navy-300" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <div
                  key={user._id}
                  className="bg-navy-800/60 rounded-xl p-5 border border-navy-600/50 shadow-lg hover:border-blue-500/30 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-500/30 to-indigo-600/30 border border-navy-600/50 text-2xl shadow-md">
                        {user.currentBadge?.image || '🎯'}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">{user.name}</h3>
                      <div className="flex items-center space-x-2 text-sm mt-1">
                        <span className="bg-navy-700/60 text-navy-200 px-2 py-0.5 rounded-md">
                          Level {user.level || 1}
                        </span>
                        <span className="text-navy-400">•</span>
                        <span className="flex items-center text-yellow-500 font-medium bg-yellow-500/10 px-2 py-0.5 rounded-md">
                          {user.experiencePoints || 0} XP
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStartChat(user)}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                  >
                    <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
                    <span>Message</span>
                  </button>
                </div>
              ))
            ) : (
              <div className="bg-navy-800/60 rounded-xl p-8 border border-navy-600/50 shadow-lg text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-navy-700/60 mb-4">
                  <UserCircleIcon className="h-8 w-8 text-navy-300" />
                </div>
                <div className="text-navy-100 text-lg font-medium mb-2">
                  {searchTerm ? 'No users found matching your search' : 'No other users available'}
                </div>
                <p className="text-navy-300 text-sm max-w-md mx-auto">
                  {searchTerm 
                    ? 'Try a different search term or check back later for new users' 
                    : 'As more users join the platform, they will appear here for you to connect with'}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 px-4 py-2 bg-navy-700/60 text-navy-200 rounded-lg hover:bg-navy-700 transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    <span>Clear Search</span>
                  </button>
                )}
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