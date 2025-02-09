import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const DirectMessages = () => {
  const socketRef = useRef(null);
  const [messages, setMessages] = React.useState([]);
  const [selectedUser, setSelectedUser] = React.useState(null);

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    socketRef.current = io(backendUrl);
    console.log('Socket connected to:', backendUrl);

    const currentUserId = localStorage.getItem('userId');
    if (currentUserId) {
      socketRef.current.emit('register', currentUserId);
      console.log('Registered user:', currentUserId);
    } else {
      console.warn('No userId found in localStorage');
    }

    socketRef.current.on('direct message', (data) => {
      console.log("New direct message received:", data);
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

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log('Socket disconnected');
      }
    };
  }, [selectedUser]); // Add selectedUser as dependency

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default DirectMessages;
  