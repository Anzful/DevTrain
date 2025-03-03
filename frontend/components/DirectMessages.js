import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'; // Fallback for local dev

const DirectMessages = ({ selectedUser }) => { // Accept selectedUser as a prop
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    // Initialize socket connection with token authentication
    const token = localStorage.getItem('token');
    socketRef.current = io(BACKEND_URL, {
      auth: { token }, // Pass token for authentication
    });
    console.log('Socket connected to:', BACKEND_URL);

    if (currentUserId) {
      socketRef.current.emit('register', currentUserId);
      console.log('Registered user:', currentUserId);
    } else {
      console.warn('No userId found in localStorage');
    }

    socketRef.current.on('direct message', (data) => {
      console.log('New direct message received:', data);
      // Only add message if it's between the current user and selected user
      setMessages((prev) => {
        if (
          selectedUser && 
          ((data.from === currentUserId && data.to === selectedUser._id) ||
           (data.from === selectedUser._id && data.to === currentUserId))
        ) {
          return [...prev, data];
        }
        return prev;
      });
    });

    // Handle connection errors
    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log('Socket disconnected');
      }
    };
  }, [selectedUser, currentUserId]); // Dependencies include selectedUser and currentUserId

  // Basic render (assuming this is a minimal component)
  return (
    <div className="p-4 bg-navy-800 rounded-lg border border-navy-600/50">
      <h2 className="text-xl font-bold text-white mb-4">Direct Messages</h2>
      {selectedUser ? (
        <div>
          <p className="text-navy-100 mb-2">Chatting with: {selectedUser.name}</p>
          <div className="h-40 overflow-y-scroll border-b mb-2 p-2 bg-navy-700/50 rounded">
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <p key={index} className="mb-1 text-navy-100">
                  {msg.from === currentUserId ? 'You' : selectedUser.name}: {msg.message}
                </p>
              ))
            ) : (
              <p className="text-navy-300">No messages yet.</p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-navy-300">Select a user to start chatting.</p>
      )}
    </div>
  );
};

export default DirectMessages;