import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';
import ChatWindow from '../components/ChatWindow';

export default function DirectMessages() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }

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
  }, []);

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
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg">Loading users...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full p-2 border rounded-lg"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div className="grid gap-4">
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <div
                key={user._id}
                className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{user.currentBadge?.image || '🔰'}</div>
                  <div>
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-sm text-gray-500">
                      Level {user.level || 1}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleStartChat(user)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                >
                  Message
                </button>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
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
    </Layout>
  );
} 