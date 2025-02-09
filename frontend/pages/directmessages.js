import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import Layout from '../components/Layout';
import io from 'socket.io-client';

export default function DirectMessages() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const fetcher = (url) =>
    fetch(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then((res) => res.json());

  const { data: usersData, error: usersError } = useSWR(
    'http://localhost:5000/api/users',
    fetcher
  );

  useEffect(() => {
    if (usersData) {
      const currentUserId = localStorage.getItem('userId');
      const otherUsers = usersData.filter((user) => user._id !== currentUserId);
      setUsers(otherUsers);
      setFilteredUsers(otherUsers);
    }
  }, [usersData]);

  useEffect(() => {
    if (selectedUser) {
      const currentUserId = localStorage.getItem('userId');
      fetch(`http://localhost:5000/api/messages/${currentUserId}/${selectedUser._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setMessages(data);
        })
        .catch((error) => console.error('Error loading messages:', error));
    }
  }, [selectedUser]);

  // Initialize Socket.IO only once
  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const currentUserId = localStorage.getItem('userId');
    
    console.log('Current userId from localStorage:', currentUserId); // Debug log
    
    // Redirect to login if no userId is found
    if (!currentUserId) {
      console.log('No userId found, redirecting to login...');
      window.location.href = '/login';
      return;
    }

    socketRef.current = io(backendUrl);
    console.log('Attempting socket connection to:', backendUrl);

    // Handle socket connection events
    socketRef.current.on('connect', () => {
      console.log('Socket connected with ID:', socketRef.current.id);
      console.log('About to register with userId:', currentUserId); // Debug log
      socketRef.current.emit('register', currentUserId);
      console.log('Sent registration for user:', currentUserId);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socketRef.current.on('direct message', (data) => {
      console.log("New direct message received:", data);
      setMessages((prev) => {
        if (data.from !== localStorage.getItem('userId')) {
          return [...prev, data];
        }
        return prev;
      });
    });

    return () => {
      if (socketRef.current) {
        console.log('Disconnecting socket');
        socketRef.current.disconnect();
      }
    };
  }, []); // Empty dependency array for initial setup

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    const query = e.target.value.toLowerCase();
    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    setMessages([]); // clear conversation when selecting a new user
  };

  const sendMessage = () => {
    const currentUserId = localStorage.getItem('userId');
    console.log('Sending message with userId:', currentUserId);

    if (!currentUserId) {
      console.error('No userId found, cannot send message');
      window.location.href = '/login';
      return;
    }

    if (input.trim() !== '' && selectedUser) {
      const messageData = {
        from: currentUserId,
        to: selectedUser._id,
        message: input,
        timestamp: new Date().toISOString()
      };
      
      setMessages((prev) => [...prev, messageData]);
      
      fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(messageData),
      }).catch(error => console.error('Error saving message:', error));
      
      socketRef.current.emit('direct message', messageData);
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  if (usersError)
    return (
      <Layout>
        <div>Error loading users</div>
      </Layout>
    );

  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Direct Messages</h1>
        <div className="flex">
          <div className="w-1/3 p-2 border-r">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={handleSearch}
              className="border p-2 w-full mb-4"
            />
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                onClick={() => selectUser(user)}
                className={`p-2 cursor-pointer border-b ${
                  selectedUser && selectedUser._id === user._id ? 'bg-gray-200' : ''
                }`}
              >
                {user.name}
              </div>
            ))}
          </div>
          <div className="w-2/3 p-2">
            {selectedUser ? (
              <>
                <h2 className="text-xl font-bold mb-2">
                  Chat with {selectedUser.name}
                </h2>
                <div className="h-80 overflow-y-scroll border p-2 mb-2">
                  {messages.map((msg, index) => (
                    <div key={index} className={`mb-2 ${msg.from === localStorage.getItem('userId') ? 'text-right' : 'text-left'}`}>
                      <span className="inline-block p-2 rounded bg-blue-200">{msg.message}</span>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 border p-2"
                  />
                  <button onClick={sendMessage} className="ml-2 px-4 py-2 bg-blue-600 text-white rounded">
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div>Select a user to start a conversation.</div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
